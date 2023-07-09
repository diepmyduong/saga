import { UserEntity, UserRepository } from "@app/dal/repositories/core/user";
import { JWT_CONFIG, PermissionException, t } from "@app/shared";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { randomUUID } from "crypto";
import passwordHash from "password-hash";
import { JwtPayload, RefreshTokenPayload } from "./base";
import { AuthScopeService } from "./modules";

@Injectable()
export class CoreAuthService {
  protected logger = new Logger(this.constructor.name);
  constructor(
    protected readonly jwtService: JwtService,
    protected readonly authScopeService: AuthScopeService,
    protected readonly userRepository: UserRepository
  ) {}

  // throw same error
  get InvalidCredentialsException() {
    throw new BadRequestException(t(`Tài khoản hoặc mật khẩu không hợp lệ`));
  }

  // Authenticate by username and password
  async authenticateByPassword(
    username: string,
    password: string,
    options: {
      // allow login with email
      email?: boolean;
    } = {}
  ) {
    // match user query
    const userQuery: any = {
      $or: [{ username: username }],
    };

    // allow login with email
    if (options.email) {
      userQuery.$or.push({ email: username });
    }

    // find user by username
    const user = await this.userRepository.findOne(userQuery);

    // check user
    if (!user) {
      throw this.InvalidCredentialsException;
    }

    // check password
    const isPasswordValid = await this.verifyUserPassword(user, password);
    if (!isPasswordValid) {
      throw this.InvalidCredentialsException;
    }

    // hash scope
    const scopeHash = this.authScopeService.hashScope(user.scopes || []);

    const jwtPayload: JwtPayload = {
      userId: user._id,
      username: user.username,
      role: user.role,
      scopeHash: scopeHash,
    };

    // update last login
    await this.userRepository.updateOne({ _id: user._id }, { $set: { "times.lastLoginAt": new Date() } });

    return jwtPayload;
  }

  // verify user password
  async verifyUserPassword(user: UserEntity, password: string) {
    return await passwordHash.verify(password, user.password!);
  }

  // Get jwt token from jwt payload
  async getJwtToken(payload: JwtPayload) {
    // genrate refresh token with random password
    const randomPassword = randomUUID();
    const hashedPassword = await passwordHash.generate(randomPassword);

    const refreshToken = await this.jwtService.sign(
      { userId: payload.userId, hash: randomPassword },
      { expiresIn: JWT_CONFIG.refreshExpiresIn }
    );

    const accessToken = await this.jwtService.sign(payload, {
      expiresIn: JWT_CONFIG.signExpiresIn,
    });

    // save refresh token to user
    await this.userRepository.updateOne({ _id: payload.userId }, { refreshToken: hashedPassword });

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  // make refresh invalidate
  async invalidateRefreshToken(userId: string) {
    await this.userRepository.updateOne({ _id: userId }, { refreshToken: null });
  }

  // refresh jwt token
  async refreshJwtToken(payload: RefreshTokenPayload) {
    // validate refresh token
    const user = await this.validateRefreshToken(payload);

    // hash scope
    const scopeHash = this.authScopeService.hashScope(user.scopes || []);

    // get jwt payload
    const jwtPayload: JwtPayload = {
      userId: user._id,
      username: user.username,
      role: user.role,
      scopeHash: scopeHash,
    };

    // get jwt token
    const { accessToken, refreshToken: refreshToken } = await this.getJwtToken(jwtPayload);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: jwtPayload,
    };
  }

  // validate refresh token
  async validateRefreshToken(payload: RefreshTokenPayload) {
    const { userId, hash } = payload;
    // find user by id
    const user = await this.userRepository.findById(userId);
    if (!user || !user.refreshToken) {
      throw new PermissionException();
    }

    const passwordValid = await passwordHash.verify(hash, user.refreshToken);
    // check refresh token
    if (passwordValid === false) {
      throw new PermissionException();
    }

    return user;
  }
}

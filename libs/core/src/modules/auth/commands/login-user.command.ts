import { UserRepository } from "@app/dal";
import { BaseCommand, ForbiddenException } from "@app/shared";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { IsNotEmpty, Matches } from "class-validator";
import passwordHash from "password-hash";
import { CoreAuthService } from "../core.auth.service";
import { UserScopeService } from "../services/user-scope.service";
import { JwtPayload } from "../types";

export class LoginUserCommand extends BaseCommand {
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9]{3,30}$/, { message: `Tài khoản không hợp lệ` })
  username: string;

  @IsNotEmpty()
  @Matches(/^\S{3,30}$/, { message: `Mật khẩu không hợp lệ` })
  password: string;
}

const Exceptions = {
  InvalidCredentialsException: new ForbiddenException("1", `Tài khoản hoặc mật khẩu không hợp lệ`),
};

@CommandHandler(LoginUserCommand)
export class LoginUserHandler implements ICommandHandler<LoginUserCommand> {
  constructor(
    private authService: CoreAuthService,
    private userRepo: UserRepository,
    private scopeService: UserScopeService
  ) {}

  async execute(cmd: LoginUserCommand) {
    // validate username and password
    const jwtPayload = await this.authenticateByPassword(cmd.username, cmd.password);

    // get jwt tokenx
    const { accessToken, refreshToken, hashedRefreshToken } = await this.authService.getJwtToken(jwtPayload);

    // update refresh token
    await this.userRepo.updateOne({ _id: jwtPayload.userId }, { refreshToken: hashedRefreshToken });

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: jwtPayload,
    };
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
    const user = await this.userRepo.findOne(userQuery);

    // check user
    if (!user) {
      throw Exceptions.InvalidCredentialsException;
    }

    // check password
    const isPasswordValid = passwordHash.verify(password, user.password!);
    if (!isPasswordValid) {
      throw Exceptions.InvalidCredentialsException;
    }

    // hash scope
    const scopeHash = this.scopeService.hashScope(user.scopes || []);

    const jwtPayload: JwtPayload = {
      userId: user._id,
      username: user.username,
      role: user.role,
      scopeHash: scopeHash,
    };

    // update last login
    await this.userRepo.updateOne({ _id: user._id }, { $set: { "times.lastLoginAt": new Date() } });

    return jwtPayload;
  }
}

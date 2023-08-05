import { UserRepository } from "@app/dal";
import { BaseCommand, PermissionException } from "@app/shared";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { IsNotEmpty } from "class-validator";
import { CoreAuthService } from "../core.auth.service";
import { UserScopeService } from "../services/user-scope.service";
import { JwtPayload } from "../types";

export class RefreshUserTokenCommand extends BaseCommand {
  @IsNotEmpty()
  refreshToken: string;
}

@CommandHandler(RefreshUserTokenCommand)
export class RefreshUserTokenHandler implements ICommandHandler<RefreshUserTokenCommand> {
  constructor(
    private authService: CoreAuthService,
    private userRepo: UserRepository,
    private userScopeService: UserScopeService
  ) {}

  async execute(cmd: RefreshUserTokenCommand) {
    // validate refresh token
    const payload = await this.authService.verifyRefreshToken(cmd.refreshToken);

    // find user by id
    const user = await this.userRepo.findById(payload.userId);

    if (!user) {
      throw new PermissionException();
    }

    // hash scope
    const scopeHash = this.userScopeService.hashScope(user.scopes || []);

    // get jwt payload
    const jwtPayload: JwtPayload = {
      userId: user._id,
      username: user.username,
      role: user.role,
      scopeHash: scopeHash,
    };

    // get jwt token
    const { accessToken, refreshToken, hashedRefreshToken } = await this.authService.getJwtToken(jwtPayload);

    // update refresh token
    await this.userRepo.updateOne({ _id: jwtPayload.userId }, { refreshToken: hashedRefreshToken });

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: jwtPayload,
    };
  }
}

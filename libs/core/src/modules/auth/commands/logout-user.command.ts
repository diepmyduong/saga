import { UserCommand } from "@app/core/commands";
import { UserRepository } from "@app/dal";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

export class LogoutUserCommand extends UserCommand {}

@CommandHandler(LogoutUserCommand)
export class LogoutUserHandler implements ICommandHandler<LogoutUserCommand> {
  constructor(private userRepo: UserRepository) {}

  async execute(cmd: LogoutUserCommand) {
    // update refresh token
    this.userRepo.updateOne({ _id: cmd.userId }, { $set: { refreshToken: null } });

    return true;
  }
}

import { ApplicationCommand } from "@app/core/commands/application.command";
import { AppUserRole, ApplicationRepository } from "@app/dal";
import { ForbiddenException, NotFoundException, PermissionException } from "@app/shared";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { IsNotEmpty } from "class-validator";

export class RemoveApplicationUserCommand extends ApplicationCommand {
  @IsNotEmpty()
  email: string;
}

const Exceptions = {
  TargetUserNotFoundException: new ForbiddenException("1", "Tài khoản không có trong ứng dụng"),
  CannotRemoveOwnerException: new ForbiddenException("2", "Không thể xóa chủ sở hữu ứng dụng"),
};

@CommandHandler(RemoveApplicationUserCommand)
export class RemoveApplicationUserHandler implements ICommandHandler<RemoveApplicationUserCommand> {
  constructor(private appRepo: ApplicationRepository) {}
  async execute(cmd: RemoveApplicationUserCommand) {
    // get app info
    const app = await this.appRepo.findById(cmd.appId);
    if (!app) {
      throw new NotFoundException("Không tìm thấy ứng dụng");
    }

    // check if user is owner
    const currentUser = app.users.find((u) => u.userId?.toString() === cmd.userId.toString());
    if (!currentUser || currentUser.role !== AppUserRole.OWNER) {
      throw new PermissionException();
    }

    // find target user by email
    const targetUser = app.users.find((u) => u.email === cmd.email);
    if (!targetUser) {
      throw Exceptions.TargetUserNotFoundException;
    }
    if (targetUser.userId?.toString() === app.ownerId.toString()) {
      throw Exceptions.CannotRemoveOwnerException;
    }

    // remove user from app
    await this.appRepo.updateOne({ _id: cmd.appId }, { $pull: { users: { email: cmd.email } } });

    return "OK";
  }
}

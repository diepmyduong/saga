import { UserCommand } from "@app/core";
import { ApplicationRepository, UserRepository } from "@app/dal";
import { AppUserRole, AppUserStatus } from "@app/dal/repositories/core/application/application.interface";
import { ExecutionTime, IdUtil, NotFoundException } from "@app/shared";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { IsNotEmpty } from "class-validator";
import slugify from "slugify";

export class CreateApplicationCommand extends UserCommand {
  @IsNotEmpty()
  name: string; // Tên ứng dụng
}

@CommandHandler(CreateApplicationCommand)
export class CreateApplicationHandler implements ICommandHandler<CreateApplicationCommand> {
  constructor(private appRepo: ApplicationRepository, private userRepo: UserRepository) {}

  @ExecutionTime("Tạo ứng dụng")
  async execute(command: CreateApplicationCommand): Promise<any> {
    // generate application code from name
    const code = await this.generateCodeFromName(command.name);

    // get user info
    const user = await this.userRepo.findById(command.userId);
    if (!user) {
      throw new NotFoundException();
    }

    // save application
    const entity = await this.appRepo.create({
      code: code,
      name: command.name,
      ownerId: command.userId,
      users: [
        {
          email: user.email,
          role: AppUserRole.OWNER,
          userId: user._id,
          status: AppUserStatus.ACTIVE,
        },
      ],
    });

    return entity;
  }

  // generate code from name
  async generateCodeFromName(name: string) {
    let code = slugify(name);
    // check code is already exist
    const isExisted = await this.appRepo.count({ code: code }).then((count) => count > 0);
    if (isExisted) {
      // if code already existed, add 4 random char to code
      code += "-" + IdUtil.id(5);
    }
    return code;
  }
}

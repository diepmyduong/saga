import { UserCommand } from "@app/core";
import { ApplicationRepository } from "@app/dal";
import { IdUtil } from "@app/shared";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { IsNotEmpty } from "class-validator";
import slugify from "slugify";

export class CreateApplicationCommand extends UserCommand {
  @IsNotEmpty()
  name: string; // Tên ứng dụng
}

@CommandHandler(CreateApplicationCommand)
export class CreateApplicationHandler implements ICommandHandler<CreateApplicationCommand> {
  constructor(private appRepo: ApplicationRepository) {}

  async execute(command: CreateApplicationCommand): Promise<any> {
    // generate application code from name
    const code = await this.generateCodeFromName(command.name);

    // save application
    const entity = await this.appRepo.create({
      code: code,
      name: command.name,
      ownerId: command.userId,
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

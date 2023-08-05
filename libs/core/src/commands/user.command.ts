import { BaseCommand, IsObjectId } from "@app/shared";

export class UserCommand extends BaseCommand {
  @IsObjectId()
  userId: string;
}

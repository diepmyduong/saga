import { IsObjectId } from "@app/shared";
import { UserCommand } from "./user.command";

export class ApplicationCommand extends UserCommand {
  @IsObjectId()
  appId: string;
}

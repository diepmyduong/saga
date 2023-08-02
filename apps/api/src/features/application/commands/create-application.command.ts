import { UserCommand } from "@app/core";
import { IsNotEmpty } from "class-validator";

export class CreateApplicationCommand extends UserCommand {
  @IsNotEmpty()
  name: string; // Tên ứng dụng
}

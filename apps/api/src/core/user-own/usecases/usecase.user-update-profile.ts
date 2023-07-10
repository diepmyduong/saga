import { UserCommand } from "@app/core";
import { UserRepository } from "@app/dal";
import { BaseUsecase } from "@app/shared";
import { Injectable } from "@nestjs/common";
import { IsOptional, IsPhoneNumber } from "class-validator";

export class UserUpdateProfileCommand extends UserCommand {
  @IsOptional()
  name?: string; // Tên người dùng
  @IsOptional()
  avatar?: string; // Ảnh đại diện
  @IsPhoneNumber("VN")
  @IsOptional()
  phone?: string; // Số điện thoại
  @IsOptional()
  address?: string; // Địa chỉ
}

@Injectable()
export class UserUpdateProfileUsecase extends BaseUsecase {
  constructor(private readonly userRepository: UserRepository) {
    super();
  }
  async execute(cmd: UserUpdateProfileCommand) {
    let updateData: any = {};
    if (cmd.name) {
      updateData.name = cmd.name;
    }
    if (cmd.avatar) {
      updateData.avatar = cmd.avatar;
    }
    if (cmd.phone) {
      updateData.phone = cmd.phone;
    }
    if (cmd.address) {
      updateData.address = cmd.address;
    }

    // Update user
    const updatedUser = await this.userRepository.findByIdAndUpdate(cmd.userId, { $set: updateData });

    return updatedUser;
  }
}

import { UserCommand } from "@app/core";
import { ApplicationRepository, UserRepository } from "@app/dal";
import { AppUserStatus } from "@app/dal/repositories/core/application/application.interface";
import { ForbiddenException, NotFoundException } from "@app/shared";
import { Logger } from "@nestjs/common";

import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";
import { IsNotEmpty } from "class-validator";
export class JoinApplicationCommand extends UserCommand {
  @IsNotEmpty()
  inviteToken: string;
}

const Exceptions = {
  TokenInvalidOrExpired: new ForbiddenException("1", "Lời mời không hợp lệ hoặc đã hết hạn"),
  AppNotFound: new NotFoundException("404", "Ứng dụng không còn tồn tại"),
  InviteUserNotMatch: new ForbiddenException("2", "Tài khoản người dùng không hợp lệ"),
};

@CommandHandler(JoinApplicationCommand)
export class JointApplicationHandler implements ICommandHandler<JoinApplicationCommand> {
  private logger = new Logger(JointApplicationHandler.name);
  constructor(
    private jwtService: JwtService,
    private appRepo: ApplicationRepository,
    private userRepo: UserRepository
  ) {}
  async execute(cmd: JoinApplicationCommand) {
    // verify invite token
    try {
      const payload = this.jwtService.verify(cmd.inviteToken);
      if (!payload.invite) {
        throw Exceptions.TokenInvalidOrExpired;
      }
      // find app info
      const app = await this.appRepo.findById(payload.appId);
      if (!app) {
        throw Exceptions.AppNotFound;
      }

      // get user info
      const user = await this.userRepo.findById(cmd.userId);
      if (!user) {
        throw new NotFoundException();
      }

      // if invite token have specify email, then match it with current user emal
      if (payload.email && user.email !== payload.email) {
        throw Exceptions.InviteUserNotMatch;
      }

      /**
       * check user in user list, require invite status is inviting
       */
      const appUser = app.getUserByEmail(user.email);
      // if invite token have specify email, the invite status require is inviting
      if (payload.email && appUser && appUser.status !== AppUserStatus.INVITING) {
        throw Exceptions.TokenInvalidOrExpired;
      }

      if (!appUser) {
        // add user to list
        await this.appRepo.updateOne(
          { _id: app._id },
          {
            $push: {
              email: payload.email,
              role: payload.role,
              status: AppUserStatus.ACTIVE,
              userId: cmd.userId,
            },
          }
        );
      } else {
        // update app user status
        const userIndex = app.users.findIndex((u) => u.email === user.email);

        await this.appRepo.updateOne(
          { _id: app._id },
          {
            $set: {
              [`users.${userIndex}`]: {
                email: payload.email,
                role: payload.role,
                status: AppUserStatus.ACTIVE,
                userId: cmd.userId,
              },
            },
          }
        );
      }

      return {
        appId: app._id,
      };
    } catch (err) {
      throw Exceptions.TokenInvalidOrExpired;
    }
  }
}

import { ApplicationCommand } from "@app/core/commands/application.command";
import { ApplicationRepository } from "@app/dal";
import { AppUserRole, AppUserStatus } from "@app/dal/repositories/core/application/application.interface";
import { DOMAIN, ForbiddenException, NotFoundException } from "@app/shared";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";
import { IsEmail, IsIn, IsOptional } from "class-validator";

export class InviteApplicationUserCommand extends ApplicationCommand {
  @IsIn(Object.values(AppUserRole))
  role: string;
  @IsEmail()
  @IsOptional()
  email?: string;
}

const Exceptions = {
  EmailAlreadyInvited: new ForbiddenException("1", "Email đã có trong ứng dụng"),
};

@CommandHandler(InviteApplicationUserCommand)
export class InviteApplicationUserHandler implements ICommandHandler<InviteApplicationUserCommand> {
  constructor(private appRepo: ApplicationRepository, private jwtService: JwtService) {}

  async execute(cmd: InviteApplicationUserCommand) {
    // get app info
    const app = await this.appRepo.findById(cmd.appId);
    if (!app) {
      throw new NotFoundException();
    }

    /**
     * if command invite specify email
     * then add email to user list with inviting status
     */
    if (cmd.email) {
      // check email already in user list
      const user = await app.users.find((u) => u.email == cmd.email);
      if (user && user.status !== AppUserStatus.INVITING) {
        throw Exceptions.EmailAlreadyInvited;
      }

      if (!user) {
        // add email to user list
        await this.appRepo.updateOne(
          { _id: app._id },
          {
            $push: {
              users: {
                email: cmd.email,
                status: AppUserStatus.INVITING,
                role: cmd.role,
              },
            },
          }
        );
      }
    }

    // generate invite token
    const token = this.jwtService.sign(
      {
        invite: true,
        appId: app._id,
        email: cmd.email,
        role: cmd.role,
      },
      { expiresIn: "7d" }
    );
    const acceptUrl = `${DOMAIN}/join_app?token=${token}`;

    //TODO: send invite email

    return {
      token: token,
      acceptUrl: acceptUrl,
    };
  }
}

import { UserRepository, UserRolesEnum } from "@app/dal";
import { BaseCommand, ForbiddenException } from "@app/shared";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { IsEmail, IsNotEmpty, Length, Matches } from "class-validator";
import passwordHash from "password-hash";

export class RegisterUserCommand extends BaseCommand {
  @IsEmail()
  email: string;

  @Matches(/^[a-zA-Z0-9]+$/) // only alphanumeric characters
  @Length(3, 20) // min and max length
  @IsNotEmpty()
  username: string;

  @Length(6, 20) // min and max length
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  name: string;
}

const Exceptions = {
  CredentialsAlreadyExists: new ForbiddenException("1", "Credentials already exists"),
};

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand> {
  constructor(private userRepo: UserRepository) {}

  async execute(command: RegisterUserCommand) {
    // check if user already exists
    const isEmailExists = await this.userRepo.findOne({ email: command.email });
    if (isEmailExists) {
      throw Exceptions.CredentialsAlreadyExists;
    }
    // check if username already exists
    const isUsernameExists = await this.userRepo.findOne({ username: command.username });
    if (isUsernameExists) {
      throw Exceptions.CredentialsAlreadyExists;
    }
    // hash password
    const hashedPassword = passwordHash.generate(command.password);

    // create user
    const user = await this.userRepo.create({
      email: command.email,
      username: command.username,
      password: hashedPassword,
      name: command.name,
      role: UserRolesEnum.USER,
    });

    //TODO: send email

    return user;
  }
}

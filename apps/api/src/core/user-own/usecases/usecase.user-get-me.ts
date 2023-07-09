import { UserCommand } from "@app/core";
import { UserRepository, UserRolesEnum as UserRoleEnum } from "@app/dal";
import { BaseUsecase, PermissionException } from "@app/shared";
import { Injectable, InternalServerErrorException, OnModuleInit } from "@nestjs/common";
import { existsSync, readFileSync } from "fs";

@Injectable()
export class UserGetMeUsecase extends BaseUsecase implements OnModuleInit {
  private _scopes: string[] = [];
  constructor(private readonly userRepo: UserRepository) {
    super();
  }

  async onModuleInit() {
    // load all scopes from files
    await this.loadScopes();
  }

  // load all scopes from files
  private async loadScopes() {
    const scopeFile = "config/scopes.json";
    if (existsSync(scopeFile) === false) {
      throw new InternalServerErrorException("Scopes file not found on path " + scopeFile);
    }
    // read json
    const json = JSON.parse(readFileSync(scopeFile, "utf8"));

    // parse json
    const scopes = Object.keys(json);
    this._scopes = scopes;
  }

  async execute(cmd: UserCommand) {
    // get user by id
    const user = await this.userRepo.findById(cmd.userId);

    if (!user) {
      throw new PermissionException();
    }
    // if user role is ADMIN, then return full scopes
    if (user.role === UserRoleEnum.ADMIN) {
      user.scopes = this._scopes;
    }

    // return user
    return user;
  }
}

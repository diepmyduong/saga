/**
 * @description: Init Admin User depend on the environment
 */
import { UserRepository, UserRolesEnum } from "@app/dal";
import { AUTH_CONFIG } from "@app/shared";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import passwordHash from "password-hash";

@Injectable()
export class AdminUserService implements OnModuleInit {
  private logger = new Logger(AdminUserService.name);
  constructor(private readonly userRepo: UserRepository) {}

  async onModuleInit() {
    // init admin user
    await this.initAdminUser();
  }

  // init admin user depend on the environment
  private async initAdminUser() {
    // check admin user is existed
    const adminUser = await this.userRepo.findOne({
      username: AUTH_CONFIG.admin.username,
    });

    // skip init admin user if it's existed
    if (adminUser) {
      return;
    }

    // create admin user if it's not existed
    const user = await this.createAdminUser();

    // log admin user created
    this.logger.warn(`Admin user created successfully. Username: ${user.username}`);
  }

  // create admin user
  private async createAdminUser() {
    // hash password
    const hashedPassword = passwordHash.generate(AUTH_CONFIG.admin.password);
    // create admin user
    const user = await this.userRepo.create({
      code: AUTH_CONFIG.admin.username,
      username: AUTH_CONFIG.admin.username,
      password: hashedPassword,
      name: AUTH_CONFIG.admin.username,
      email: AUTH_CONFIG.admin.email,
      role: UserRolesEnum.ADMIN,
      scopes: [],
    });

    return user;
  }
}

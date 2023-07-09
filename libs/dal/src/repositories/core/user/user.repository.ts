import { Inject } from "@nestjs/common";
import { Model } from "mongoose";

import { ModelProviderFactory } from "@app/dal/database";
import { BaseRepository } from "../../repository.base";
import { UserDbModel, UserEntity } from "./user.entity";
import { UserSchema } from "./user.schema";

const USER_MODEL = "USER_MODEL";

export const UserModelProvider = ModelProviderFactory.createModelProvider(USER_MODEL, "User", UserSchema);

export class UserRepository extends BaseRepository<UserDbModel, UserEntity> {
  constructor(@Inject(USER_MODEL) private userModel: Model<UserDbModel>) {
    super(userModel, UserEntity);
  }
}

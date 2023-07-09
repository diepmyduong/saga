import { UserEntity, UserRepository } from "@app/dal";
import { ResourceEnum } from "apps/api/src/shared";
import { Catalog } from "../../api.catalog.dto";
import { BaseCatalogProvider } from "../catalog-provider";
import { CatalogProvider } from "../catalog-provider.decorator";

@CatalogProvider(ResourceEnum.USER)
export class UserCatalogProvider extends BaseCatalogProvider<UserEntity> {
  constructor(private readonly userRepo: UserRepository) {
    super();
  }

  get repository(): UserRepository {
    return this.userRepo;
  }

  transform(data: UserEntity): Catalog {
    return {
      id: data._id,
      label: data.name,
      value: data._id,
      image: data.avatar,
    };
  }

  protected selectFields(): string | undefined {
    return `_id name avatar`;
  }
}

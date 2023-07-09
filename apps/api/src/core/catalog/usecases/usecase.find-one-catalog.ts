import { UserCommand } from "@app/core";
import { BaseUsecase, IsObjectId } from "@app/shared";
import { Injectable } from "@nestjs/common";
import { IsNotEmpty } from "class-validator";
import { CatalogProviderFactory } from "../provider";

export class FindOneCatalogCommand extends UserCommand {
  @IsNotEmpty()
  resource: string;

  @IsObjectId()
  id: string;
}

@Injectable()
export class FindOneCatalogUsecase extends BaseUsecase {
  constructor(private readonly catalogProviderFactory: CatalogProviderFactory) {
    super();
  }

  // get pagination catalog
  async execute(cmd: FindOneCatalogCommand) {
    // get provider
    const provider = this.catalogProviderFactory.getProvider(cmd.resource);
    // find one
    return await provider.findOne(cmd.id);
  }
}

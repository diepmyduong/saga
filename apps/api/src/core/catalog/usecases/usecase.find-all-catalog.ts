import { UserCommand } from "@app/core";
import { BaseUsecase, FindAllQueryInput } from "@app/shared";
import { Injectable } from "@nestjs/common";
import { IsNotEmpty, IsOptional } from "class-validator";
import { CatalogProviderFactory } from "../provider";

export class FindAllCatalogCommand extends UserCommand {
  @IsNotEmpty()
  resource: string;

  @IsOptional()
  query?: FindAllQueryInput;
}

@Injectable()
export class FindAllCatalogUsecase extends BaseUsecase {
  constructor(private readonly catalogProviderFactory: CatalogProviderFactory) {
    super();
  }

  // get pagination catalog
  async execute(cmd: FindAllCatalogCommand) {
    // get provider
    const provider = this.catalogProviderFactory.getProvider(cmd.resource);
    // find all
    return await provider.findAll(cmd.query || {});
  }
}

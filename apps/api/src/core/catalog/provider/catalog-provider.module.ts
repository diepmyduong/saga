import { DiscoveryModule } from "@app/core";
import { Module } from "@nestjs/common";
import { CatalogProviderFactory } from "./catalog-provider.factory";
import { Providers } from "./providers";

@Module({
  imports: [DiscoveryModule],
  providers: [...Providers, CatalogProviderFactory],
  exports: [CatalogProviderFactory],
})
export class ApiCatalogProviderModule {}

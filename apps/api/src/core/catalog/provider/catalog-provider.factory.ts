import { DiscoveryService } from "@app/core";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { ICatalogProvider } from "./catalog-provider";
import { CATALOG_PROVIDER_META, CatalogProviderMetadata } from "./catalog-provider.decorator";

@Injectable()
export class CatalogProviderFactory implements OnModuleInit {
  private _providerMap: Record<string, ICatalogProvider> = {};

  constructor(private readonly discoveryService: DiscoveryService) {}

  async onModuleInit() {
    // extract all providers
    const providers = await this.extractProviders();
    // build provider map
    this._providerMap = providers.reduce((acc, p) => {
      acc[p.resource] = p.provider;
      return acc;
    }, this._providerMap);
  }

  // extract all providers with @CatalogProvider decorator
  // and return them as an array
  async extractProviders(): Promise<
    {
      resource: string;
      provider: ICatalogProvider;
    }[]
  > {
    const providers = await this.discoveryService.providersWithMetaAtKey<CatalogProviderMetadata>(
      CATALOG_PROVIDER_META
    );

    return providers.map((p) => {
      return {
        resource: p.meta.resource,
        provider: p.discoveredClass.instance as ICatalogProvider,
      };
    });
  }

  // get provider by resource name
  getProvider(resource: string): ICatalogProvider {
    const provider = this._providerMap[resource];
    if (!provider) {
      throw new Error(`No provider found for resource ${resource}`);
    }
    return provider;
  }
}

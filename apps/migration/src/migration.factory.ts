import { DiscoveryService } from "@app/core";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import _ from "lodash";

import { IMigrationMeta, MIGRATION_META } from "./common";
import { IMigration } from "./interfaces/interface.migration";

interface IMigrationWrapper {
  key: string;
  provider: IMigration;
  debug: boolean;
}

@Injectable()
export class MigrationFactory implements OnModuleInit {
  private _providerMap: Record<string, IMigrationWrapper> = {};
  private logger = new Logger(MigrationFactory.name);

  constructor(private readonly discoveryService: DiscoveryService) {}

  async onModuleInit() {
    this.logger.log("Initializing migration factory");
    // extract all providers
    const providers = await this.extractProviders();
    // build provider map
    this._providerMap = providers.reduce((acc, p) => {
      acc[p.key] = { key: p.key, provider: p.provider, debug: p.debug };
      return acc;
    }, this._providerMap);

    this.logger.log(`Found ${providers.length} migrations`);
  }

  // extract all providers with @CatalogProvider decorator
  // and return them as an array
  async extractProviders(): Promise<IMigrationWrapper[]> {
    const providers = await this.discoveryService.providersWithMetaAtKey<IMigrationMeta>(MIGRATION_META);

    return providers.map((p) => {
      return {
        key: p.discoveredClass.name,
        provider: p.discoveredClass.instance as IMigration,
        debug: p.meta.debug,
      };
    });
  }

  // get provider by resource name
  getHandler(name: string): IMigration {
    const provider = this._providerMap[name];
    if (!provider) {
      throw new Error(`No provider found for migration ${name}`);
    }
    return provider.provider;
  }

  // get all shorted providers
  getHandlers(): IMigrationWrapper[] {
    return _.sortBy(Object.values(this._providerMap), (p) => p.key);
  }
}

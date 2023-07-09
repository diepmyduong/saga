import { Injectable, InternalServerErrorException, Logger, OnModuleInit } from "@nestjs/common";
import _ from "lodash";

import { DiscoveryService } from "@app/core";
import { RESOLVER_NAME_METADATA, RESOLVER_TYPE_METADATA } from "@nestjs/graphql";
import { RESOURCE_META } from "../auth";
import { DiscoveredClassWithMeta, ResolverAction, ResourceProviderWrapper } from "./resource-discovery.interface";

@Injectable()
export class ResourceDiscoveryService implements OnModuleInit {
  private logger = new Logger(this.constructor.name);
  private _resourceProviders: ResourceProviderWrapper[] = [];
  constructor(private readonly discoveryService: DiscoveryService) {}

  async onModuleInit() {
    await this.extractResourceProviders();
  }

  private async extractResourceProviders() {
    const providers = await this.discoveryService.providersWithMetaAtKey(RESOURCE_META);
    this._resourceProviders = providers.reduce((acc, p) => {
      const resource = _.get(p, "meta.resource");
      const resourceDesc = _.get(p, "meta.desc");
      if (!resource) return acc;
      const resolverActions = this.resolverActions(p);

      const existing = acc.find((x) => x.resource === resource);
      if (existing) {
        existing.providers.push(p.discoveredClass);
        // if resource description is empty then use the new one
        if (!existing.resourceDesc) {
          existing.resourceDesc = resourceDesc;
        }
        // check if action already exists
        resolverActions.forEach((a) => {
          const existingAction = existing.actions.find((x) => x.action === a.action);
          if (existingAction) {
            // throw error if resolver name or type is different
            throw new InternalServerErrorException(
              `Duplicate action ${a.action} on resource ${resource}. Class ${p.discoveredClass.name}`
            );
          } else {
            existing.actions.push(a);
          }
        });
      } else {
        acc.push({
          resource,
          resourceDesc,
          providers: [p.discoveredClass],
          actions: [...resolverActions],
        });
      }

      return acc;
    }, [] as ResourceProviderWrapper[]);

    // summary of resource providers
    const providersCount = this._resourceProviders.length;
    const actionsCount = _.sumBy(this._resourceProviders, (x) => x.actions.length);

    this.logger.log(`Loaded ${providersCount} resource with ${actionsCount} actions`);
  }

  private resolverActions(p: DiscoveredClassWithMeta<unknown>) {
    return this.discoveryService.classMethodsWithMetaAtKey(p.discoveredClass, RESOLVER_NAME_METADATA).map((m) => {
      const resovlerName: string = Reflect.getMetadata(RESOLVER_NAME_METADATA, m.discoveredMethod.handler);
      const resolverType: string = Reflect.getMetadata(RESOLVER_TYPE_METADATA, m.discoveredMethod.handler);
      return {
        type: "resolver",
        action: m.discoveredMethod.methodName,
        resolverName: resovlerName,
        resolverType: resolverType,
        instance: m.discoveredMethod,
      } as ResolverAction;
    });
  }

  get resourceProviders() {
    return this._resourceProviders;
  }

  resource(resource: string) {
    return this._resourceProviders.find((x) => x.resource === resource);
  }

  actions(resource: string) {
    const res = this.resource(resource);
    return res?.actions;
  }
}

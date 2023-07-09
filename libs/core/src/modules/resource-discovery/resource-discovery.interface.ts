import { Type } from '@nestjs/common';

export interface DiscoveredModule<T = object> {
  name: string;
  instance: T;
  // eslint-disable-next-line @typescript-eslint/ban-types
  injectType?: Function | Type<any>;
  dependencyType: Type<T>;
}

export interface DiscoveredClass extends DiscoveredModule {
  parentModule: DiscoveredModule;
}

export interface DiscoveredMethod {
  handler: (...args: any[]) => any;
  methodName: string;
  parentClass: DiscoveredClass;
}

export interface DiscoveredMethodWithMeta<T> {
  discoveredMethod: DiscoveredMethod;
  meta: T;
}

export interface DiscoveredClassWithMeta<T> {
  discoveredClass: DiscoveredClass;
  meta: T;
}

export type MetaKey = string | number | symbol;

export type Filter<T> = (item: T) => boolean;

export type ResourceProviderWrapper = {
  resource: string;
  resourceDesc?: string;
  providers: DiscoveredClass[];
  actions: (ResourceAction | ResolverAction)[];
};

export type ResourceAction = {
  action: string;
  type: 'resolver' | 'controller';
  instance: DiscoveredMethod;
};

export type ResolverAction = ResourceAction & {
  type: 'resolver';
  resolverName: string;
  resolverType: string;
};

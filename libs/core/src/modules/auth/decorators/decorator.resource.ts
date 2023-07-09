import { SetMetadata } from "@nestjs/common";

export const RESOURCE_META = "resource";

export interface ResourceMeta {
  resource: string;
  desc?: string;
}

export const Resource = (resource: string, options?: { description?: string }) => {
  return SetMetadata<string, ResourceMeta>(RESOURCE_META, {
    resource: resource,
    desc: options?.description,
  });
};

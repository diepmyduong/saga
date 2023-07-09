import { SetMetadata } from '@nestjs/common';
import { ResourceEnum } from 'apps/api/src/shared';

export const CATALOG_PROVIDER_META = 'calalog:provider';

export type CatalogProviderMetadata = {
  resource: string;
};

export const CatalogProvider = (resource: ResourceEnum) => {
  return SetMetadata(CATALOG_PROVIDER_META, {
    resource,
  });
};

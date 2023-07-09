import { Module } from '@nestjs/common';
import { ApiCatalogResolver } from './api.catalog.resolver';
import { ApiCatalogProviderModule } from './provider';
import { FindAllCatalogUsecase, FindOneCatalogUsecase } from './usecases';

@Module({
  imports: [ApiCatalogProviderModule],
  providers: [ApiCatalogResolver, FindAllCatalogUsecase, FindOneCatalogUsecase],
  exports: [ApiCatalogResolver],
})
export class ApiCatalogModule {}

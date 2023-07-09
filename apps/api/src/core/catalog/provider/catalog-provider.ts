import { BaseRepository } from "@app/dal";
import { BaseEntity, FindAllQueryInput } from "@app/shared";
import { Catalog, CatalogEdge } from "../api.catalog.dto";
import { CATALOG_PROVIDER_META } from "./catalog-provider.decorator";

export interface ICatalogProvider {
  // find all catalog and pagination
  findAll(query: FindAllQueryInput): Promise<CatalogEdge>;
  // find one catalog by id
  findOne(id: string): Promise<Catalog>;
  // can handle resource
  canHandle(resource: string): boolean;
}

export abstract class BaseCatalogProvider<T extends BaseEntity> implements ICatalogProvider {
  constructor() {}

  abstract get repository(): BaseRepository<any, any>;

  async findAll(query: FindAllQueryInput): Promise<CatalogEdge> {
    const { data, pagination } = await this.repository.findWithPagination({
      filter: this.filter(query),
      page: query.page,
      limit: query.limit,
      sort: this.sort(query),
      search: query.search,
      select: this.selectFields(),
    });
    return {
      data: data.map(this.transform),
      pagination: pagination,
    };
  }

  protected sort(query: FindAllQueryInput): any {
    return query.order;
  }

  protected filter(query: FindAllQueryInput): any {
    return query.filter;
  }

  protected selectFields(): string | undefined {
    return "_id name code";
  }

  async findOne(id: string): Promise<Catalog> {
    const data = await this.repository.findById(id, this.selectFields());
    return this.transform(data);
  }

  canHandle(resource: string): boolean {
    const meta = Reflect.getMetadata(CATALOG_PROVIDER_META, this);
    if (!meta) return false;
    return meta.resource === resource;
  }

  abstract transform(data: T): Catalog;
}

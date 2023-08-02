import { BaseRepository } from "@app/dal";
import { FindAllArgs } from "@app/shared";
import { Logger, Type } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { BaseObject } from "apps/api/src/shared";

export function BaseCRUDResolver<
  Entity extends BaseObject,
  CreateDto extends Type<unknown>,
  UpdateDto extends Type<unknown>,
  EdgesType extends Type<unknown>
>(
  entity: Type<Entity>,
  options: {
    createDto?: CreateDto;
    updateDto?: UpdateDto;
    edgesType?: EdgesType;
    removeable?: boolean;
  } = {}
): any {
  const resourceName = entity.name.replace("Entity", "");
  const { createDto, updateDto, edgesType, removeable = true } = options;

  @Resolver(() => entity, { isAbstract: true })
  abstract class BaseHost {
    protected readonly logger = new Logger(this.constructor.name);

    constructor(protected readonly repository: BaseRepository<any, Entity>) {}

    @Query(() => entity, { name: "findOne" + resourceName })
    findOne(@Args("id") id: string) {
      return this.repository.findById(id).then((res) => {
        if (!res) throw new Error("Not found");
        return res;
      });
    }
  }

  let CRUDResolver = BaseHost;

  if (edgesType) {
    class FindAllResolver extends CRUDResolver {
      @Query(() => edgesType, { name: `findAll` + resourceName })
      async findAll(@Args() options: FindAllArgs) {
        const { page = 1, limit = 20, filter, order, search } = options?.query || {};

        const { data, pagination } = await this.repository.findWithPagination({
          filter: filter,
          page: page,
          limit: limit,
          sort: order,
          search: search,
        });

        return {
          data: data,
          pagination: pagination,
        };
      }
    }

    CRUDResolver = FindAllResolver;
  }

  if (createDto) {
    class CreateResolver extends CRUDResolver {
      @Mutation(() => entity, { name: "create" + resourceName })
      create(@Args(`data`, { type: () => createDto }) data: CreateDto) {
        return this.repository.create(data as any).catch((err) => {
          this.logger.error(err);
          throw err;
        });
      }
    }

    CRUDResolver = CreateResolver;
  }

  if (updateDto) {
    class UpdateResolver extends CRUDResolver {
      @Mutation(() => entity, { name: "update" + resourceName })
      update(@Args("id") id: string, @Args(`data`, { type: () => updateDto }) data: UpdateDto) {
        return this.repository.findByIdAndUpdate(id, data as any).then((res) => {
          if (!res) throw new Error("Not found");
          return res;
        });
      }
    }
    CRUDResolver = UpdateResolver;
  }

  if (removeable) {
    class RemoveResolver extends CRUDResolver {
      @Mutation(() => Int, { name: "remove" + resourceName })
      remove(@Args("id") id: string) {
        return this.repository.deleteOne({ _id: id }).then((res) => {
          return res.deletedCount;
        });
      }
    }
    CRUDResolver = RemoveResolver;
  }

  return CRUDResolver;
}

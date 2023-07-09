/* eslint-disable @typescript-eslint/no-explicit-any */
import { DalException, LRUCacheMap } from "@app/shared";
import { ClassConstructor, plainToInstance } from "class-transformer";
import DataLoader from "dataloader";
import _ from "lodash";
import { FilterQuery, Model, ProjectionType, Types, UpdateQuery } from "mongoose";

export abstract class BaseRepository<T_DBModel, T_MappedEntity, T_Enforcement = object> {
  public _model: Model<T_DBModel>;
  private dataloaderMap: Record<string, DataLoader<string, T_MappedEntity | null>> = {};

  constructor(protected MongooseModel: Model<T_DBModel>, protected entity: ClassConstructor<T_MappedEntity>) {
    this._model = MongooseModel;
  }

  // setup dataloader
  protected setupDataLoader(select?: string) {
    const loader = new DataLoader(
      (ids: string[]) => {
        const query = this.MongooseModel.find({ _id: { $in: ids } }).lean();
        if (select) {
          query.select(select);
        }
        return query.exec().then((list) => {
          const listByKey = _.keyBy(list, "_id");
          return ids.map((id) => {
            const item = listByKey[id];
            return item ? this.mapEntity(item) : null;
          });
        });
      },
      { cacheMap: LRUCacheMap(), cache: true } // Giới hạn chỉ cache 100 item sử dụng nhiêu nhất.
    );
    return loader;
  }

  // get dataloader by select
  private getDataloader(select?: string) {
    if (!this.dataloaderMap[select || "default"]) {
      this.dataloaderMap[select || "default"] = this.setupDataLoader(select);
    }
    return this.dataloaderMap[select || "default"];
  }

  // load id by dataloader
  async load(id: string, select?: string): Promise<T_MappedEntity | null> {
    return this.getDataloader(select).load(id);
  }

  // load many id by dataloader
  async loadMany(ids: string[], select?: string): Promise<(T_MappedEntity | null)[]> {
    return this.getDataloader(select)
      .loadMany(ids)
      .then((list) =>
        list.map((item) => {
          if (item instanceof Error) return null;
          return item;
        })
      );
  }

  // load many id by dataloader & compact result
  async loadManyCompact(ids: string[], select?: string): Promise<T_MappedEntity[]> {
    return this.loadMany(ids, select).then((list) => _.compact(list));
  }

  // clear loader cache
  clearCache(id: string) {
    // loop all dataloader and clear cache
    Object.keys(this.dataloaderMap).forEach((key) => {
      this.dataloaderMap[key].clear(id);
    });
  }

  // clear all loader cache
  clearAllCache() {
    // loop all dataloader and clear cache
    Object.keys(this.dataloaderMap).forEach((key) => {
      this.dataloaderMap[key].clearAll();
    });
  }

  public static createObjectId() {
    return new Types.ObjectId().toString();
  }

  protected convertObjectIdToString(value: Types.ObjectId): string {
    return value.toString();
  }

  protected convertStringToObjectId(value: string): Types.ObjectId {
    return new Types.ObjectId(value);
  }

  async count(query?: FilterQuery<T_DBModel> & T_Enforcement, limit?: number): Promise<number> {
    return this.MongooseModel.countDocuments(query || {}, {
      limit,
    });
  }

  async aggregate(
    query: any[],
    options: {
      readPreference?: "secondaryPreferred" | "primary";
      allowDiskUse?: boolean;
    } = {}
  ): Promise<any> {
    return await this.MongooseModel.aggregate(query)
      .read(options.readPreference || "primary")
      .allowDiskUse(options.allowDiskUse || false);
  }

  async findById(id: string, select?: string): Promise<T_MappedEntity | null> {
    const data = await this.MongooseModel.findById(id, select);
    if (!data) return null;
    return this.mapEntity(data.toObject());
  }

  async findOne(
    query: FilterQuery<T_DBModel> & T_Enforcement,
    select?: ProjectionType<T_MappedEntity>,
    options: { readPreference?: "secondaryPreferred" | "primary" } = {}
  ): Promise<T_MappedEntity | null> {
    const data = await this.MongooseModel.findOne(query, select).read(options.readPreference || "primary");
    if (!data) return null;

    return this.mapEntity(data.toObject());
  }

  async deleteOne(query: FilterQuery<T_DBModel> & T_Enforcement) {
    return await this.MongooseModel.deleteOne(query);
  }

  async deleteMany(query: FilterQuery<T_DBModel> & T_Enforcement) {
    return await this.MongooseModel.deleteMany(query);
  }

  async find(
    query: FilterQuery<T_DBModel> & T_Enforcement,
    select: ProjectionType<T_MappedEntity> = "",
    options: { limit?: number; sort?: any; skip?: number } = {}
  ): Promise<T_MappedEntity[]> {
    const data = await this.MongooseModel.find(query, select, {
      sort: options.sort || null,
    })
      .skip(options.skip as number)
      .limit(options.limit as number)
      .lean()
      .exec();

    return this.mapEntities(data);
  }

  findCursor(
    query: FilterQuery<T_DBModel> & T_Enforcement,
    select: ProjectionType<T_MappedEntity> = "",
    options: { limit?: number; sort?: any; skip?: number } = {}
  ) {
    const findQuery = this.MongooseModel.find(query, select, {
      sort: options.sort || null,
    });
    // if (options.skip) {
    //   findQuery.skip(options.skip);
    // }
    // if (options.limit) {
    //   findQuery.limit(options.limit);
    // }
    return findQuery.cursor();
  }

  async findWithPagination(
    options: {
      filter?: FilterQuery<T_DBModel> & T_Enforcement;
      limit?: number;
      sort?: any;
      page?: number;
      search?: string;
      disableTextSearch?: boolean;
      textSearchField?: string;
      select?: string | string[];
    } = {}
  ): Promise<{
    data: T_MappedEntity[];
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  }> {
    const mongoQuery = this.MongooseModel.find();
    const query = options.filter || {};
    // hanlde full text search options
    if (options.search) {
      // if disableTextSearch is true, we will use the textSearchField to search
      if (options.disableTextSearch && options.textSearchField) {
        _.set(query, options.textSearchField, options.search);
      } else {
        // if disableTextSearch is false, we will use the default text search
        if (options.search.includes(" ")) {
          _.set(query, "$text.$search", options.search);
          mongoQuery.select({ _score: { $meta: "textScore" } });
          mongoQuery.sort({ _score: { $meta: "textScore" } });
        } else {
          // if search is not a phrase, we will use regex to search
          const textSearchIndex = this.MongooseModel.schema
            .indexes()
            .filter((c: any) => _.values(c[0]!).some((d: any) => d == "text"));
          if (textSearchIndex.length > 0) {
            const or: any[] = [];
            /** Replace regular expression */
            const cleanSeach = options.search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
            textSearchIndex.forEach((index) => {
              Object.keys(index[0]!).forEach((key) => {
                or.push({ [key]: { $regex: cleanSeach, $options: "i" } });
              });
            });
            _.set(query, "$or", or);
          }
        }
      }
    }

    // handle sort options
    if (options.sort) {
      mongoQuery.sort(options.sort);
    }

    // handle filter options
    const filter = JSON.parse(JSON.stringify(query).replace(/\"(\_\_)(\w+)\"\:/g, `"$$$2":`));
    mongoQuery.setQuery({ ...filter });

    // count total
    const countQuery = this.MongooseModel.find().merge(mongoQuery);

    // handle pagination options
    const limit = options.limit || 10;
    const skip = options.page && options.page > 0 ? (options.page - 1) * limit : 0;

    mongoQuery.limit(limit);
    mongoQuery.skip(skip);

    // handle select options
    if (options.select) {
      mongoQuery.select(options.select);
    }

    // exec query
    return await Promise.all([mongoQuery.exec(), countQuery.count()]).then((res) => {
      return {
        data: this.mapEntities(res[0]),
        pagination: {
          page: options.page || 1,
          pageSize: limit,
          limit: limit,
          total: res[1] >= 0 ? res[1] : 0,
        },
      };
    });
  }

  async *findBatch(
    query: FilterQuery<T_DBModel> & T_Enforcement,
    select = "",
    options: { limit?: number; sort?: any; skip?: number } = {},
    batchSize = 500
  ) {
    for await (const doc of this._model
      .find(query, select, {
        sort: options.sort || null,
      })
      .batchSize(batchSize)
      .cursor()) {
      yield this.mapEntity(doc);
    }
  }

  async create(data: FilterQuery<T_DBModel> & T_Enforcement) {
    const newEntity = new this.MongooseModel(data);
    const saved = await newEntity.save();

    return this.mapEntity(saved);
  }

  async insertMany(
    data: FilterQuery<T_DBModel> & T_Enforcement[],
    ordered = false
  ): Promise<{
    acknowledged: boolean;
    insertedCount: number;
    insertedIds: Types.ObjectId[];
  }> {
    let result;
    try {
      result = await this.MongooseModel.insertMany(data, { ordered });
    } catch (e) {
      throw new DalException(e.message);
    }

    const insertedIds = result.map((inserted) => inserted._id);

    return {
      acknowledged: true,
      insertedCount: result.length,
      insertedIds,
    };
  }

  async updateMany(
    query: FilterQuery<T_DBModel> & T_Enforcement,
    updateBody: UpdateQuery<T_DBModel>
  ): Promise<{
    matched: number;
    modified: number;
  }> {
    const saved = await this.MongooseModel.updateMany(query, updateBody, {
      multi: true,
    });

    return {
      matched: saved.matchedCount,
      modified: saved.modifiedCount,
    };
  }

  async updateOne(query: FilterQuery<T_DBModel> & T_Enforcement, updateBody: UpdateQuery<T_DBModel>) {
    const result = await this.MongooseModel.updateOne(query, updateBody);
    return {
      matched: result.matchedCount,
      modified: result.modifiedCount,
    };
  }

  async findOneAndUpdate(
    query: FilterQuery<T_DBModel> & T_Enforcement,
    updateBody: UpdateQuery<T_DBModel>,
    options: { upsert?: boolean; new?: boolean } = {}
  ) {
    const saved = await this.MongooseModel.findOneAndUpdate(query, updateBody, options);

    return this.mapEntity(saved);
  }

  async findByIdAndUpdate(id: string, updateBody: UpdateQuery<T_DBModel>) {
    const saved = await this.MongooseModel.findByIdAndUpdate(id, updateBody, {
      new: true,
    });
    if (!saved) {
      throw new DalException("Not found");
    }
    return this.mapEntity(saved);
  }

  async upsertMany(data: (FilterQuery<T_DBModel> & T_Enforcement)[]) {
    const promises = data.map((entry) => this.MongooseModel.findOneAndUpdate(entry, entry, { upsert: true }));

    return await Promise.all(promises);
  }

  async bulkWrite(bulkOperations: any) {
    await this.MongooseModel.bulkWrite(bulkOperations);
  }

  protected mapEntity<TData>(data: TData): TData extends null ? null : T_MappedEntity {
    return plainToInstance(this.entity, JSON.parse(JSON.stringify(data))) as any;
  }

  protected mapEntities(data: any): T_MappedEntity[] {
    return plainToInstance<T_MappedEntity, T_MappedEntity[]>(this.entity, JSON.parse(JSON.stringify(data)));
  }

  // find all documents and return map by key
  async findMapByKeys(
    options: {
      select?: string; // select fields
      key?: string; // map by key
      filter?: FilterQuery<T_DBModel> & T_Enforcement; // custom filter
    } = {}
  ) {
    const { select = "_id code name", key = "_id", filter = {} } = options;
    const query = this.MongooseModel.find(filter).select(select).lean();
    return query.then((res) => this.mapEntities(res)).then((res) => _.keyBy(res, key));
  }
}

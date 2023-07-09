import { Type, plainToInstance } from "class-transformer";

export class BaseEntity {
  _id: string;

  get id() {
    return this._id.toString();
  }

  static get resourceName() {
    return this.name.replace("Entity", "");
  }

  static create<T extends BaseEntity>(this: new (...args: any[]) => T, data: T): T {
    const convertedObject = plainToInstance<T, any>(this, JSON.parse(JSON.stringify(data)));

    return convertedObject;
  }
}

export class TimestampEntity extends BaseEntity {
  @Type(() => Date)
  createdAt: Date;
  @Type(() => Date)
  updatedAt: Date;
}

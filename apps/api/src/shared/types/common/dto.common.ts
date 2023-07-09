import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ isAbstract: true })
export class BaseObject {
  @Field({ description: 'Mã' })
  id: string;
}

@ObjectType({ isAbstract: true })
export class TimestampObject extends BaseObject {
  @Field(() => Date, { description: 'Ngày tạo' })
  createdAt: Date;

  @Field(() => Date, { description: 'Ngày cập nhật' })
  updatedAt: Date;
}

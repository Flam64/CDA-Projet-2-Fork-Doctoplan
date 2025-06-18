import { Field, Int, ObjectType } from 'type-graphql';

@ObjectType()
export class Log {
  @Field()
  id?: string;

  @Field()
  titre: string;

  @Field(() => String)
  metadata: string;

  @Field()
  createAt?: string;
}

@ObjectType()
export class LogsResponse {
  @Field(() => [Log])
  logs: Log[];

  @Field(() => Int)
  total: number;
}

export type LogMetadata = Record<string, string | number | boolean>;

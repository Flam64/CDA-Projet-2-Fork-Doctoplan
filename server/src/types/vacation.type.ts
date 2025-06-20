import { Field, InputType } from 'type-graphql';

@InputType()
export class VacationInput {
  @Field()
  start: string;

  @Field()
  end: string;

  @Field()
  type: string;
}

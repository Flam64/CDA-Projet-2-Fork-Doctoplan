import { Field, InputType } from 'type-graphql';

@InputType()
export class CreatePlanningInput {
  @Field(() => String, { nullable: true })
  monday_start: string | null;

  @Field(() => String, { nullable: true })
  monday_end: string | null;

  @Field(() => String, { nullable: true })
  tuesday_start: string | null;

  @Field(() => String, { nullable: true })
  tuesday_end: string | null;

  @Field(() => String, { nullable: true })
  wednesday_start: string | null;

  @Field(() => String, { nullable: true })
  wednesday_end: string | null;

  @Field(() => String, { nullable: true })
  thursday_start: string | null;

  @Field(() => String, { nullable: true })
  thursday_end: string | null;

  @Field(() => String, { nullable: true })
  friday_start: string | null;

  @Field(() => String, { nullable: true })
  friday_end: string | null;

  @Field(() => String, { nullable: true })
  saturday_start: string | null;

  @Field(() => String, { nullable: true })
  saturday_end: string | null;

  @Field(() => String, { nullable: true })
  sunday_start: string | null;

  @Field(() => String, { nullable: true })
  sunday_end: string | null;
}

@InputType()
export class CreatePeriodOfPlanningInput extends CreatePlanningInput {
  @Field()
  start: string;

  @Field(() => String, { nullable: true })
  end: string | null;
}

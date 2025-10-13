import { Field, InputType, Int, ObjectType } from 'type-graphql';
import { Departement } from '../entities/departement.entity';

@InputType()
export class DepartementInput {
  @Field()
  label: string;

  @Field()
  building: string;

  @Field()
  wing: string;

  @Field()
  level: string;
}

@ObjectType()
export class DepartementsWithTotal {
  @Field(() => [Departement])
  departements: Departement[];

  @Field(() => Int)
  total: number;
}

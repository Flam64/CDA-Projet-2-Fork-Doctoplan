import { InputType } from 'type-graphql';
import { IsNumber, Length, IsUUID } from 'class-validator';
import { Field } from 'type-graphql';

@InputType()
export class PatientDocInput {
  @Field()
  @Length(1, 255)
  name: string;

  @Field()
  @Length(1, 255)
  url: string;

  @Field()
  @IsUUID()
  id: string;

  @Field()
  @IsNumber()
  docTypeId: number;
}

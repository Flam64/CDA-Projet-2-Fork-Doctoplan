import { Field, InputType } from 'type-graphql';
import { Matches, Length, IsNumber } from 'class-validator';

@InputType()
export class NoteInput {
  @Field()
  @IsNumber()
  id?: number;

  @Field()
  @Matches(/^[\d]{4}-[\d]{2}-[\d]{2}$/, {
    message: 'La date doit être au format YYYY-MM-DD',
  })
  dateNote: string;

  @Field({ nullable: true })
  @Length(0, 255)
  note: string;
}

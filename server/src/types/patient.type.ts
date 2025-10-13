import { Field, ID, InputType } from 'type-graphql';
import { IsEmail, Matches, Length } from 'class-validator';

@InputType()
export class PatientInput {
  @Field(() => ID)
  id?: string;

  @Field({ nullable: true })
  @IsEmail()
  email: string;

  @Field()
  @Length(1, 255)
  firstname: string;

  @Field()
  @Length(1, 255)
  lastname: string;

  @Field()
  @Matches(/^[\d+ .]*$/, { message: 'Numéro de téléphone ne doit contenir que des chiffres' })
  @Length(1, 25)
  phone_number: string;

  @Field()
  @Matches(/^[\d ]*$/, { message: 'Numéro de sécurité social ne doit contenir que des chiffres' })
  social_number: string;

  @Field({ nullable: true })
  @Length(0, 255)
  private_assurance: string;

  @Field()
  @Matches(/^[M|F]$/, { message: 'Le genre doit être M ou F' })
  gender: string;

  @Field()
  @Matches(/^[\d]{4}-[\d]{2}-[\d]{2}$/, {
    message: 'La date doit être au format YYYY-MM-DD',
  })
  birth_date: string;

  @Field({ nullable: true })
  @Length(0, 255)
  birth_city: string;

  @Field()
  note: string;

  @Field()
  @Length(1, 255)
  adress: string;

  @Field({ nullable: true })
  @Length(0, 255)
  referring_physician: string;

  @Field({ nullable: true })
  @Length(0, 255)
  contact_person: string;

  @Field()
  @Matches(/[\d]*/)
  zip_code: string;

  @Field()
  city: string;
}

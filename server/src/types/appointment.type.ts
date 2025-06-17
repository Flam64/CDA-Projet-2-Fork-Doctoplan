import { Field, InputType } from 'type-graphql';
import { Matches, IsNumber, IsUUID, Length } from 'class-validator';
import { AppointmentStatus } from '../entities/appointment.entity';

@InputType()
export class AppointmentCreateInput {
  @Field()
  @Matches(/^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'La date doit être au format yyyy-mm-ddThh:mm:ss avec des valeurs valides.',
  })
  start_time: string; // Date and start hour

  @Field()
  @IsNumber()
  duration: number; // in minutes

  @Field(() => String, { nullable: true })
  status?: AppointmentStatus;

  @Field()
  @Matches(/^[0-9]{1,10}$/, {
    message: "L'ID du médecin doit être un nombre valide.",
  })
  user_id: string; // Doctor ID

  @Field()
  @IsUUID()
  patient_id: string;

  @Field()
  @Matches(/^[0-9]{1,10}$/, {
    message: 'Le type de rendez-vous doit être un nombre valide.',
  })
  appointmentType: string;

  @Field()
  @Matches(/^[0-9]{1,10}$/, {
    message: "L'ID du service doit être un nombre valide.",
  })
  departement: string;
}

@InputType()
export class AppointmentSecDocInput {
  @Field()
  @Length(1, 255)
  name: string;

  @Field()
  @Length(1, 255)
  url: string;

  @Field()
  id: string;

  @Field()
  @IsNumber()
  docTypeId: number;
}

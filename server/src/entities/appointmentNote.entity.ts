import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ID, ObjectType } from 'type-graphql';

import { Appointment } from './appointment.entity';
import { appointmentDocDoctor } from './appointmentDocDoctor.entity';

@ObjectType()
@Entity('appointment_note')
export class appointmentNote extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column()
  description: string;

  @Field(() => String)
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: string;

  @Field(() => Appointment)
  @ManyToOne(() => Appointment, (appointmentNote) => appointmentNote.doctorNote)
  appointmentNote: Appointment;

  @Field(() => [appointmentDocDoctor], { nullable: true })
  @OneToMany(() => appointmentDocDoctor, (appointmentDoc) => appointmentDoc.appointmentDoc)
  appointmentDocDocteur: appointmentDocDoctor[];
}

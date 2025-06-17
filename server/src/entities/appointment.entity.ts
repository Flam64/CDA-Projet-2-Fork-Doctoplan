import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { ObjectType, Field, ID, Int } from 'type-graphql';
import { User } from './user.entity';
import { Patient } from './patient.entity';
import { AppointmentType } from './appointment-type.entity';
import { appointmentDocSecretary } from './appointmentDocSecretary.entity';
import { Departement } from './departement.entity';

export enum AppointmentStatus {
  CONFIRMED = 'confirmed',
  CANCELED = 'canceled',
}

@ObjectType()
@Entity('appointment')
export class Appointment extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ type: 'timestamp' })
  start_time: Date; // Date and start hour

  @Field(() => Int)
  @Column()
  duration: number; // in minutes

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.CONFIRMED,
  })
  status: AppointmentStatus;

  @Field(() => User)
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  doctor: User;

  @Field(() => Patient)
  @ManyToOne(() => Patient, { eager: true })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Field(() => User)
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'created_by' })
  created_by: User;

  @Field(() => AppointmentType)
  @ManyToOne(() => AppointmentType, { eager: true })
  @JoinColumn({ name: 'appointment_type_id' })
  appointmentType: AppointmentType;

  @Field()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Field(() => Departement)
  @ManyToOne(() => Departement, { eager: true })
  @JoinColumn({ name: 'departement_id' })
  departement: Departement;

  @Field(() => [appointmentDocSecretary])
  @OneToMany(() => appointmentDocSecretary, (administrativeDoc) => administrativeDoc.appointmentDoc)
  administrativeDoc: appointmentDocSecretary[];
}

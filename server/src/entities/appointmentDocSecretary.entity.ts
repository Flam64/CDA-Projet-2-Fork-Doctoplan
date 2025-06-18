import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ID, ObjectType } from 'type-graphql';

import { Appointment } from './appointment.entity';
import { DocType } from './doc-type.entity';

@ObjectType()
@Entity('appointment_doc_secretary')
export class appointmentDocSecretary extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column()
  name: string;

  @Field(() => String)
  @Column()
  url: string;

  @Field(() => String)
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: string;

  @Field(() => Appointment)
  @ManyToOne(() => Appointment, (appointmentDoc) => appointmentDoc.administrativeDoc)
  appointmentDoc: Appointment;

  @Field(() => DocType)
  @ManyToOne(() => DocType, (docType) => docType.patientDocsType)
  docType: DocType;
}

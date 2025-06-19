import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ID, ObjectType } from 'type-graphql';

import { appointmentNote } from './appointmentNote.entity';
import { DocType } from './doc-type.entity';

@ObjectType()
@Entity('appointment_doc_doctor')
export class appointmentDocDoctor extends BaseEntity {
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

  @Field(() => appointmentNote)
  @ManyToOne(() => appointmentNote, (appointmentDoc) => appointmentDoc.appointmentDocDocteur)
  appointmentDoc: appointmentNote;

  @Field(() => DocType)
  @ManyToOne(() => DocType, (docType) => docType.patientDocsType)
  docType: DocType;
}

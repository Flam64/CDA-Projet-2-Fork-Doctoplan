import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ID, ObjectType } from 'type-graphql';
import { PatientDoc } from './patient-doc.entity';

export enum DocumentType {
  PATIENT = 'patient',
  APPOINTMENT = 'appointment',
  APPOINTMENTDOCTOR = 'appointmentDoctor',
}

@ObjectType()
@Entity('doc_type')
export class DocType extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column()
  name: string;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: DocumentType,
    default: DocumentType.PATIENT,
  })
  type: DocumentType;

  @Field(() => [PatientDoc])
  @OneToMany(() => PatientDoc, (patient_doc) => patient_doc.docType)
  patientDocsType: PatientDoc[];
}

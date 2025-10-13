import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ID, ObjectType } from 'type-graphql';
import { City } from './city.entity';
import { PatientDoc } from './patient-doc.entity';

@ObjectType()
@Entity('patient')
export class Patient extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  email: string;

  @Field()
  @Column()
  firstname: string;

  @Field()
  @Column()
  lastname: string;

  @Field()
  @Column()
  phone_number: string;

  @Field()
  @Column()
  social_number: string;

  @Field()
  @Column()
  private_assurance: string;

  @Field()
  @Column({ length: 15 })
  gender: string;

  @Field()
  @Column({ type: 'date' })
  birth_date: string;

  @Field()
  @Column()
  birth_city: string;

  @Field()
  @Column({ type: 'text' })
  note: string;

  @Field()
  @Column()
  adress: string;

  @Field()
  @Column()
  referring_physician: string;

  @Field()
  @Column()
  contact_person: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Field(() => City, { nullable: true })
  @ManyToOne(() => City, (city) => city.patients)
  city: City;

  @Field(() => [PatientDoc])
  @OneToMany(() => PatientDoc, (patientDocs) => patientDocs.patient)
  patientDocs: PatientDoc[];
}

import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ID, ObjectType } from 'type-graphql';
import { Patient } from './patient.entity';

@ObjectType()
@Entity('city')
export class City extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ length: 15 })
  zip_code: string;

  @Field()
  @Column()
  city: string;

  @Field(() => [Patient])
  @OneToMany(() => Patient, (patients) => patients.city)
  patients: Patient[];
}

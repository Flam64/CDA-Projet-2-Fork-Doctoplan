import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ID, ObjectType } from 'type-graphql';
import { Planning } from './planning.entity';
import { Departement } from './departement.entity';
import { Note } from './note.entity';

export enum UserRole {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  AGENT = 'agent',
  SECRETARY = 'secretary',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  email: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  password: string;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.DOCTOR,
  })
  role: UserRole;

  @Field()
  @Column()
  firstname: string;

  @Field()
  @Column()
  lastname: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  tel: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  gender: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  profession: string;

  @Field(() => Departement)
  @ManyToOne(() => Departement, (departement: Departement) => departement.user, { eager: true })
  departement: Departement;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  status: UserStatus;

  @Field(() => [Planning], { nullable: true })
  @OneToMany(() => Planning, (planning) => planning.user)
  plannings: Planning[];

  @Field({ nullable: true })
  @Column({ type: 'date', nullable: true })
  activationDate: string;

  @Field()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Field(() => [Note], { nullable: true })
  @OneToMany(() => Note, (note) => note.user)
  notes: Note[];
}

import { Field, InputType, Int, ObjectType } from 'type-graphql';
import { User, UserRole, UserStatus } from '../entities/user.entity';
import { Matches } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  firstname: string;

  @Field()
  lastname: string;

  @Field({ nullable: true })
  tel: string;

  @Field({ nullable: true })
  gender: string;

  @Field({ nullable: true })
  activationDate?: string;

  @Field({ nullable: true })
  profession: string;

  @Field()
  departementId: number;

  @Field(() => String, { nullable: true })
  role?: UserRole;

  @Field(() => String, { nullable: true })
  status?: UserStatus;
}

@ObjectType()
export class UsersWithTotal {
  @Field(() => [User])
  users: User[];

  @Field(() => Int)
  total: number;
}

// 👮 verification that the email corresponds to the domain @hopital.gouv.fr
@InputType()
export class sendEmailInput {
  @Field()
  // 🔥 le regEx definitif devra être /^[a-zA-Z0-9._%+-]+@hopital\.gouv\.fr$/
  @Matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, {
    message: 'Adresse mail non conforme',
  })
  email: string;
}

// 👮 checking password entry rules
@InputType()
export class ResetPasswordInput {
  @Field()
  @Matches(/^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/, {
    message: "Le mot de passe n'est pas réglementaire !",
  })
  password: string;

  @Field()
  token: string;
}

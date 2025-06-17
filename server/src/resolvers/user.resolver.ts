import { Arg, Authorized, Ctx, Int, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';
import { User, UserRole, UserStatus } from '../entities/user.entity';
import { CreateUserInput, UsersWithTotal } from '../types/user.type';
import { GraphQLError } from 'graphql';
import { Departement } from '../entities/departement.entity';
import log from '../utils/log';
import argon2 from 'argon2';
import { ILike } from 'typeorm';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import jwt from 'jsonwebtoken';
import { ResetPasswordInput, sendEmailInput } from '../types/user.type';
import { Planning } from '../entities/planning.entity';
import { CreatePlanningInput, CreatePeriodOfPlanningInput } from '../types/planning.type';
import { dataSource } from '../database/client';

@Resolver()
export class UserResolver {
  @Query(() => UsersWithTotal)
  @Authorized([UserRole.ADMIN])
  async getAllUsers(
    @Arg('limit', () => Int, { nullable: true }) limit?: number,
    @Arg('page', () => Int, { nullable: true }) page?: number,
    @Arg('search', { nullable: true }) search?: string,
  ) {
    const take = limit ?? 0;
    const skip = page && page > 0 ? (page - 1) * take : 0;
    const [users, total] = await User.findAndCount({
      relations: ['departement'],
      order: { lastname: 'ASC' },
      take,
      skip,
      where: [{ firstname: ILike(`%${search}%`) }, { lastname: ILike(`%${search}%`) }],
    });
    return { users, total };
  }
  @Query(() => User)
  @Authorized([UserRole.ADMIN, UserRole.SECRETARY])
  async getFullUserInfo(@Arg('id') id: string): Promise<User> {
    const user = await User.findOne({
      where: { id: +id },
      relations: ['departement', 'plannings'],
    });

    if (!user) {
      throw new GraphQLError(`L'utilisateur avec l'id ${id} n'existe pas`, {
        extensions: {
          code: 'USER_NOT_FOUND',
          originalError: 'Aucun utilisateur trouvéaaaa',
        },
      });
    }

    return user;
  }
  @Query(() => User)
  @Authorized([UserRole.ADMIN, UserRole.SECRETARY])
  async getUserById(@Arg('id') id: string, @Ctx() context: { user: User }): Promise<User> {
    let user;

    if (context.user?.role === UserRole.SECRETARY) {
      user = await User.findOneBy({
        id: +id,
        role: UserRole.DOCTOR,
      });
    } else {
      user = await User.findOneBy({
        id: +id,
      });
    }

    if (!user) {
      throw new GraphQLError(`L'utilisateur avec l'id ${id} n'existe pas`, {
        extensions: {
          code: 'USER_NOT_FOUND',
          originalError: 'Aucun utilisateur trouvéee',
        },
      });
    }

    return user;
  }

  // 📋 checks if the email exists and requests sending of the reset email
  @Mutation(() => Boolean)
  async sendResetPassword(@Arg('email') { email }: sendEmailInput): Promise<boolean> {
    try {
      const userExist = await User.findOneBy({ email });
      if (userExist) {
        try {
          // 🔗 creating the jwt token and password reset url
          const resetToken = jwt.sign({ email }, `${process.env.JWT_SECRET}`);

          const url = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

          // ☎️ call the server_send_mail (/mail on Express)
          const response = await fetch(`${process.env.SERVER_SEND_MAIL}/mail/login/init`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, url }),
          });
          if (response.ok) {
            // ♻️ log the password reset request
            await log('Demande de réinitialisation de mot de passe', {
              email: email,
            });
            return true;
          }
          return false;
        } catch (error) {
          console.error(error);
          throw new GraphQLError("Impossible d'envoyer l'email", {
            extensions: {
              code: 'SEND_MAIL_ERROR',
              originalError: "Une erreur s'est produite dans l'envoi de l'email",
            },
          });
        }
      }
      // log suspicious password reset request
      await log('⚠️ Demande de réinitialisation suspecte de mot de passe', {
        email: email,
      });
      return false; // the user does not exist
    } catch (error) {
      console.error(error); // pour eviter une erreur Eslint
      throw new GraphQLError('Erreur lors de la verification utilisateur', {
        extensions: {
          code: 'USER_ERROR',
          originalError: 'Impossible de réaliser la vérification utilisateur',
        },
      });
    }
  }

  // 🖲️ Reset password
  @Mutation(() => Boolean)
  async resetPassword(@Arg('input') { token, password }: ResetPasswordInput): Promise<boolean> {
    try {
      // 📤 retrieve the email in the token
      const { email } = jwt.verify(token, process.env.JWT_SECRET || '') as unknown as {
        email: string;
      };

      // then check that the user exists
      const userUpdate = await User.findOneBy({ email });
      if (!userUpdate) {
        throw new GraphQLError('Impossible de modifier le mot de passe', {
          extensions: {
            code: 'USER_NOT_FOUND',
            originalError: 'Utilisateur non trouvé',
          },
        });
      }
      // ⚙️ hash and update new password
      const hashedPassword = await argon2.hash(password);
      userUpdate.password = hashedPassword;
      await userUpdate.save();

      // 📋 log the user's password reset action
      await log('Nouveau mot de passe utilisateur', {
        user: userUpdate.id,
        email: userUpdate.email,
        role: userUpdate.role,
      });
      return true;
    } catch (error) {
      console.error(error);
      throw new GraphQLError('Impossible de changer le mot de passe', {
        extensions: {
          code: 'USER_ERROR',
          originalError: "Une erreur s'est produit dans le changement de mot de passe",
        },
      });
    }
  }

  @Query(() => [User])
  @Authorized([UserRole.SECRETARY])
  async getDoctorsByDepartement(@Arg('id') id: number): Promise<User[]> {
    return await User.find({
      relations: ['departement'],
      where: {
        role: UserRole.DOCTOR,
        status: UserStatus.ACTIVE,
        departement: {
          id: id,
        },
      },
    });
  }

  @Query(() => [User])
  @Authorized([UserRole.SECRETARY])
  async searchDoctors(@Arg('query') query: string): Promise<User[]> {
    return User.find({
      where: [
        { role: UserRole.DOCTOR, status: UserStatus.ACTIVE, firstname: ILike(`%${query}%`) },
        { role: UserRole.DOCTOR, status: UserStatus.ACTIVE, lastname: ILike(`%${query}%`) },
      ],
      relations: ['departement'],
      take: 5,
    });
  }

  @Mutation(() => Boolean)
  @Authorized([UserRole.ADMIN])
  @UseMiddleware(AuthMiddleware)
  async createUser(@Ctx() context: { user: User }, @Arg('input') input: CreateUserInput) {
    const userExist = await User.findOneBy({ email: input.email });
    if (userExist) {
      throw new GraphQLError('User with this email already exists', {
        extensions: {
          code: 'USER_CREATION_FAILED',
          originalError: "L'utilisateur existe déjà",
        },
      });
    }

    try {
      await dataSource.transaction(async (transactionalEntityManager) => {
        const newUser = await this.setUserData(new User(), input);
        await transactionalEntityManager.save(newUser);
        await log('User created', {
          userId: newUser.id,
          email: newUser.email,
          role: newUser.role,
          createdBy: context.user.id,
        });

        if (input.role === UserRole.DOCTOR && input.plannings) {
          const newPlanning = this.createPlanning(input.plannings[0]);
          newPlanning.user = newUser;
          await transactionalEntityManager.save(newPlanning);
          await log('User planning created', {
            PlanningId: newPlanning.id,
            userId: newPlanning.user.id,
            role: newPlanning.user.role,
            createdBy: context.user.id,
          });
        }
      });
      return true;
    } catch (error) {
      console.error(error);
      throw new GraphQLError(`Échec de la création de l'utilisateur`, {
        extensions: {
          code: 'USER_CREATION_FAILED',
          originalError: error.message,
        },
      });
    }
  }

  formatTimeForPostgres(timeStr: string | null): string | null {
    if (!timeStr) {
      return null;
    }
    return `${timeStr.replace('h', ':')}:00`;
  }

  createPlanning(
    input: CreatePeriodOfPlanningInput,
    planning: Planning = new Planning(),
  ): Planning {
    if (Object.values(planning).length === 0) {
      throw new GraphQLError('Au moins un jour doit être rempli.');
    }
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    Object.assign(planning, this.createPeriodOfPlanning(planning, input));
    console.info(planning);
    days.forEach((day: string) => {
      const startKey = `${day}_start` as keyof CreatePlanningInput;
      const endKey = `${day}_end` as keyof CreatePlanningInput;
      planning[startKey] = this.formatTimeForPostgres(input[startKey]);
      planning[endKey] = this.formatTimeForPostgres(input[endKey]);
    });
    return planning;
  }

  createPeriodOfPlanning(plan: Planning, input: CreatePeriodOfPlanningInput) {
    const startDate = input.start ? new Date(input.start) : new Date();
    plan.start = startDate.toISOString();
    const endDate = new Date(startDate.setMonth(startDate.getMonth() + 3));
    endDate.setDate(endDate.getDate() - 1);
    plan.end = endDate.toISOString();
    return plan;
  }

  @Mutation(() => Boolean)
  @Authorized([UserRole.ADMIN])
  @UseMiddleware(AuthMiddleware)
  async updateUser(
    @Ctx() context: { user: User },
    @Arg('id') id: string,
    @Arg('input') input: CreateUserInput,
  ) {
    const user = await User.findOne({
      where: { id: +id },
      relations: ['departement', 'plannings'],
    });
    if (!user) {
      throw new GraphQLError('User non trouvé', {
        extensions: {
          code: 'User_NOT_FOUND',
        },
      });
    }
    try {
      await dataSource.transaction(async (transactionalEntityManager) => {
        const updateUser = await this.setUserData(user, input);
        await transactionalEntityManager.save(updateUser);
        if (user.role === UserRole.DOCTOR && input.plannings) {
          console.info(input.plannings);
          const newPlanning = this.createPlanning(input.plannings[0], user.plannings[0]);
          await transactionalEntityManager.save(newPlanning);
        }

        await log('User update', {
          userId: updateUser.id,
          email: updateUser.email,
          role: updateUser.role,
          createdBy: context.user.id,
        });
      });
    } catch (error) {
      throw new GraphQLError(`Échec de la mise à jour de l'utilisateur`, {
        extensions: {
          code: 'USER_UPDATE_FAILED',
          originalError: error.message,
        },
      });
    }
    return true;
  }

  @Mutation(() => Boolean)
  @Authorized([UserRole.ADMIN])
  async changeStatusStatus(@Arg('id') id: string) {
    const user = await User.findOneBy({ id: +id });
    if (!user) {
      throw new GraphQLError('User non trouvé', {
        extensions: {
          code: 'USER_NOT_FOUND',
        },
      });
    }

    user.status = user.status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE;

    await User.update({ id: user.id }, { ...user });
    return true;
  }

  async setUserData(user: User, input: CreateUserInput) {
    const departement = await Departement.findOneBy({ id: +input.departementId });
    if (!departement) {
      throw new GraphQLError('Department not found');
    }
    if (user.email !== input.email) {
      user.email = input.email;
    }
    user.firstname = input.firstname;
    user.lastname = input.lastname;
    user.role = input.role as UserRole;
    user.gender = input.gender;
    user.tel = input.tel;
    user.activationDate = input.activationDate ?? new Date().toDateString();
    user.status = input.status as UserStatus;
    user.departement = departement;
    return user;
  }
}

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
  async getUserById(@Arg('id') id: string, @Ctx() context: { user: User }): Promise<User> {
    let user;

    if (context.user?.role === UserRole.SECRETARY) {
      user = await User.findOneBy({
        id: +id,
        role: UserRole.DOCTOR,
      });
    } else {
      user = await User.findOne({
        where: { id: +id },
        relations: ['departement', 'plannings'],
      });
    }

    if (!user) {
      throw new GraphQLError(`L'utilisateur avec l'id ${id} n'existe pas`, {
        extensions: {
          code: 'USER_NOT_FOUND',
          originalError: 'Aucun utilisateur trouvé',
        },
      });
    }

    return user;
  }

  // 📋 checks if the email exists and requests sending of the reset email
  @Mutation(() => Boolean)
  async sendResetPassword(@Arg('email') { email }: sendEmailInput): Promise<boolean> {
    try {
      const user = await User.findOneBy({ email });
      if (user && user.status === UserStatus.ACTIVE) {
        try {
          // 🔗 Creation of the jwt token and password reset URL, with a validity of 15 minutes
          const resetToken = jwt.sign(
            { userId: user.id, email: user.email },
            `${process.env.JWT_SECRET}`,
            { expiresIn: '15m' },
          );

          const url = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

          // ☎️ call the server_send_mail (/mail on Express)
          const response = await fetch(`${process.env.SERVER_SEND_MAIL}/mail/login/init`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: user.email, url }),
          });
          if (response.ok) {
            // ♻️ log the password reset request
            await log('Demande de réinitialisation de mot de passe', {
              email: user.email,
            });
          } else {
            console.error(`Erreur envoi mail reset password: ${response.statusText}`);
            await log('Erreur envoi mail reset password', { email: user.email });
          }
        } catch (error) {
          console.error(error);
        }
      } else {
        // log suspicious password reset request
        await log('⚠️ Demande de réinitialisation suspecte de mot de passe', {
          email: email,
        });
      }
      return true; // always returns true
    } catch (error) {
      console.error(error);
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
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as {
        userId: number;
        email: string;
      };

      // then check that the user exists
      const userUpdate = await User.findOneBy({ id: decoded.userId });
      if (!userUpdate) {
        throw new GraphQLError('Impossible de modifier le mot de passe', {
          extensions: {
            code: 'USER_NOT_FOUND',
            originalError: 'Utilisateur non trouvé',
          },
        });
      }
      // ⚙️ hash and update new password
      userUpdate.password = await argon2.hash(password);
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

      // Managing invalid or expired tokens
      if (error instanceof jwt.TokenExpiredError) {
        throw new GraphQLError('Lien de réinitialisation expiré', {
          extensions: { code: 'TOKEN_EXPIRED' },
        });
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new GraphQLError('Lien de réinitialisation invalide', {
          extensions: { code: 'INVALID_TOKEN' },
        });
      }

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
      let departementLabel = '';
      let role = '';
      const generatedPassword =
        Array.from(crypto.getRandomValues(new Uint32Array(4)))
          .map((n) => n.toString(36))
          .join('')
          .slice(0, 12) + Math.random().toString(36).slice(2, 4).toUpperCase();

      await dataSource.transaction(async (transactionalEntityManager) => {
        const newUser = await this.setUserData(new User(), input);
        newUser.password = await argon2.hash(generatedPassword);
        departementLabel = newUser.departement.label;
        role = newUser.role;
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
      const email = input.email;
      const url = `${process.env.FRONTEND_URL}/login`;

      await fetch(`${process.env.SERVER_SEND_MAIL}/mail/user/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, url, generatedPassword, departementLabel, role }),
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

  createPlanning(input: CreatePeriodOfPlanningInput): Planning {
    const planning = new Planning();
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    Object.assign(planning, this.createPeriodOfPlanning(planning, input));

    days.forEach((day: string) => {
      const startKey = `${day}_start` as keyof CreatePlanningInput;
      const endKey = `${day}_end` as keyof CreatePlanningInput;
      planning[startKey] = this.formatTimeForPostgres(input[startKey]);
      planning[endKey] = this.formatTimeForPostgres(input[endKey]);
    });
    if (Object.values(planning).length === 0) {
      throw new GraphQLError('Au moins un jour doit être rempli.');
    }
    return planning;
  }

  createPeriodOfPlanning(planning: Planning, input: CreatePeriodOfPlanningInput) {
    const startDate = input.start ? new Date(input.start) : new Date();
    planning.start = startDate.toISOString();
    return planning;
  }

  formatTimeForPostgres(timeStr: string | null): string | null {
    if (!timeStr) {
      return null;
    }
    return `${timeStr.replace('h', ':')}:00`;
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
      const updateUser = await this.setUserData(user, input);
      await updateUser.save();
      await log('User update', {
        userId: updateUser.id,
        email: updateUser.email,
        role: updateUser.role,
        updatedBy: context.user.id,
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

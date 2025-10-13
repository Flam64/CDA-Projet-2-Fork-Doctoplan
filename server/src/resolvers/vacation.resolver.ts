import { Query, Resolver, Authorized, Mutation, UseMiddleware, Arg } from 'type-graphql';
import { User, UserRole } from '../entities/user.entity';
import { Vacation } from '../entities/docVacation.entity';
import { VacationInput } from '../types/vacation.type';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { GraphQLError } from 'graphql';

@Resolver()
export class VacationResolver {
  @Query(() => [Vacation])
  @Authorized([UserRole.SECRETARY, UserRole.DOCTOR])
  async getAllVacation(): Promise<Vacation[]> {
    return await Vacation.find({ relations: ['user'] });
  }

  @Query(() => [Vacation])
  @Authorized([UserRole.SECRETARY, UserRole.DOCTOR])
  async getVacationById(@Arg('id') id: string): Promise<Vacation[]> {
    return await Vacation.find({ where: { user: { id: +id } }, relations: ['user'] });
  }

  @Mutation(() => Boolean)
  @Authorized([UserRole.DOCTOR, UserRole.SECRETARY])
  @UseMiddleware(AuthMiddleware)
  async createVacation(@Arg('id') id: string, @Arg('input') input: VacationInput) {
    const doctor = await User.findOneBy({ id: +id });
    if (!doctor) {
      throw new GraphQLError('Doctor non trouvé');
    }

    try {
      const newVacation = new Vacation();
      newVacation.start = new Date(input.start).toISOString();
      newVacation.end = new Date(input.end).toISOString();
      newVacation.user = doctor;
      await newVacation.save();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  @Mutation(() => Boolean)
  @Authorized([UserRole.DOCTOR, UserRole.SECRETARY])
  @UseMiddleware(AuthMiddleware)
  async updateVacation(
    @Arg('vacationId') vacationId: string,
    @Arg('doctorId') doctorId: string,
    @Arg('input') input: VacationInput,
  ) {
    const doctor = await User.findOneBy({ id: +doctorId });
    if (!doctor) {
      throw new GraphQLError('Doctor non trouvé');
    }

    const vacation = await Vacation.findOneBy({ id: +vacationId });
    if (!vacation) {
      throw new GraphQLError('congé non trouvé');
    }

    try {
      vacation.start = new Date(input.start).toISOString();
      vacation.end = new Date(input.end).toISOString();
      vacation.user = doctor;
      await vacation.save();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  @Query(() => Boolean)
  @Authorized([UserRole.DOCTOR, UserRole.SECRETARY])
  @UseMiddleware(AuthMiddleware)
  async deleteVacation(@Arg('id') id: string) {
    const vacation = await Vacation.findOneBy({ id: +id });
    if (!vacation) {
      throw new GraphQLError('congé non trouvé');
    }
    try {
      await vacation.remove();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}

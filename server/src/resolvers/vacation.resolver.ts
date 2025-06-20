import { Query, Resolver, Authorized, Mutation, UseMiddleware, Arg } from 'type-graphql';
// import { GraphQLError } from 'graphql';
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

  @Mutation(() => Boolean)
  @Authorized([UserRole.DOCTOR])
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
      newVacation.type = input.type;
      newVacation.user = doctor;
      await Vacation.save(newVacation);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}

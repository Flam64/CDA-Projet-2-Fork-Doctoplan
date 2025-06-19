import { Arg, Authorized, Ctx, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';
import { User, UserRole } from '../entities/user.entity';
import { GraphQLError } from 'graphql';
import log from '../utils/log';
import { Planning } from '../entities/planning.entity';
import { CreatePeriodOfPlanningInput, CreatePlanningInput } from '../types/planning.type';
import { AuthMiddleware } from '../middlewares/auth.middleware';

@Resolver()
export class PlanningResolver {
  @Query(() => [Planning])
  @Authorized([UserRole.SECRETARY, UserRole.DOCTOR, User, UserRole.ADMIN])
  async getPlanningByDoctor(@Arg('doctorId') doctorId: number): Promise<Planning[]> {
    const planning = await Planning.find({
      where: { user: { id: doctorId } },
      relations: ['user'],
    });

    if (!planning.length) {
      throw new GraphQLError('Doctor non trouvé');
    }
    return planning;
  }

  @Mutation(() => Planning)
  @Authorized([UserRole.ADMIN])
  @UseMiddleware(AuthMiddleware)
  async createDoctorPlanning(
    @Ctx() context: { user: User },
    @Arg('input') input: CreatePeriodOfPlanningInput,
    @Arg('id') id: string,
  ): Promise<Planning> {
    const user = await User.findOne({
      where: { id: +id, role: UserRole.DOCTOR },
      relations: ['plannings'],
    });
    if (!user) {
      throw new GraphQLError('Doctor non trouvé');
    }

    function formatTimeForPostgres(timeStr: string | null): string | null {
      if (!timeStr) {
        return null;
      }
      return `${timeStr.replace('h', ':')}:00`;
    }
    try {
      const newPlanning = new Planning();
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

      days.forEach((day: string) => {
        const startKey = `${day}_start` as keyof CreatePlanningInput;
        const endKey = `${day}_end` as keyof CreatePlanningInput;

        const formattedStart = formatTimeForPostgres(input[startKey] as string);
        if (formattedStart) {
          newPlanning[startKey] = formattedStart;
        }

        const formattedEnd = formatTimeForPostgres(input[endKey] as string);
        if (formattedEnd) {
          newPlanning[endKey] = formattedEnd;
        }
      });
      newPlanning.start = input.start ?? new Date().toISOString();
      const planningToUpdate = user.plannings.find((plan) => plan.end === null);
      if (planningToUpdate) {
        const endDate = new Date(newPlanning.start);
        endDate.setDate(endDate.getDate() - 1);
        planningToUpdate.end = endDate.toISOString();
        planningToUpdate.save();
      }

      newPlanning.user = user;
      await newPlanning.save();
      await log('User planning created', {
        PlanningId: newPlanning.id,
        userId: newPlanning.user.id,
        role: newPlanning.user.role,
        createdBy: context.user.id,
      });
      return newPlanning;
    } catch (error) {
      console.error(error);
      throw new GraphQLError(`Échec de la création de planning`, {
        extensions: {
          code: 'PLANNING_CREATION_FAILED',
          originalError: error.message,
        },
      });
    }
  }
}

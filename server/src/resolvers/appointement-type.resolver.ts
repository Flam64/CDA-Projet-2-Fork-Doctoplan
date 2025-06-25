import { Resolver, Query, Authorized } from 'type-graphql';
import { AppointmentType } from '../entities/appointment-type.entity';
import { UserRole } from '../entities/user.entity';

@Resolver()
export class AppointmentTypeResolver {
  @Query(() => [AppointmentType])
  @Authorized([UserRole.SECRETARY, UserRole.DOCTOR])
  async getAppointmentTypes(): Promise<AppointmentType[]> {
    return AppointmentType.find();
  }
}

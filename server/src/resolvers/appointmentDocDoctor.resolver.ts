import { Arg, Authorized, Query, Resolver } from 'type-graphql';
import { appointmentDocDoctor } from '../entities/appointmentDocDoctor.entity';
import { UserRole } from '../entities/user.entity';

@Resolver()
export class appointmentDocDoctorResolver {
  @Query(() => [appointmentDocDoctor])
  @Authorized([UserRole.DOCTOR])
  async getDocumentByIDAppDoctor(
    @Arg('appointmentId') appointmentId: string,
  ): Promise<appointmentDocDoctor[] | null> {
    return await appointmentDocDoctor.find({
      where: { appointmentDoc: { id: +appointmentId } },
      relations: ['appointmentDoc', 'docType'],
      order: { id: 'DESC' },
    });
  }
}

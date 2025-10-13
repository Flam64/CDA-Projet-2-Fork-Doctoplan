import { Arg, Query, Resolver, Authorized } from 'type-graphql';
import { DoctorAppointmentSlot } from '../entities/doctorAppointmentSlot.entity';
import redisClient from '../database/redis';
import { UserRole } from '../entities/user.entity';

@Resolver()
export class doctorAppointmentSlotResolver {
  @Authorized([UserRole.SECRETARY])
  @Query(() => [DoctorAppointmentSlot])
  async getDoctorSlotByID(
    @Arg('doctorId') doctorId: number,
    @Arg('date') date: string,
  ): Promise<DoctorAppointmentSlot[] | null> {
    const doctorAppointmentSlot = await redisClient.get(
      `getDoctorSlot_${doctorId}_${new Date(date).toLocaleDateString()}`,
    );
    if (doctorAppointmentSlot) {
      return JSON.parse(doctorAppointmentSlot);
    }
    const doctorAppointment = await DoctorAppointmentSlot.find({
      where: { user_id: doctorId.toString(), jour: date },
    });
    redisClient.set(
      `getDoctorSlot_${doctorId}_${new Date(date).toLocaleDateString()}`,
      JSON.stringify(doctorAppointment),
    );
    return doctorAppointment;
  }

  @Authorized([UserRole.SECRETARY, UserRole.ADMIN])
  @Query(() => [DoctorAppointmentSlot])
  async getDoctorSlotByDepartement(
    @Arg('departement_id') departement_id: number,
    @Arg('date') date: string,
  ): Promise<DoctorAppointmentSlot[] | null> {
    const doctorAppointmentByDepartement = await redisClient.get(
      `getDoctorAppointmentByDepartement_${departement_id}_${new Date(date).toLocaleDateString()}`,
    );

    if (doctorAppointmentByDepartement) {
      return JSON.parse(doctorAppointmentByDepartement);
    }

    const doctorAppointmentSlot = await DoctorAppointmentSlot.find({
      where: { departement_id: departement_id.toString(), jour: date },
      order: { user_id: 'ASC', debut_libre: 'ASC' },
    });

    redisClient.set(
      `getDoctorAppointmentByDepartement_${departement_id}_${new Date(date).toLocaleDateString()}`,
      JSON.stringify(doctorAppointmentSlot),
    );

    return doctorAppointmentSlot;
  }
}

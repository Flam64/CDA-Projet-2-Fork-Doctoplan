import { Resolver, Query, Arg, Ctx, Authorized, Mutation, UseMiddleware } from 'type-graphql';
import { GraphQLError } from 'graphql';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import log from '../utils/log';
import { Appointment, AppointmentStatus } from '../entities/appointment.entity';
import { Between, Equal, MoreThan, LessThan } from 'typeorm';
import { UserRole, User } from '../entities/user.entity';
import { Patient } from '../entities/patient.entity';
import { AppointmentCreateInput } from '../types/appointment.type';
import { AppointmentType } from '../entities/appointment-type.entity';

@Resolver()
export class AppointmentResolver {
  // 📌 Appointments by Departement
  @Query(() => [Appointment])
  @Authorized([UserRole.SECRETARY])
  async getAppointmentsByDepartement(
    @Arg('departementId') departementId: number,
  ): Promise<Appointment[]> {
    return Appointment.find({
      where: {
        departement: {
          id: Equal(departementId),
        },
      },
      order: { start_time: 'ASC' },
    });
  }

  @Query(() => Appointment)
  @Authorized([UserRole.SECRETARY])
  async getAppointmentsById(@Arg('Id') Id: number): Promise<Appointment> {
    try {
      const myAppointment = Appointment.findOneOrFail({
        where: {
          id: Equal(Id),
        },
        order: { start_time: 'ASC' },
      });
      return myAppointment;
    } catch {
      throw new GraphQLError('Rendez-vous incorrect', {
        extensions: {
          code: 'APPOINTMENT_FAIL',
        },
      });
    }
  }

  @Query(() => [Appointment])
  @Authorized([UserRole.SECRETARY])
  async getDoctorByPatient(@Arg('patientId') patientId: string): Promise<Appointment[]> {
    return Appointment.find({
      where: {
        patient: {
          id: Equal(patientId),
        },
      },
      relations: ['doctor', 'doctor.departement', 'patient'],
    });
  }

  // 📌 Appointments by Doctor
  @Query(() => [Appointment])
  @Authorized([UserRole.SECRETARY])
  async getAppointmentsByDoctor(@Arg('doctorId') doctorId: number): Promise<Appointment[]> {
    return Appointment.find({
      where: {
        doctor: {
          id: Equal(doctorId),
        },
      },
      order: { start_time: 'ASC' },
    });
  }

  // 📌 Next Appointments by Patient
  @Query(() => [Appointment])
  @Authorized([UserRole.SECRETARY])
  async getNextAppointmentsByPatient(@Arg('patientId') patientId: string): Promise<Appointment[]> {
    return Appointment.find({
      where: {
        patient: {
          id: patientId,
        },
        start_time: MoreThan(new Date()),
      },
      order: { start_time: 'ASC' },
      relations: ['doctor', 'doctor.departement'],
    });
  }

  // 📌 Last Appointments by Patient
  @Query(() => [Appointment])
  @Authorized([UserRole.SECRETARY])
  async getLastAppointmentsByPatient(@Arg('patientId') patientId: string): Promise<Appointment[]> {
    return Appointment.find({
      where: {
        patient: {
          id: patientId,
        },
        start_time: LessThan(new Date()),
      },
      order: { start_time: 'DESC' },
      relations: ['doctor', 'doctor.departement'],
      take: 5,
    });
  }

  // 📌 Appointments by Day
  @Query(() => [Appointment])
  @Authorized([UserRole.SECRETARY])
  async getAppointmentsByDate(
    @Arg('date') date: string, // format YYYY-MM-DD
  ): Promise<Appointment[]> {
    // 💡 We create a "start" object representing the start of the day for the given date, at midnight in ISO 8601 format with UTC.
    // Display : 2025-05-07T00:00:00.000Z
    const start = new Date(`${date}T00:00:00.000Z`);
    // 💡 We create an "end" object representing the end of the day for the given date, at 23:59:59.999 UTC.
    const end = new Date(`${date}T23:59:59.999Z`);

    return Appointment.find({
      where: {
        start_time: Between(start, end),
      },
      order: { start_time: 'ASC' },
    });
  }

  // 📌 Appointments by Doctor and Day
  @Query(() => [Appointment])
  @Authorized([UserRole.SECRETARY])
  async getAppointmentsByDoctorAndDate(
    @Arg('doctorId') doctorId: number,
    @Arg('date') date: string, // format YYYY-MM-DD
  ): Promise<Appointment[]> {
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);

    return Appointment.find({
      where: {
        doctor: {
          id: Equal(doctorId),
        },
        start_time: Between(start, end),
      },
      order: { start_time: 'ASC' },
    });
  }

  @Mutation(() => Appointment)
  @UseMiddleware(AuthMiddleware)
  @Authorized([UserRole.SECRETARY])
  async createAppointment(
    @Ctx() context: { user: User },
    @Arg('appointmentInput') appointmentInput: AppointmentCreateInput,
  ): Promise<Appointment> {
    const checkDoctor = await User.findOneBy({
      id: +appointmentInput.user_id,
      role: UserRole.DOCTOR,
    });
    if (!checkDoctor) {
      throw new GraphQLError('Docteur non trouvé', {
        extensions: {
          code: 'DOCTOR_NOT_FOUND',
        },
      });
    }

    const checkSecretary = await User.findOneBy({ id: +context.user.id, role: UserRole.SECRETARY });
    if (!checkSecretary) {
      throw new GraphQLError('Secretaire non trouvé', {
        extensions: {
          code: 'SECRETARY_NOT_FOUND',
        },
      });
    }

    const checkPatient = await Patient.findOneBy({ id: appointmentInput.patient_id });
    if (!checkPatient) {
      throw new GraphQLError('Patient non trouvé', {
        extensions: {
          code: 'PATIENT_NOT_FOUND',
        },
      });
    }

    const checkAppointmentType = await AppointmentType.findOneBy({
      id: +appointmentInput.appointmentType,
    });
    if (!checkAppointmentType) {
      throw new GraphQLError('Rendez-vous non trouvé', {
        extensions: {
          code: 'APPOINTMENT_TYPE_NOT_FOUND',
        },
      });
    }
    const start_date_input = new Date(appointmentInput.start_time);
    const now = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
    if (start_date_input >= now && start_date_input < threeMonthsLater) {
      try {
        const appointment = new Appointment();
        appointment.start_time = start_date_input;
        appointment.duration = appointmentInput.duration;
        appointment.status = appointmentInput.status || AppointmentStatus.CONFIRMED;
        appointment.doctor = checkDoctor; // Docteur
        appointment.patient = checkPatient; // Patient
        appointment.created_by = checkSecretary; // Secretaire
        appointment.status = AppointmentStatus.CONFIRMED;
        appointment.departement = checkDoctor.departement; // Docteur service
        appointment.appointmentType = checkAppointmentType; // Rendez-vous type
        const appointmentreturn = await appointment.save();

        try {
          const response = await fetch(`${process.env.SERVER_SEND_MAIL}/mail/appointment/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: checkPatient.email,
              doctor: `${checkDoctor.firstname} ${checkDoctor.lastname}`,
              date: appointment.start_time.toISOString().split('T')[0],
              hour: appointment.start_time.toISOString().split('T')[1].slice(0, 5), // HH:MM
            }),
          });

          if (!response.ok) {
            console.error('Échec de l’envoi du mail de confirmation de rendez-vous');
          }
        } catch (mailError) {
          console.error('Erreur lors de l’appel à l’API mail :', mailError);
        }

        await log('Création rendez-vous', {
          created_by: checkSecretary.id,
          appointment: appointmentreturn.id,
          patient: checkPatient.id,
          doctor: checkDoctor.id,
        });

        return appointmentreturn;
      } catch (error) {
        throw new GraphQLError(`Échec de la création de du rendez-vous`, {
          extensions: {
            code: 'APPOINTMENT_CREATION_FAILED',
            originalError: error.message,
          },
        });
      }
    } else {
      throw new GraphQLError(`Échec de la création de du rendez-vous`, {
        extensions: {
          code: 'APPOINTMENT_CREATION_FAILED',
        },
      });
    }
  }

  @Mutation(() => Appointment)
  @UseMiddleware(AuthMiddleware)
  @Authorized([UserRole.SECRETARY])
  async updateAppointment(
    @Ctx() context: { user: User },
    @Arg('appointmentInput') appointmentInput: AppointmentCreateInput,
    @Arg('id') id: string,
  ): Promise<Appointment> {
    const checkAppointment = await Appointment.findOneBy({ id: +id });
    if (!checkAppointment) {
      throw new GraphQLError('rendez-vous non trouvé', {
        extensions: {
          code: 'APPOINTMENT_NOT_FOUND',
        },
      });
    }

    const checkDoctor = await User.findOneBy({ id: +appointmentInput.user_id });
    if (!checkDoctor) {
      throw new GraphQLError('Docteur non trouvé', {
        extensions: {
          code: 'DOCTOR_NOT_FOUND',
        },
      });
    }

    const checkSecretary = await User.findOneBy({ id: +context.user.id });
    if (!checkSecretary) {
      throw new GraphQLError('Secretaire non trouvé', {
        extensions: {
          code: 'SECRETARY_NOT_FOUND',
        },
      });
    }

    const checkPatient = await Patient.findOneBy({ id: appointmentInput.patient_id });
    if (!checkPatient) {
      throw new GraphQLError('Patient non trouvé', {
        extensions: {
          code: 'PATIENT_NOT_FOUND',
        },
      });
    }

    const checkAppointmentType = await AppointmentType.findOneBy({
      id: +appointmentInput.appointmentType,
    });
    if (!checkAppointmentType) {
      throw new GraphQLError('Rendez-vous non trouvé', {
        extensions: {
          code: 'APPOINTMENT_TYPE_NOT_FOUND',
        },
      });
    }
    const start_date_input = new Date(appointmentInput.start_time);
    const now = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
    if (start_date_input >= now && start_date_input < threeMonthsLater) {
      try {
        checkAppointment.start_time = start_date_input;
        checkAppointment.duration = appointmentInput.duration;
        checkAppointment.status = appointmentInput.status || AppointmentStatus.CONFIRMED;
        checkAppointment.doctor = checkDoctor; // Docteur
        checkAppointment.patient = checkPatient; // Patient
        checkAppointment.created_by = checkSecretary; // Secretaire
        checkAppointment.status = AppointmentStatus.CONFIRMED;
        checkAppointment.departement = checkDoctor.departement; // Docteur service
        checkAppointment.appointmentType = checkAppointmentType; // Rendez-vous type
        const appointmentreturn = await checkAppointment.save();

        await log('Modification rendez-vous', {
          updated_by: checkSecretary.id,
          appointment: appointmentreturn.id,
          patient: checkPatient.id,
          doctor: checkDoctor.id,
        });

        return appointmentreturn;
      } catch (error) {
        throw new GraphQLError(`Échec de la modification du rendez-vous`, {
          extensions: {
            code: 'APPOINTMENT_CREATION_FAILED',
            originalError: error.message,
          },
        });
      }
    } else {
      throw new GraphQLError(`Échec de la modification du rendez-vous`, {
        extensions: {
          code: 'APPOINTMENT_CREATION_FAILED',
        },
      });
    }
  }
}

import { Arg, Authorized, Mutation, Query, Resolver, Ctx } from 'type-graphql';
import log from '../utils/log';
import { GraphQLError } from 'graphql';
import { Patient } from '../entities/patient.entity';
import { PatientInput } from '../types/patient.type';
import { City } from '../entities/city.entity';
import { UserRole, User } from '../entities/user.entity';
import { ILike } from 'typeorm';

@Resolver()
export class PatientResolver {
  @Query(() => Patient)
  @Authorized([UserRole.SECRETARY, UserRole.DOCTOR])
  async getPatientByID(@Arg('patientId') patientId: string): Promise<Patient | null> {
    const patient = await Patient.findOne({
      where: { id: patientId },
      relations: ['city'],
    });

    if (!patient) {
      throw new Error('Patient inconnu');
    }
    return patient;
  }

  @Query(() => [Patient])
  @Authorized([UserRole.SECRETARY, UserRole.DOCTOR])
  async searchPatients(@Arg('query') query: string): Promise<Patient[]> {
    return Patient.find({
      where: [
        { firstname: ILike(`%${query}%`) },
        { lastname: ILike(`%${query}%`) },
        { social_number: ILike(`%${query}%`) },
      ],
      relations: ['city'],
      take: 5,
    });
  }

  @Mutation(() => Patient)
  @Authorized([UserRole.SECRETARY, UserRole.DOCTOR])
  async updatePatient(
    @Arg('patientData') patientData: PatientInput,
    @Ctx() context: { user: User },
  ): Promise<Patient | null> {
    const patient = await Patient.findOne({
      where: { id: patientData.id },
    });

    if (!patient) {
      throw new GraphQLError(`Patient inconnu`, {
        extensions: {
          code: 'PATIENT_NOT_FOUND',
        },
      });
    }

    const newcity = await City.findOne({
      where: { zip_code: patientData.zip_code, city: patientData.city },
    });
    try {
      patient.firstname = patientData.firstname;
      patient.lastname = patientData.lastname;
      patient.phone_number = patientData.phone_number;
      patient.social_number = patientData.social_number;
      patient.private_assurance = patientData.private_assurance;
      patient.adress = patientData.adress;
      patient.referring_physician = patientData.referring_physician;
      patient.contact_person = patientData.contact_person;
      patient.birth_date = patientData.birth_date;
      patient.birth_city = patientData.birth_city;
      patient.note = patientData.note;
      patient.email = patientData.email;
      patient.gender = patientData.gender;
      if (newcity) {
        patient.city = newcity;
      }
      await patient.save();

      await log('Modification patient', {
        updated_by: context.user.id,
        patient: patient.id,
      });

      return patient;
    } catch (error) {
      throw new GraphQLError(`Échec de la modification du patient`, {
        extensions: {
          code: 'PATIENT_UPDATE_FAILED',
          originalError: error.message,
        },
      });
    }
  }

  @Mutation(() => Patient)
  @Authorized([UserRole.SECRETARY, UserRole.DOCTOR])
  async createPatient(
    @Arg('patientData') patientData: PatientInput,
    @Ctx() context: { user: User },
  ): Promise<Patient | null> {
    const newcity = await City.findOne({
      where: { zip_code: patientData.zip_code, city: patientData.city },
    });

    try {
      const patient = new Patient();
      patient.firstname = patientData.firstname;
      patient.lastname = patientData.lastname;
      patient.phone_number = patientData.phone_number;
      patient.social_number = patientData.social_number;
      patient.private_assurance = patientData.private_assurance;
      patient.adress = patientData.adress;
      patient.referring_physician = patientData.referring_physician;
      patient.contact_person = patientData.contact_person;
      patient.birth_date = patientData.birth_date;
      patient.birth_city = patientData.birth_city;
      patient.note = patientData.note;
      patient.email = patientData.email;
      patient.gender = patientData.gender;
      if (newcity) {
        patient.city = newcity;
      }
      const numPatient = await patient.save();

      await log('Création patient', {
        updated_by: context.user.id,
        patient: numPatient.id,
      });

      return numPatient;
    } catch (error) {
      throw new GraphQLError(`Échec de la création du patient`, {
        extensions: {
          code: 'PATIENT_CREATION_FAILED',
          originalError: error.message,
        },
      });
    }
  }
}

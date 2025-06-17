import { Arg, Authorized, Mutation, Query, Resolver } from 'type-graphql';
import { GraphQLError } from 'graphql';
import { appointmentDocSecretary } from '../entities/appointmentDocSecretary.entity';
import { Appointment } from '../entities/appointment.entity';
import { DocType } from '../entities/doc-type.entity';
import { AppointmentSecDocInput } from '../types/appointment.type';
import { UserRole } from '../entities/user.entity';

@Resolver()
export class appointmentDocSecretaryResolver {
  @Query(() => [appointmentDocSecretary])
  @Authorized([UserRole.SECRETARY])
  async getDocumentByIDAppSec(
    @Arg('appointmentId') appointmentId: string,
  ): Promise<appointmentDocSecretary[] | null> {
    return await appointmentDocSecretary.find({
      where: { appointmentDoc: { id: +appointmentId } },
      relations: ['appointmentDoc', 'docType'],
      order: { id: 'DESC' },
    });
  }

  @Mutation(() => appointmentDocSecretary)
  @Authorized([UserRole.SECRETARY])
  async addDocumentAppointmentSec(
    @Arg('docInput') docInput: AppointmentSecDocInput,
  ): Promise<appointmentDocSecretary> {
    try {
      const patientDoc = new appointmentDocSecretary();
      patientDoc.name = docInput.name;
      patientDoc.url = docInput.url;
      const AppointmentInfo = await Appointment.findOneOrFail({
        where: { id: +docInput.id },
      });
      patientDoc.appointmentDoc = AppointmentInfo;
      const docTypeInfo = await DocType.findOneOrFail({
        where: { id: docInput.docTypeId },
      });
      patientDoc.docType = docTypeInfo;
      return await patientDoc.save();
    } catch (error) {
      console.error(error);
      throw new GraphQLError('Échec de la création du document', {
        extensions: {
          code: 'DOCUMENT_CREATION_FAILED',
          originalError: error.message,
        },
      });
    }
  }
}

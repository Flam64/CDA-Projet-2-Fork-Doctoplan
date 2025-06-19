import { Arg, Authorized, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { GraphQLError } from 'graphql';
import { appointmentNote } from '../entities/appointmentNote.entity';
import { DocType } from '../entities/doc-type.entity';
import { Appointment } from '../entities/appointment.entity';
import { AppointmentNoteInput } from '../types/appointment.type';
import { appointmentDocDoctor } from '../entities/appointmentDocDoctor.entity';
import { UserRole } from '../entities/user.entity';

@Resolver()
export class appointmentNoteResolver {
  @Query(() => [appointmentNote])
  @Authorized([UserRole.DOCTOR])
  async getAppointmentNoteByID(
    @Arg('appointmentId') appointmentId: string,
  ): Promise<appointmentNote[] | null> {
    return await appointmentNote.find({
      where: { appointmentNote: { id: +appointmentId } },
      relations: ['appointmentNote', 'appointmentDocDocteur', 'appointmentDocDocteur.docType'],
      order: { id: 'DESC' },
    });
  }

  @Mutation(() => appointmentNote)
  @UseMiddleware(AuthMiddleware)
  @Authorized([UserRole.DOCTOR])
  async addNoteAppointment(
    @Arg('note') note: AppointmentNoteInput,
    @Arg('appointmentId') appointmentId: number,
  ): Promise<appointmentNote> {
    const checkAppointment = await Appointment.findOneBy({
      id: appointmentId,
    });
    if (!checkAppointment) {
      throw new GraphQLError('Rendez-vous non trouvé', {
        extensions: {
          code: 'APPOINTMENT_NOT_FOUND',
        },
      });
    }

    try {
      const appointmentNoteEntity = new appointmentNote();
      appointmentNoteEntity.description = note.description;
      appointmentNoteEntity.appointmentNote = checkAppointment;
      const patientSave = await appointmentNoteEntity.save();

      note.document.forEach(async (document) => {
        const checkDocType = await DocType.findOneBy({
          id: document.docTypeId,
        });
        if (!checkDocType) {
          throw new GraphQLError('Type de document non trouvé', {
            extensions: {
              code: 'APPOINTMENT_DOC_TYPE_NOT_FOUND',
            },
          });
        }
        const appointmentDoc = new appointmentDocDoctor();
        appointmentDoc.name = document.name;
        appointmentDoc.url = document.url;
        appointmentDoc.docType = checkDocType;
        appointmentDoc.appointmentDoc = patientSave;
        appointmentDoc.save();
      });

      return patientSave;
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

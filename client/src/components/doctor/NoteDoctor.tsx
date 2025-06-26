import { useGetAppointmentNoteByIdQuery } from '@/types/graphql-generated';
import AddNoteDoctor from '@/components/doctor/AddNoteDoctor';
import SeeNoteDoctor from '@/components/doctor/SeeNoteDoctor';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

type NoteDoctorProps = {
  appointmentId: number;
  isAllNote?: boolean;
  doctorId?: number;
};

export default function NoteDoctor({ appointmentId, isAllNote, doctorId }: NoteDoctorProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    data: dataNote,
    error: errorNote,
    loading: loadingNote,
    refetch: refetchNote,
  } = useGetAppointmentNoteByIdQuery({
    variables: {
      appointmentId: appointmentId.toString(),
    },
  });

  if (errorNote) return;
  if (loadingNote) return;

  return (
    <>
      <article className="bg-white rounded-2xl shadow p-4 relative">
        <h2 className="text-xl font-semibold mb-4">Documents de la consultation</h2>
        {isAllNote ? (
          <div className="absolute top-2 right-5">
            <button
              onClick={() => navigate(`/doctor/appointment/${appointmentId}/update`)}
              className="px-2 w-full py-2 m-2 text-sm font-medium text-white focus:text-blue cta rounded-md hover:bg-blue/90 transition-colors duration-200"
              aria-label="Fermer la note"
            >
              retour au rendez-vous
            </button>
          </div>
        ) : (
          <div className="absolute top-2 right-5">
            <button
              onClick={() => navigate(`/doctor/appointment/${appointmentId}/AllNotes`)}
              className="px-2 w-full py-2 m-2 text-sm font-medium text-white focus:text-blue cta rounded-md hover:bg-blue/90 transition-colors duration-200"
              aria-label="Fermer la note"
            >
              Voir le journal complet
            </button>
          </div>
        )}
        {+(user?.id || '0') === doctorId && (
          <>
            <AddNoteDoctor appointmentId={appointmentId} refetchNote={refetchNote} />
          </>
        )}
        {isAllNote ? (
          <SeeNoteDoctor doctorNote={dataNote} />
        ) : (
          <SeeNoteDoctor doctorNote={dataNote} nbNotes={6} />
        )}
      </article>
    </>
  );
}

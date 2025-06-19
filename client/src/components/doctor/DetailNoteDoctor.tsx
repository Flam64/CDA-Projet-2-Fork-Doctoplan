import { useGetSingleNoteByIdQuery } from '@/types/graphql-generated';
import { Link } from 'react-router-dom';

type DetailNoteDoctorProps = {
  noteId: number;
  setIsModalOpen?: (isOpen: boolean) => void;
};

export default function DetailNoteDoctor({ noteId, setIsModalOpen }: DetailNoteDoctorProps) {
  const {
    data: dataNote,
    error: errorNote,
    loading: loadingNote,
  } = useGetSingleNoteByIdQuery({
    variables: {
      noteId: noteId.toString(),
    },
  });

  if (errorNote) return;
  if (loadingNote) return;

  return (
    <section className="container mx-auto p-4 gap-4 h-screen w-2/5">
      <article className="bg-white mx-auto p-4 border border-borderColor rounded-sm relative">
        <div className="absolute top-2 right-2">
          <button
            onClick={() => setIsModalOpen && setIsModalOpen(false)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Fermer la note"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <h2 className="text-xl font-semibold mb-4">Note de la consultation</h2>
        {dataNote?.getSingleNoteByID.description.split('\n').map((line, index) => {
          const key = index;
          return (
            <p key={key} className="text-gray-600">
              {line}
            </p>
          );
        })}
        {dataNote?.getSingleNoteByID.appointmentDocDocteur?.map(noteDoc => (
          <p key={noteDoc.id}>
            <Link
              to={'/upload/public/appointmentDoctor/' + noteDoc.url}
              target="_blank"
              className="text-right block p-2 border-b last:border-b-0 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {noteDoc.docType.name} - {noteDoc.name}
            </Link>
          </p>
        ))}
      </article>
    </section>
  );
}

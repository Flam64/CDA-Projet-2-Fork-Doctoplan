import { GetAppointmentNoteByIdQuery } from '@/types/graphql-generated';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import DetailNoteDoctor from '@/components/doctor/DetailNoteDoctor';
import { cutStringNote } from '@/utils/cutStringNote';

type SeeNoteDoctorProps = {
  doctorNote: GetAppointmentNoteByIdQuery | undefined;
  nbNotes?: number;
};

export default function SeeNoteDoctor({ doctorNote, nbNotes }: SeeNoteDoctorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteModalId, setnoteModalId] = useState(0);

  const handleOpenModal = (noteid: number) => {
    setIsModalOpen(true);
    setnoteModalId(noteid);
  };
  let backgroundcolor = 'bg-white';

  if (!nbNotes) {
    nbNotes = doctorNote?.getAppointmentNoteByID.length || 0;
  }
  return (
    <>
      <section>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex justify-center  items-center bg-bgModalColor backdrop-blur-xs">
            <DetailNoteDoctor noteId={noteModalId} setIsModalOpen={setIsModalOpen} />
          </div>
        )}
        <ul className="flex flex-wrap gap-4 w-full rounded-md divide-y divide-gray-100 mx-auto bg-white mt-2">
          {doctorNote &&
            doctorNote.getAppointmentNoteByID.map((note, index) => {
              if (index >= nbNotes) return null;
              if (index % 2 === 0) {
                if (backgroundcolor === 'bg-white') {
                  backgroundcolor = 'bg-lightBlue';
                } else {
                  backgroundcolor = 'bg-white';
                }
              }
              return (
                <li
                  key={note.id}
                  className={`w-[calc(50%-0.5rem)] border-1 shadow-sm border-borderColor px-2 py-2 ${backgroundcolor}`}
                >
                  <h2 className="text-xs w-full mb-1 text-black">
                    Créé le {new Date(Number(note.createdAt)).toLocaleDateString('fr-FR')}
                  </h2>
                  <div className="text-sm">
                    {note.description.length > 100 ? (
                      <button
                        onClick={() => handleOpenModal(+note.id)}
                        aria-haspopup="dialog"
                        aria-controls="modal-id"
                        aria-expanded={isModalOpen}
                        className="unstyled-button text-left"
                      >
                        {cutStringNote(note.description, 100)}
                      </button>
                    ) : (
                      <p className="text-black text-sm">{note.description}</p>
                    )}
                    {note.appointmentDocDocteur?.map(noteDoc => (
                      <p key={noteDoc.id}>
                        <Link
                          to={'/upload/public/appointmentDoctor/' + noteDoc.url}
                          target="_blank"
                          className="text-right text-black block p-2 border-b last:border-b-0 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {noteDoc.docType.name} - {noteDoc.name}
                        </Link>
                      </p>
                    ))}
                  </div>
                </li>
              );
            })}
        </ul>
      </section>
    </>
  );
}

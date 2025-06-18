import { useState } from 'react';
import NoteSecretary from '@/components/note/NoteSecretary';
import { DayPilot } from '@daypilot/daypilot-lite-react';
import { useGetNoteByIdAndDateQuery } from '@/types/graphql-generated';

type NoteSecretaryProps = {
  dateNote: DayPilot.Date;
};

export default function NoteList({ dateNote }: NoteSecretaryProps) {
  const [idNote, setNoteId] = useState(0);
  const [showAddNote, setshowAddNote] = useState(false);

  const { data: Notedata, refetch: Noterefetch } = useGetNoteByIdAndDateQuery({
    variables: { dateNote: dateNote.toString().slice(0, 10) },
  });

  return (
    <>
      <button
        type="button"
        className="px-2 py-1 bg-blue text-white cursor-pointer rounded-md h-8 w-30 text-sm mt-2"
        onClick={() => setshowAddNote(true)}
        aria-label="Ajouter Note"
      >
        + Ajouter Note
      </button>
      {showAddNote && (
        <div className="fixed inset-0 z-50 flex justify-center  items-center bg-bgModalColor backdrop-blur-xs">
          <NoteSecretary
            dateNote={dateNote}
            id={idNote}
            Noterefetch={Noterefetch}
            onClose={() => {
              setshowAddNote(false);
              setNoteId(0);
            }}
          />
        </div>
      )}
      <section className="mt-2">
        <ul className="rounded-md divide-y divide-gray-100 w-full mx-auto bg-white space-y-2">
          {Notedata &&
            Notedata.getNoteByIDAndDate.map(item => (
              <li
                key={item.id}
                className="border-l-4 border-b-1 shadow-sm border-blue px-2 py-1 bg-white"
              >
                {item.note.split('\n').map((line, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <p className="text-xs mt-2" key={`${item.id}-${index}`}>
                    {line}
                  </p>
                ))}
                <div className="text-right">
                  <button
                    className={`px-2 py-1 text-xs font-medium text-white bg-bgActiveStatus rounded-md hover:bg-emerald-500 transition-colors duration-200 cursor-pointer`}
                    onClick={() => {
                      setshowAddNote(true);
                      setNoteId(+item.id);
                    }}
                  >
                    Modifier
                  </button>
                </div>
              </li>
            ))}
        </ul>
      </section>
    </>
  );
}

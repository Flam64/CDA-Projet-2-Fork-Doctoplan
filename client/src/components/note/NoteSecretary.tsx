import { useState, useEffect } from 'react';
import { DayPilot } from '@daypilot/daypilot-lite-react';
import { ApolloQueryResult } from '@apollo/client';
import {
  NoteInput,
  useGetNoteByIdLazyQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  GetNoteByIdAndDateQueryVariables,
  GetNoteByIdAndDateQuery,
} from '@/types/graphql-generated';
import TextareaForm from '@/components/form/textareaForm';
import InputForm from '@/components/form/InputForm';
import { toast } from 'react-toastify';

type NoteSecretaryProps = {
  id?: number;
  dateNote: DayPilot.Date;
  onClose: () => void;
  Noterefetch: (
    variables?: Partial<GetNoteByIdAndDateQueryVariables> | undefined,
  ) => Promise<ApolloQueryResult<GetNoteByIdAndDateQuery>>;
};

export default function NoteSecretary({ id, dateNote, onClose, Noterefetch }: NoteSecretaryProps) {
  const [saveNote, setNoteInfo] = useState<NoteInput>({
    id: id || 0,
    dateNote: dateNote.toString().slice(0, 10),
    note: '',
  });

  const [GetNoteByIdQuery] = useGetNoteByIdLazyQuery();
  const [CreateNoteMutation] = useCreateNoteMutation();
  const [UpdateNoteMutation] = useUpdateNoteMutation();

  useEffect(() => {
    if (id) {
      const fetchNote = async () => {
        const { data: dataNote } = await GetNoteByIdQuery({
          variables: {
            getNoteByIdId: id.toString(),
          },
        });
        const myNote = dataNote?.getNoteByID;
        setNoteInfo({
          id: id,
          dateNote: myNote?.dateNote || '',
          note: myNote?.note || '',
        });
      };
      fetchNote();
    }
  }, [id, GetNoteByIdQuery]);

  const HandleInfoPersonnel = (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setNoteInfo(() => ({ ...saveNote, [e.target.name]: e.target.value }));
  };

  const handleSubmitInfo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isUpdate = saveNote.id !== 0;

    const { data: datasave, errors: errorssave } = isUpdate
      ? await UpdateNoteMutation({ variables: { updateNoteNoteData2: saveNote } })
      : await CreateNoteMutation({ variables: { noteData: saveNote } });

    if (datasave) {
      toast.success('Note ' + (isUpdate ? 'modifié' : 'créée') + ' avec succès ! 🚀');
      onClose();
      await Noterefetch({ dateNote: dateNote.toString().slice(0, 10) });
    }
    if (errorssave) {
      toast.error('Erreur lors de la ' + (isUpdate ? 'modification' : 'création') + ' de la note.');
      throw new Error(
        'Erreur lors de la ' + (isUpdate ? 'modification' : 'création') + ' de la note',
      );
    }
  };

  return (
    <>
      <section className="w-full max-w-[90%] sm:max-w-[600px] md:max-w-[700px] lg:w-2/5 mx-auto p-4 h-screen flex items-center justify-center">
        <article className="bg-white w-full p-4 border border-borderColor rounded-md max-h-[90vh] overflow-auto">
          <h2 className="text-xl font-semibold mb-4">Nouvelle Note {id}</h2>
          <form onSubmit={handleSubmitInfo} autoComplete="off">
            <TextareaForm
              title="Note"
              name="note"
              value={(saveNote && saveNote.note) || ''}
              placeholder="Note"
              handle={HandleInfoPersonnel}
            />
            <InputForm
              title="Date Note"
              type="date"
              name="dateNote"
              placeholder="Date Note"
              handle={HandleInfoPersonnel}
              required={true}
              value={(saveNote && saveNote.dateNote) || ''}
            />
            <div className="flex items-center gap-4 justify-center mt-4">
              <button type="button" className="cta-red" onClick={onClose}>
                Annuler
              </button>
              <button type="submit" className="cta">
                Valider
              </button>
            </div>
          </form>
        </article>
      </section>
    </>
  );
}

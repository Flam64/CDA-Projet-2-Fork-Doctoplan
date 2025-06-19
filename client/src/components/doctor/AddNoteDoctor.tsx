import TextareaForm from '@/components/form/textareaForm';
import InputForm from '@/components/form/InputForm';
import FileForm from '@/components/form/FileForm';
import SelectForm from '@/components/form/SelectForm';
import { ApolloQueryResult } from '@apollo/client';
import axiosclient from '@/services/axios';
import {
  useGetAllDocTypeQuery,
  GetAppointmentNoteByIdQuery,
  GetAppointmentNoteByIdQueryVariables,
  AppointmentNoteInput,
  useAddNoteAppointmentMutation,
} from '@/types/graphql-generated';
import { useState } from 'react';

type AddNoteDoctor = {
  appointmentId: number;
  refetchNote: (
    variables?: Partial<GetAppointmentNoteByIdQueryVariables> | undefined,
  ) => Promise<ApolloQueryResult<GetAppointmentNoteByIdQuery>>;
};

export default function AddNoteDoctor({ appointmentId, refetchNote }: AddNoteDoctor) {
  const [addNoteAppointmentMutation] = useAddNoteAppointmentMutation();
  const [addfile, setAddfile] = useState(false);
  const EmptyNote: AppointmentNoteInput = {
    description: '',
    document: [
      {
        docTypeId: 0,
        name: '',
        url: '',
      },
    ],
  };
  const [saveNote, setSaveNote] = useState<AppointmentNoteInput>(EmptyNote);

  const HandleInfoPersonnel = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>,
  ) => {
    if (e.target.name === 'description') {
      setSaveNote({
        ...saveNote,
        [e.target.name]: e.target.value,
      });
    } else {
      if (saveNote && saveNote.document) {
        setSaveNote({
          ...saveNote,
          document: [
            {
              ...saveNote.document[0],
              [e.target.name]: e.target.value,
            },
          ],
        });
      }
    }
  };

  const handleSubmitInfo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const fileInput = form.elements.namedItem('url') as HTMLInputElement;
    if (fileInput?.files?.length) {
      const file = fileInput.files[0];
      const formData = new FormData();
      formData.append('myfile', file);
      formData.append('name', saveNote?.document?.[0]?.name || 'fichier');
      formData.append('description', saveNote?.description || '');
      formData.append('type', String(saveNote?.document?.[0]?.docTypeId ?? ''));
      formData.append('id', appointmentId.toString());
      axiosclient
        .post('/upload/appointment-doctor-file', formData)
        .then(async datafetch => {
          setSaveNote(EmptyNote);
          if (datafetch.data.error) {
            console.error(datafetch.data.error);
          } else {
            await refetchNote({ appointmentId: appointmentId.toString() });
          }
        })
        .catch(err => console.error(err));
    } else {
      await addNoteAppointmentMutation({
        variables: {
          appointmentId: appointmentId,
          note: {
            description: saveNote.description,
            document: [],
          },
        },
      });

      await refetchNote({ appointmentId: appointmentId.toString() });
      setSaveNote(EmptyNote);
    }
  };

  const getAllDocTypeQuery = useGetAllDocTypeQuery({
    variables: { typeDoc: 'appointmentDoctor' },
  });

  if (getAllDocTypeQuery.loading || !getAllDocTypeQuery.data?.getAllDocType) return null;
  const options = getAllDocTypeQuery.data.getAllDocType.map(doc => ({
    key: doc.id,
    value: doc.name,
  }));
  options.unshift({ key: '', value: 'Sélectionner un service' });

  return (
    <>
      <form onSubmit={handleSubmitInfo} autoComplete="off">
        <section className="grid grid-cols-4">
          <article className="col-span-3 p-2">
            <TextareaForm
              title="Note"
              name="description"
              required
              value={saveNote.description}
              rows={8}
              placeholder="Note"
              handle={HandleInfoPersonnel}
            />
          </article>
          <article className="col-span-1 p-2 flex flex-col items-center">
            <button
              type="button"
              onClick={() => setAddfile(!addfile)}
              className="px-2 w-full py-2 m-2 text-sm font-medium text-white focus:text-blue cta rounded-md hover:bg-blue/90 transition-colors duration-200"
            >
              + Ajouter un Fichier
            </button>
            <section className="w-full">
              {addfile && (
                <>
                  <InputForm
                    title="Nom"
                    name="name"
                    placeholder="Nom"
                    handle={HandleInfoPersonnel}
                    value={saveNote?.document?.[0]?.name || ''}
                  />
                  <FileForm
                    title="Ficher"
                    type="file"
                    name="url"
                    placeholder="Ficher"
                    handle={HandleInfoPersonnel}
                    value={saveNote?.document?.[0]?.url || ''}
                  />
                  <SelectForm
                    name="docTypeId"
                    value={saveNote?.document?.[0]?.docTypeId.toString() || '0'}
                    title="Document Type"
                    option={options}
                    handle={HandleInfoPersonnel}
                  />
                </>
              )}
            </section>
          </article>
          <div className="flex items-center col-span-4">
            <button type="submit" className="cta mx-auto">
              Valider
            </button>
          </div>
        </section>
      </form>
    </>
  );
}

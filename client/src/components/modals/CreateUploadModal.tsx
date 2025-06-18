import InputForm from '@/components/form/InputForm';
import { useState } from 'react';
import FileForm from '@/components/form/FileForm';
import SelectForm from '@/components/form/SelectForm';
import {
  GetDocumentByIdQueryHookResult,
  useGetAllDocTypeQuery,
  GetDocumentByIdAppSecQueryHookResult,
} from '@/types/graphql-generated';
import axiosclient from '@/services/axios';

type Upload = {
  id: string;
  name: string;
  file: File;
  type: string;
};

type UploadModalProps = {
  id: string;
  onClose: () => void;
  GetDocumentByIdQuery: GetDocumentByIdQueryHookResult | GetDocumentByIdAppSecQueryHookResult;
  route: string;
  typedoc: string;
};

export default function CreateUploadModal({
  id,
  onClose,
  GetDocumentByIdQuery,
  route,
  typedoc,
}: UploadModalProps) {
  const [saveUpload, setsaveUpload] = useState<Upload | null>({
    id: '',
    name: '',
    file: new File([], ''),
    type: '',
  });
  const getAllDocTypeQuery = useGetAllDocTypeQuery({
    variables: { typeDoc: typedoc },
  });

  if (getAllDocTypeQuery.loading || !getAllDocTypeQuery.data?.getAllDocType) return null;
  const options = getAllDocTypeQuery.data.getAllDocType.map(doc => ({
    key: doc.id,
    value: doc.name,
  }));
  options.unshift({ key: '', value: 'Sélectionner un service' });

  const handleSubmitUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const fileInput = form.elements.namedItem('fileupload') as HTMLInputElement;
    if (fileInput?.files?.length) {
      const file = fileInput.files[0];
      const formData = new FormData();
      formData.append('myfile', file);
      formData.append('name', saveUpload?.name || '');
      formData.append('type', saveUpload?.type || '');
      formData.append('id', id.toString());
      axiosclient
        .post(route, formData)
        .then(async datafetch => {
          setsaveUpload({ id: '', name: '', file: new File([], ''), type: '' });
          if (datafetch.data.error) {
            console.error(datafetch.data.error);
          } else {
            GetDocumentByIdQuery.refetch();
          }
        })
        .catch(err => console.error(err));
    }
    onClose();
  };

  const HandleInfoUpload = (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>,
  ) => {
    if (saveUpload) {
      setsaveUpload(() => ({ ...saveUpload, [e.target.name]: e.target.value }));
    }
  };
  return (
    <>
      <section className="container mx-auto p-4 gap-4 h-screen w-2/5">
        <article className="bg-white mx-auto p-4 border border-borderColor rounded-sm">
          <form onSubmit={handleSubmitUpload}>
            <InputForm
              title="Nom"
              name="name"
              placeholder="Nom"
              handle={HandleInfoUpload}
              required={true}
              value={(saveUpload && saveUpload.name) || ''}
            />
            <FileForm
              title="Ficher"
              type="file"
              name="fileupload"
              placeholder="Ficher"
              handle={HandleInfoUpload}
              required={true}
              value={(saveUpload && saveUpload.file) || ''}
            />
            <SelectForm
              name="type"
              value={(saveUpload && saveUpload.type) || ''}
              title="Document Type"
              option={options}
              handle={HandleInfoUpload}
            />
            <div className="flex items-center">
              <button type="button" className="cta-red mx-auto" onClick={onClose}>
                Annuler
              </button>
              <button type="submit" className="cta mx-auto">
                Valider
              </button>
            </div>
          </form>
        </article>
      </section>
    </>
  );
}

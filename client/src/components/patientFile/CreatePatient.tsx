import { PatientInput, useCreatePatientMutation } from '@/types/graphql-generated';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PersonnalInformation from '@/components/patientFile/PersonnalInformation';
import { formatSSN } from '@/utils/formatSSN';

type CreatePatientProps = {
  onClose: () => void;
};

export default function CreatePatientProps({ onClose }: CreatePatientProps) {
  const navigate = useNavigate();
  const [savePatient, setPersonnalInfo] = useState<PatientInput>({
    adress: '',
    birth_city: '',
    birth_date: '',
    city: '',
    contact_person: '',
    email: '',
    firstname: '',
    gender: '',
    id: '',
    lastname: '',
    note: '',
    phone_number: '',
    private_assurance: '',
    referring_physician: '',
    social_number: '',
    zip_code: '',
  });
  const [msgUpdate, setMsgUpdate] = useState<string[]>([]);
  const [CreatePatientMutation] = useCreatePatientMutation();

  const HandleInfoPersonnel = (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>,
  ) => {
    if (savePatient) {
      if (e.target.name === 'social_number') {
        formatSSN(e.target.value);
        setPersonnalInfo(() => ({ ...savePatient, [e.target.name]: e.target.value }));
      } else {
        setPersonnalInfo(() => ({ ...savePatient, [e.target.name]: e.target.value }));
      }
    }
  };

  const HandleCPVille = (cp: string, ville: string) => {
    console.error(savePatient);
    if (savePatient) {
      setPersonnalInfo(() => ({
        ...savePatient,
        zip_code: cp,
        city: ville,
      }));
    }
  };

  const handleSubmitInfo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsgUpdate([]);
    if (!savePatient) return;
    const errorMsg = [];
    if (savePatient.social_number.match(/^[\d ]*$/) === null) {
      errorMsg.push('Le numéro de sécurité social ne doit contenir que des chiffres');
    }
    if (savePatient.phone_number.match(/^[\d+ .]*$/) === null) {
      errorMsg.push('Le numéro de téléphone ne doit contenir que des chiffres');
    }
    if (savePatient.zip_code.match(/^[\d]*$/) === null) {
      errorMsg.push('Le code postal ne doit contenir que des chiffres');
    }
    if (savePatient.birth_date.match(/^[\d]{4}-[\d]{2}-[\d]{2}/) === null) {
      errorMsg.push('La date de naissance doit être au format YYYY-MM-DD');
    }

    if (errorMsg.length > 0) {
      setMsgUpdate(errorMsg);
      return;
    }

    const { data, errors } = await CreatePatientMutation({
      variables: {
        patientData: savePatient,
      },
    });

    if (data) {
      setMsgUpdate(['Informations modifiées avec succès']);
      navigate(`/secretary/patient/${data.createPatient.id}`);
    }
    if (errors) {
      setMsgUpdate(['Erreur lors de la modification des informations']);
    }
  };

  return (
    <>
      <section className="container mx-auto p-4 gap-4 h-screen w-2/5">
        <article className="bg-white mx-auto p-4 border border-borderColor rounded-sm h-screen overflow-auto">
          <h2 className="text-xl font-semibold mb-4">Nouveau Patient</h2>
          <form onSubmit={handleSubmitInfo} autoComplete="off">
            <PersonnalInformation
              savePatient={savePatient}
              HandleInfoPersonnel={HandleInfoPersonnel}
              HandleCPVille={HandleCPVille}
            />
            <p>*Champs obligatoires</p>
            <div className="text-accent-500 text-center">
              {
                /* eslint-disable react/no-array-index-key */
                msgUpdate.map((msg, index) => (
                  <p key={index} className="text-red-500">
                    {msg}
                  </p>
                ))
              }
            </div>
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

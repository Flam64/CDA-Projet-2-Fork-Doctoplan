import {
  useGetPatientByIdQuery,
  PatientInput,
  useUpdatePatientMutation,
} from '@/types/graphql-generated';
import { useState, useEffect } from 'react';
import inputPersonnal from '@/types/numPatient.type';
import PersonnalInformation from '@/components/patientFile/PersonnalInformation';
import { formatSSN } from '@/utils/formatSSN';

export default function UpdatePatient({ patientNum }: inputPersonnal) {
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
  const GetPatientByIdQuery = useGetPatientByIdQuery({
    variables: { patientId: patientNum },
  });
  const [UpdatePatientMutation] = useUpdatePatientMutation();

  useEffect(() => {
    const patientByID = GetPatientByIdQuery.data?.getPatientByID;
    if (!patientByID) return;
    const fetchUser = async () => {
      setPersonnalInfo({
        ...patientByID,
        zip_code: patientByID.city?.zip_code || '',
        city: patientByID.city?.city || '',
      });
    };
    fetchUser();
  }, [GetPatientByIdQuery.data?.getPatientByID]);

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

    const { data, errors } = await UpdatePatientMutation({
      variables: {
        patientData: savePatient,
      },
    });

    if (data) {
      setMsgUpdate(['Informations modifiées avec succès']);
    }
    if (errors) {
      setMsgUpdate(['Erreur lors de la modification des informations']);
    }
  };

  if (GetPatientByIdQuery.loading) return <p>Loading...</p>;
  if (GetPatientByIdQuery.error) return <p>Error</p>;

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Informations personnelles</h2>
      <form onSubmit={handleSubmitInfo}>
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
        <button type="submit" className="cta block mx-auto">
          Modifier
        </button>
      </form>
    </>
  );
}

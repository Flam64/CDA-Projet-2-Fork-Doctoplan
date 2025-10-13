import { PatientInput } from '@/types/graphql-generated';
import InputForm from '@/components/form/InputForm';
import InputFormCP from '@/components/form/InputFormCP';
import SelectForm from '@/components/form/SelectForm';
import { formatSSN } from '@/utils/formatSSN';

type PropsPersonnalInfo = {
  savePatient: PatientInput | null;
  HandleInfoPersonnel: (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>,
  ) => void;
  HandleCPVille: (cp: string, ville: string) => void;
};

export default function PersonnalInformation({
  savePatient,
  HandleInfoPersonnel,
  HandleCPVille,
}: PropsPersonnalInfo) {
  if (!savePatient) {
    return;
  }
  return (
    <>
      <InputForm
        title="Nom"
        name="lastname"
        placeholder="Nom"
        handle={HandleInfoPersonnel}
        required={true}
        value={(savePatient && savePatient.lastname) || ''}
      />
      <InputForm
        title="Prénom"
        name="firstname"
        placeholder="Prénom"
        handle={HandleInfoPersonnel}
        required={true}
        value={(savePatient && savePatient.firstname) || ''}
      />
      <InputForm
        title="Téléphone"
        name="phone_number"
        placeholder="Téléphone"
        handle={HandleInfoPersonnel}
        required={true}
        value={(savePatient && savePatient.phone_number) || ''}
      />
      <InputForm
        title="Email"
        type="email"
        name="email"
        placeholder="Email"
        handle={HandleInfoPersonnel}
        value={(savePatient && savePatient.email) || ''}
      />
      <InputForm
        title="Numéro de sécurité sociale"
        name="social_number"
        placeholder="Numéro de sécurité sociale"
        handle={HandleInfoPersonnel}
        required={true}
        value={formatSSN(savePatient && savePatient.social_number) || ''}
      />
      <InputForm
        title="Assurance"
        name="private_assurance"
        placeholder="Assurance"
        handle={HandleInfoPersonnel}
        value={(savePatient && savePatient.private_assurance) || ''}
      />
      <SelectForm
        title="Genre"
        name="gender"
        option={[
          { key: '', value: 'Choix' },
          { key: 'M', value: 'Homme' },
          { key: 'F', value: 'Femme' },
        ]}
        handle={HandleInfoPersonnel}
        value={(savePatient && savePatient.gender) || ''}
      />
      <InputForm
        title="Date de naissance"
        type="date"
        name="birth_date"
        placeholder="Date de naissance"
        handle={HandleInfoPersonnel}
        required={true}
        value={(savePatient && savePatient.birth_date) || ''}
      />
      <InputForm
        title="Adresse"
        name="adress"
        placeholder="Adresse"
        handle={HandleInfoPersonnel}
        required={true}
        value={(savePatient && savePatient.adress) || ''}
      />
      <InputFormCP
        handle={HandleCPVille}
        value={(savePatient && savePatient.zip_code) || '00000'}
        valuecity={(savePatient && savePatient.city) || ''}
      />
      <InputForm
        title="Personne à contacter"
        name="contact_person"
        placeholder="Personne à contacter"
        handle={HandleInfoPersonnel}
        value={(savePatient && savePatient.contact_person) || ''}
      />
      <InputForm
        title="Médecin traitant"
        name="referring_physician"
        placeholder="Médecin traitant"
        handle={HandleInfoPersonnel}
        value={(savePatient && savePatient.referring_physician) || ''}
      />
    </>
  );
}

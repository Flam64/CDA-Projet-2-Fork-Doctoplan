import React from 'react';
import InputForm from '../form/InputForm';
import SelectForm from '../form/SelectForm';
import { CreateUserInput } from '@/types/graphql-generated';

type UserFormProps = {
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  id: string | null;
  formData: CreateUserInput;
};

export default function UserPersonalForm({ handleInputChange, formData }: UserFormProps) {
  const userGender = [
    { key: 'M', value: 'Homme' },
    { key: 'F', value: 'Femme' },
  ];

  return (
    <section className="w-full md:w-2/5">
      <h3 className="text-blue mb-2">Information personnelles</h3>
      <InputForm
        title="Nom"
        name="lastname"
        type="text"
        value={formData.lastname}
        placeholder="Nom"
        handle={handleInputChange}
        required={true}
      />
      <InputForm
        title="Prénom"
        name="firstname"
        type="text"
        value={formData.firstname}
        placeholder="Prénom"
        handle={handleInputChange}
        required={true}
      />
      <SelectForm
        title="Genre"
        name="gender"
        option={[{ key: '', value: 'Sélectionner' }, ...userGender]}
        value={formData.gender ?? ''}
        handle={handleInputChange}
        required={true}
      />
      <InputForm
        title="Téléphone"
        name="tel"
        type="text"
        value={formData.tel ?? ''}
        placeholder="Téléphone"
        handle={handleInputChange}
      />
      <InputForm
        title="Email"
        name="email"
        type="email"
        value={formData.email}
        placeholder="Email"
        handle={handleInputChange}
        required={true}
      />
    </section>
  );
}

import React from 'react';
import InputForm from '../form/InputForm';
import SelectForm from '../form/SelectForm';
import { CreateUserInput, useGetDepartementsQuery } from '@/types/graphql-generated';

type UserFormProps = {
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>,
    field: string,
  ) => void;
  id: string | null;
  formData: CreateUserInput;
};

export default function UserProfessionalForm({ handleInputChange, formData, id }: UserFormProps) {
  const { data } = useGetDepartementsQuery();
  const userRole = [
    { key: 'admin', value: 'Admin' },
    { key: 'doctor', value: 'Doctor' },
    { key: 'agent', value: 'Agent' },
    { key: 'secretary', value: 'Secretary' },
  ];
  const userStatus = [
    { key: 'active', value: 'Active' },
    { key: 'inactive', value: 'Inactive' },
    { key: 'pending', value: 'Pending' },
  ];

  return (
    <section className="w-full md:w-2/5">
      <h3 className="text-blue mb-2">Information professionnelles</h3>
      <SelectForm
        title="Service"
        name="departementId"
        required={true}
        option={[
          { key: '', value: 'Sélectionner un service' },
          ...(data?.getDepartements?.map(department => ({
            key: department.id,
            value: department.label,
          })) || []),
        ]}
        value={formData.departementId?.toString()}
        handle={e => handleInputChange(e, 'departementId')}
      />
      <SelectForm
        title="Status"
        name="status"
        option={userStatus}
        value={formData.status ?? 'active'}
        handle={e => handleInputChange(e, 'status')}
      />
      <InputForm
        title="Date d'activation"
        name="activationDate"
        type="date"
        value={formData.activationDate ?? ''}
        placeholder="Nom"
        handle={e => handleInputChange(e, 'activationDate')}
      />
      <SelectForm
        title="Role"
        name="role"
        option={[{ key: '', value: 'Sélectionner un role' }, ...userRole]}
        value={formData.role ?? ''}
        handle={e => handleInputChange(e, 'role')}
        disabled={id ? true : false}
      />
    </section>
  );
}

import SelectForm from '@/components/form/SelectForm';
import { useGetDoctorsByDepartementQuery } from '@/types/graphql-generated';
import { useAppointmentContext } from '@/hooks/useAppointment';

export default function DoctorSelect() {
  const { selectedDepartment, SaveAppointment, handleAppointment } = useAppointmentContext();
  const { data: datadpt } = useGetDoctorsByDepartementQuery({
    variables: { id: parseInt(selectedDepartment) },
  });

  const optionSelectDoctor =
    datadpt?.getDoctorsByDepartement?.map(doctor => ({
      key: doctor.id.toString(),
      value: `${doctor.firstname} ${doctor.lastname} ${doctor.email}`,
    })) || [];
  optionSelectDoctor.unshift({
    key: '',
    value: 'Sélectionner un médecin',
  });

  return (
    <div className="mb-4">
      <SelectForm
        name="user_id"
        value={SaveAppointment.user_id || ''}
        title="Docteur"
        option={optionSelectDoctor}
        handle={handleAppointment}
      />
    </div>
  );
}

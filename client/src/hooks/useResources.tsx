import { useGetDoctorsByDepartementQuery } from '@/types/graphql-generated';

export default function useResources(id: string) {
  const { data, loading, error } = useGetDoctorsByDepartementQuery({
    variables: { id: parseInt(id) },
  });

  const doctors = data?.getDoctorsByDepartement ?? [];

  const resources = doctors.map(doctor => {
    return {
      id: doctor.id,
      name: `${doctor.firstname} ${doctor.lastname}`,
      speciality: doctor.departement?.label ?? 'Département inconnu',
      avatar: '/doctoplan-logo.svg',
    };
  });

  return { resources, loading, error };
}

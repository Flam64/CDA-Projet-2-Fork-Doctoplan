import { useSearchPatientsQuery, useSearchDoctorsQuery } from '@/types/graphql-generated';
import type { Patient } from '@/types/patient.type';
import type { Doctor } from '@/types/doctor.type';

export default function useSearchSources(
  searchQuery: string,
  role: 'doctor' | 'secretary' = 'secretary',
) {
  const {
    data: patientData,
    loading: loadingPatients,
    error: errorPatients,
  } = useSearchPatientsQuery({
    variables: { query: searchQuery },
    skip: searchQuery.length < 2,
  });

  const {
    data: doctorData,
    loading: loadingDoctors,
    error: errorDoctors,
  } = useSearchDoctorsQuery({
    variables: { query: searchQuery },
    skip: searchQuery.length < 2 || role === 'doctor', // ⛔ skip doctor search if role is 'doctor'
  });

  const sources = [];

  // Always include patients
  sources.push({
    name: 'Patients',
    items: (patientData?.searchPatients ?? []) as Array<Patient | Doctor>,
    loading: loadingPatients,
    error: errorPatients?.message ?? null,
    getKey: (patient: Patient | Doctor) => `patient-${patient.id}`,
  });

  // Include doctors only for secretaries
  if (role === 'secretary') {
    sources.push({
      name: 'Médecins',
      items: (doctorData?.searchDoctors ?? []) as Array<Patient | Doctor>,
      loading: loadingDoctors,
      error: errorDoctors?.message ?? null,
      getKey: (doctor: Patient | Doctor) => `doctor-${doctor.id}`,
    });
  }

  return sources;
}

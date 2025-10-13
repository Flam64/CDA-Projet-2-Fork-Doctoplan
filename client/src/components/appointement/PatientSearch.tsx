import { useState } from 'react';
import { useSearchPatientsQuery } from '@/types/graphql-generated';
import UserItem from '@/components/user/UserItem';
import SearchBar, { SearchSource } from '@/components/form/SearchBar';
import { Patient } from '@/types/patient.type';

type PatientSearchProps = {
  selectedPatient: Patient | null;
  setSelectedPatient: (p: Patient) => void;
};

export default function PatientSearch({ selectedPatient, setSelectedPatient }: PatientSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const { data, loading, error } = useSearchPatientsQuery({
    variables: { query: searchQuery },
    skip: searchQuery.length < 2,
  });

  const searchSources: SearchSource<Patient>[] = [
    {
      name: 'Patients',
      items: data?.searchPatients ?? [],
      loading,
      error: error ? error.message : null,
      getKey: (patient: Patient) => `patient-${patient.id}`,
    },
  ];

  return (
    <div className="w-full">
      <SearchBar<Patient>
        placeholder="Rechercher un patient..."
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        sources={searchSources}
      >
        {(patient, _source, onSelect) => (
          <button
            type="button"
            className="w-full text-left block p-2 border-b last:border-b-0 hover:bg-gray-100"
            onClick={() => {
              setSelectedPatient(patient);
              onSelect();
            }}
          >
            <p className="font-semibold">
              🧑 {patient.firstname} {patient.lastname}
            </p>
            <p className="text-sm text-gray-500">N° sécu : {patient.social_number}</p>
          </button>
        )}
      </SearchBar>

      <div className="w-full min-h-[5rem] flex items-center transition-all duration-300 mt-4">
        {selectedPatient && (
          <div className="animate-fadeInSlideIn w-full" key={selectedPatient.id}>
            <UserItem<Patient> user={selectedPatient}>
              {p => (
                <p>
                  <span className="font-bold">
                    {p.firstname} {p.lastname}
                  </span>
                  - N° sécu : {p.social_number}
                </p>
              )}
            </UserItem>
          </div>
        )}
      </div>
    </div>
  );
}

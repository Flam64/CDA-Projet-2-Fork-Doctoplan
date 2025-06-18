import { Link } from 'react-router-dom';
import DepartmentSelect from '@/components/form/DepartmentSelect';
import CreatePatient from '@/components/patientFile/CreatePatient';
import SearchBar, { type SearchSource } from '@/components/form/SearchBar';
import type { Doctor } from '@/types/doctor.type';
import type { Patient } from '@/types/patient.type';
import { useState } from 'react';

type AgendaHeaderProps = {
  showDepartmentSelector?: boolean;
  selectedDepartment?: string;
  setSelectedDepartment?: (val: string) => void;
  setCurrentPage?: (page: number) => void;

  // Patient management (button + modal included)
  enableCreatePatient?: boolean;

  // Optional custom action (e.g. create appointment, manage absences)
  renderActionButton?: React.ReactNode;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  searchSources: SearchSource<Patient | Doctor>[];
  placeholder?: string;
};

export default function AgendaHeader({
  showDepartmentSelector = true,
  selectedDepartment,
  setSelectedDepartment,
  setCurrentPage,
  enableCreatePatient = false,
  renderActionButton,
  searchQuery,
  setSearchQuery,
  isOpen,
  setIsOpen,
  searchSources,
  placeholder,
}: AgendaHeaderProps) {
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);

  return (
    <section className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
      {/* Left controls: department selector + patient creation + custom actions */}
      <div className="flex flex-wrap lg:flex-nowrap items-center gap-4 w-full lg:w-auto">
        {showDepartmentSelector && selectedDepartment && setSelectedDepartment && (
          <DepartmentSelect
            value={selectedDepartment}
            onChange={newLabel => {
              setSelectedDepartment(newLabel);
              setCurrentPage?.(0);
            }}
          />
        )}

        {enableCreatePatient && (
          <>
            <button
              type="button"
              className="standard-button w-auto whitespace-nowrap text-base"
              onClick={() => setShowAddPatientModal(true)}
            >
              Créer un patient
            </button>
            {showAddPatientModal && (
              <div className="fixed inset-0 z-50 flex justify-center items-center bg-bgModalColor backdrop-blur-xs">
                <CreatePatient onClose={() => setShowAddPatientModal(false)} />
              </div>
            )}
          </>
        )}

        {renderActionButton && <div className="flex-shrink-0">{renderActionButton}</div>}
      </div>

      {/* Right: Search bar */}
      <div className="flex justify-center lg:justify-end w-full">
        <div className="w-full max-w-xs">
          <SearchBar<Patient | Doctor>
            placeholder={placeholder || 'Chercher un patient ou un médecin'}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            sources={searchSources}
          >
            {(item, source, onSelect) => {
              if (source.name === 'Patients') {
                const patient = item as Patient;
                return (
                  <Link
                    to={`/secretary/patient/${patient.id}`}
                    className="block p-2 border-b last:border-b-0 hover:bg-gray-100"
                    onClick={onSelect}
                  >
                    <p className="font-semibold">
                      🧑 {patient.firstname} {patient.lastname}
                    </p>
                    <p className="text-sm text-gray-500">N° sécu : {patient.social_number}</p>
                  </Link>
                );
              }
              if (source.name === 'Médecins') {
                const doctor = item as Doctor;
                return (
                  <Link
                    to={`/secretary/doctor/${doctor.id}/agenda`}
                    className="block p-2 border-b last:border-b-0 hover:bg-gray-100"
                    onClick={onSelect}
                  >
                    <p className="font-semibold">
                      👨‍⚕️ {doctor.firstname} {doctor.lastname}
                    </p>
                    <p className="text-sm text-gray-500">{doctor.departement.label}</p>
                  </Link>
                );
              }
              return null;
            }}
          </SearchBar>
        </div>
      </div>
    </section>
  );
}

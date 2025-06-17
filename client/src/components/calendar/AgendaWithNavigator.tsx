import { useEffect, useMemo, useState } from 'react';
import { DayPilot, DayPilotCalendar, DayPilotNavigator } from '@daypilot/daypilot-lite-react';
import useAppointmentsData from '@/hooks/useAppointmentsData';
import useResponsiveAgendaPageSize from '@/hooks/useResponsiveAgendaPageSize';
import PaginationControls from './PaginationControls';
import useResources from '@/hooks/useResources';
import DepartmentSelect from '@/components/form/DepartmentSelect';
import CreatePatient from '@/components/patientFile/CreatePatient';
import SearchBar from '@/components/form/SearchBar';
import NoteList from '@/components/note/NoteList';
import type { Appointment } from '@/types/CalendarEvent.type';
import { roundStartToNextHalfHour } from '@/utils/roundStartToNextHalfHour';
import { Link, useNavigate } from 'react-router-dom';
import { useSearchPatientsQuery, useSearchDoctorsQuery } from '@/types/graphql-generated';
import { Doctor } from '@/types/doctor.type';
import { Patient } from '@/types/patient.type';
import ConfirmationModal from '../modals/ConfirmationModal';
import { useAppointmentContext } from '@/hooks/useAppointment';

type EventClickArgs = {
  e: {
    data: {
      id: string;
      text: string;
      start: DayPilot.Date;
      end: DayPilot.Date;
      resource: string | number;
      patient_name: string;
      appointment_type: string;
      [key: string]: unknown;
    };
  };
};

export default function AgendaWithNavigator() {
  const DEFAULT_DEPARTMENT = '1';
  const [startDate, setStartDate] = useState<DayPilot.Date>(DayPilot.Date.today());
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedDepartment, setSelectedDepartment] = useState(DEFAULT_DEPARTMENT);

  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const { resources } = useResources(selectedDepartment);

  const pageSize = useResponsiveAgendaPageSize();
  const visibleResources = resources.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const doctorIds = useMemo(() => visibleResources.map(r => Number(r.id)), [visibleResources]);
  const selectedDate = useMemo(() => startDate.toDate(), [startDate]);

  const { appointments, refetch: refetchAppointments } = useAppointmentsData(
    doctorIds,
    selectedDate,
  );

  const { needToBeRefresh, setNeedToBeRefresh } = useAppointmentContext();

  useEffect(() => {
    if (needToBeRefresh) {
      refetchAppointments();
      setNeedToBeRefresh(false);
    }
  }, [needToBeRefresh, refetchAppointments, setNeedToBeRefresh]);

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
    skip: searchQuery.length < 2,
  });

  const searchSources = [
    {
      name: 'Patients',
      items: (patientData?.searchPatients ?? []) as Array<Patient | Doctor>,
      /* 🚨 searchBar(sources) expects a homogeneous array: SearchSource<Patient | Doctor>[] (if there are two data sources).
        TypeScript does not accept: SearchSource<Patient>[] and SearchSource<Doctor>[] are not equivalent to SearchSource<Patient | Doctor>[].
        You must make a union*/
      loading: loadingPatients,
      error: errorPatients ? errorPatients.message : null,
      getKey: (patient: Patient | Doctor) => `patient-${patient.id}`,
    },
    {
      name: 'Médecins',
      items: (doctorData?.searchDoctors ?? []) as Array<Patient | Doctor>,
      loading: loadingDoctors,
      error: errorDoctors ? errorDoctors.message : null,
      getKey: (doctor: Patient | Doctor) => `doctor-${doctor.id}`,
    },
  ];
  const [modalOpen, setModalOpen] = useState(false);
  const [showAddPatientModal, setshowAddPatientModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', onConfirm: () => {} });
  const navigate = useNavigate();

  function handleEventClick(args: EventClickArgs) {
    const event = args.e.data;

    setModalContent({
      title: 'Modifier le rendez-vous',
      message: `Voulez-vous modifier le rendez-vous de ${event.text} ?`,
      onConfirm: () => navigate('/secretary'), // TODO: navigate to update rdv event.id
    });

    setModalOpen(true);
  }

  function handleTimeRangeSelected(args: {
    start: DayPilot.Date;
    end: DayPilot.Date;
    resource: string | number;
  }) {
    const doctorId = args.resource;
    const date = args.start.toString();

    setModalContent({
      title: 'Créer un rendez-vous',
      message: `Souhaitez-vous créer un rendez-vous le ${date.slice(0, 16).replace('T', ' à ')} ?`,
      onConfirm: () => navigate(`/secretary/doctor/${doctorId}/appointment/create?date=${date}`),
    });

    setModalOpen(true);
  }

  return (
    <div
      className="py-6 px-6 md:px-24"
      role="region"
      aria-label="Agenda de tous les professionnels du service"
    >
      <section className="flex flex-col md:flex-row lg:justify-between md:items-center gap-4 mb-6">
        <div className="flex justify-center lg:justify-start w-full">
          <DepartmentSelect
            value={selectedDepartment}
            onChange={newLabel => {
              setSelectedDepartment(newLabel);
              setCurrentPage(0);
            }}
          />
          <button
            type="button"
            className="px-3 py-1 bg-blue text-white cursor-pointer rounded-md h-10 mt-8 ml-8"
            onClick={() => setshowAddPatientModal(true)}
            aria-label="Ajouter un document administratif"
          >
            Créer un patient
          </button>
          {showAddPatientModal && (
            <div className="fixed inset-0 z-50 flex justify-center  items-center bg-bgModalColor backdrop-blur-xs">
              <CreatePatient
                onClose={() => {
                  setshowAddPatientModal(false);
                }}
              />
            </div>
          )}
        </div>
        <div className="flex justify-center md:justify-end w-full">
          <div className="w-full max-w-xs">
            <SearchBar<Patient | Doctor>
              placeholder="Rechercher un patient ou un médecin..."
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
                        🧑 {String(patient.firstname)} {String(patient.lastname)}
                      </p>
                      <p className="text-sm text-gray-500">
                        N° sécu : {String(patient.social_number)}
                      </p>
                    </Link>
                  );
                }
                if (source.name === 'Médecins') {
                  const doctor = item as Doctor;
                  return (
                    <Link
                      to="/secretary"
                      className="block p-2 border-b last:border-b-0 hover:bg-gray-100"
                      onClick={onSelect}
                    >
                      <p className="font-semibold">
                        👨‍⚕️ {String(doctor.firstname)} {String(doctor.lastname)}
                      </p>
                      <p className="text-sm text-gray-500">{String(doctor.departement.label)}</p>
                    </Link>
                  );
                }
                return null;
              }}
            </SearchBar>
          </div>
        </div>
      </section>

      {/* Pagination desktop */}
      <section
        className="hidden lg:flex justify-end items-center gap-4 mb-4"
        role="navigation"
        aria-label="Pagination desktop"
      >
        <PaginationControls
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          totalItems={resources.length}
        />
      </section>

      <section className="flex flex-col lg:flex-row gap-10 mt-6">
        <aside
          aria-label="Navigateur de date"
          className="flex flex-col justify-center lg:justify-start bg-white border-1 p-7 rounded-md border-gray-300"
        >
          <DayPilotNavigator
            selectMode="Day"
            showMonths={1}
            skipMonths={1}
            locale="fr-fr"
            selectionDay={startDate}
            onTimeRangeSelected={args => setStartDate(args.day)}
          />
          <NoteList dateNote={startDate} />
        </aside>

        <section className="lg:hidden" role="navigation" aria-label="Pagination mobile">
          <PaginationControls
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            totalItems={resources.length}
            className="mb-4"
          />
        </section>

        <article className="flex-1" aria-label="Agenda de tous les médecins et leurs rendez-vous">
          <DayPilotCalendar
            viewType="Resources"
            startDate={startDate}
            timeFormat="Clock24Hours"
            locale="fr-fr"
            columns={visibleResources.map(resource => ({
              name: resource.name,
              id: resource.id,
              html: `
                <div class="flex items-center gap-3 p-2">
                  <img src="${resource.avatar}" alt="${resource.name}" class="w-8 h-8 object-cover" />
                  <div>
                    <div class="text-sm font-semibold text-blue">${resource.name}</div>
                    <div class="text-xs text-gray-400">${resource.speciality}</div>
                  </div>
                </div>
              `,
            }))}
            events={appointments.map((event: Appointment) => {
              const doctorId = event.doctor_id;
              const snappedStart = roundStartToNextHalfHour(event.start_time);
              const snappedEnd = new Date(snappedStart);
              snappedEnd.setMinutes(snappedStart.getMinutes() + 30);

              return {
                id: event.id,
                text: event.patient_name,
                html: `
                <div style="background-color: #e2e8f0; line-height:1.2;">
                  <p style="font-weight: 600; font-size: 11px;">${event.patient_name}</p>
                  <p style="color: #4b5563; font-size: 10px;">
                    ${event.appointment_type} 
                    <span class="text-xs text-gray-400">Debut: ${event.start_time.slice(11, 16)}</span>
                  </p>
                </div>
              `,
                start: new DayPilot.Date(snappedStart.toISOString()),
                end: new DayPilot.Date(snappedEnd.toISOString()),
                resource: doctorId,
              };
            })}
            onEventClick={handleEventClick}
            onTimeRangeSelected={handleTimeRangeSelected}
          />
        </article>
        <ConfirmationModal
          isOpen={modalOpen}
          title={modalContent.title}
          message={modalContent.message}
          onConfirm={() => {
            setModalOpen(false);
            modalContent.onConfirm();
          }}
          onCancel={() => {
            setModalOpen(false);
            navigate('/secretary');
          }}
        />
      </section>
    </div>
  );
}

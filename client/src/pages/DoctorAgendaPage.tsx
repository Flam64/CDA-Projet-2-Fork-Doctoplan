import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { DayPilot } from '@daypilot/daypilot-lite-react';

import { useAuth } from '@/hooks/useAuth';
import useSyncAgendaWithLegalLimit from '@/hooks/useSyncAgendaWithLegalLimit';
import useAgendaEventHandlers from '@/hooks/useAgendaEventHandlers';
import useSearchSources from '@/hooks/useSearchSources';
import { useGetUserByIdQuery } from '@/types/graphql-generated';

import useDoctorWeekAppointments from '@/hooks/useDoctorWeekAppointments';

import AgendaHeader from '@/components/calendar/AgendaHeader';
import DoctorAgendaCalendar from '@/components/calendar/DoctorAgendaCalendar';
import AgendaDateNavigator from '@/components/calendar/AgendaDateNavigator';
import ConfirmationModal from '@/components/modals/ConfirmationModal';

export default function DoctorAgendaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isDoctor = user?.role === 'doctor';
  const doctorId = id ? Number(id) : user?.id;

  const { data: doctorData, loading: doctorLoading } = useGetUserByIdQuery({
    variables: { id: String(doctorId ?? '') },
    skip: isDoctor || !doctorId,
  });

  const displayedDoctor = isDoctor ? user : doctorData?.getUserById;

  const appointmentCreateUrl = isDoctor
    ? `/doctor/appointment/create`
    : `/secretary/doctor/${doctorId}/appointment/create`;

  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {},
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchSources = useSearchSources(searchQuery, 'doctor');

  const {
    selectedAgendaDate: startDate,
    handleDateSelectionWithLimit,
    agendaCalendarRef: calendarRef,
    agendaNavigatorRef: navigatorRef,
  } = useSyncAgendaWithLegalLimit((title, message, onConfirm) => {
    setModalContent({
      title,
      message,
      onConfirm,
      onCancel: () => {
        navigate(user?.role === 'doctor' ? '/doctor' : `/secretary/doctor/${doctorId}/agenda`);
      },
    });
    setModalOpen(true);
  });

  const weekDays = useMemo(() => {
    const monday = new Date(startDate.toDate());
    const day = monday.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    monday.setDate(monday.getDate() + diff);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return new DayPilot.Date(date);
    });
  }, [startDate]);

  const appointmentDays = useMemo(() => weekDays.map(day => day.toDate()), [weekDays]);

  const { appointments } = useDoctorWeekAppointments(
    doctorId !== undefined ? Number(doctorId) : undefined,
    appointmentDays,
  );

  function setModalContentAndOpen(content: {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  }) {
    setModalContent(content);
    setModalOpen(true);
  }

  const parsedDoctorId = doctorId !== undefined ? Number(doctorId) : undefined;

  const { handleEventClick, handleTimeRangeSelected } = useAgendaEventHandlers({
    onModalOpen: setModalContentAndOpen,
    navigate,
    limitDate: DayPilot.Date.today().addMonths(3),
    userRole: user?.role as 'doctor' | 'secretary',
    fromPage: 'doctor',
    ...(parsedDoctorId !== undefined && { doctorId: parsedDoctorId }),
  });

  if (doctorLoading) return null;

  return (
    <section
      className="py-6 px-6 md:px-24 mb-6 animate-fadeInSlideIn"
      aria-label="Agenda du médecin"
    >
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div className="flex items-center gap-4 flex-wrap min-h-[42px]">
          <button
            className="standard-button text-base whitespace-nowrap"
            onClick={() => navigate(appointmentCreateUrl, { state: { from: '/doctor' } })}
          >
            Créer un rendez-vous
          </button>
          <h1 className="text-base lg:text-lg font-medium flex items-center gap-2 leading-none">
            {user?.role === 'doctor' ? 'Votre emploi du temps' : 'Emploi du temps de'}
            <span className="text-2xl">👩‍⚕️</span>
            <span className="text-accent font-bold">
              {displayedDoctor?.firstname} {displayedDoctor?.lastname}
            </span>
            {displayedDoctor?.departement?.label && (
              <span className="text-sm text-blue">, {displayedDoctor?.departement.label}</span>
            )}
          </h1>
        </div>

        <div className="w-full lg:w-auto">
          <AgendaHeader
            showDepartmentSelector={false}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isOpen={isSearchOpen}
            setIsOpen={setIsSearchOpen}
            searchSources={searchSources}
            placeholder={
              user?.role === 'doctor' ? 'Chercher un patient' : 'Chercher un patient ou un médecin'
            }
            userRole="doctor"
            renderActionButton={
              user?.role === 'doctor' && (
                <Link
                  to={'/doctor/vacation'}
                  type="button"
                  className="standard-button whitespace-nowrap text-base"
                >
                  Gérer mes congés
                </Link>
              )
            }
          />
        </div>
      </div>

      <section className="flex flex-col lg:flex-row gap-10 mt-6">
        <AgendaDateNavigator
          navigatorRef={navigatorRef}
          startDate={startDate}
          onDateSelect={handleDateSelectionWithLimit}
        />

        <DoctorAgendaCalendar
          calendarRef={calendarRef}
          startDate={startDate}
          visibleDays={weekDays}
          appointments={appointments}
          onEventClick={handleEventClick}
          onTimeRangeSelected={handleTimeRangeSelected}
        />

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
            modalContent.onCancel();
          }}
        />
      </section>
    </section>
  );
}

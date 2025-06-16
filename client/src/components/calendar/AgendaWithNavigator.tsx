import { useMemo, useState } from 'react';
import { DayPilot } from '@daypilot/daypilot-lite-react';
import { useNavigate } from 'react-router-dom';

import useAppointmentsData from '@/hooks/useAppointmentsData';
import useResponsiveAgendaPageSize from '@/hooks/useResponsiveAgendaPageSize';
import useResources from '@/hooks/useResources';
import useSyncAgendaWithLegalLimit from '@/hooks/useSyncAgendaWithLegalLimit';

import AgendaHeader from './AgendaHeader';
import AgendaPagination from './AgendaPagination';
import AgendaCalendar from './AgendaCalendar';
import AgendaDateNavigator from './AgendaDateNavigator';
import ConfirmationModal from '../modals/ConfirmationModal';
import useSearchSources from '@/hooks/useSearchSources';
import useAgendaEventHandlers from '@/hooks/useAgendaEventHandlers';
import useAgendaRefresh from '@/hooks/useAgendaRefresh';

export default function AgendaWithNavigator() {
  const DEFAULT_DEPARTMENT = '1';
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedDepartment, setSelectedDepartment] = useState(DEFAULT_DEPARTMENT);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const navigate = useNavigate();

  const {
    selectedAgendaDate: startDate,
    handleDateSelectionWithLimit,
    agendaCalendarRef: calendarRef,
    agendaNavigatorRef: navigatorRef,
  } = useSyncAgendaWithLegalLimit((title, message, onConfirm) => {
    setModalContent({ title, message, onConfirm });
    setModalOpen(true);
  });

  const { resources } = useResources(selectedDepartment);
  const pageSize = useResponsiveAgendaPageSize();
  const visibleResources = resources.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const doctorIds = useMemo(() => visibleResources.map(r => Number(r.id)), [visibleResources]);
  const selectedDate = useMemo(() => startDate.toDate(), [startDate]);

  const { appointments, refetch: refetchAppointments } = useAppointmentsData(
    doctorIds,
    selectedDate,
  );

  useAgendaRefresh(refetchAppointments);

  const searchSources = useSearchSources(searchQuery);

  const { handleEventClick, handleTimeRangeSelected } = useAgendaEventHandlers({
    onModalOpen: setModalContentAndOpen,
    navigate,
    limitDate: DayPilot.Date.today().addMonths(3),
  });

  function setModalContentAndOpen(content: {
    title: string;
    message: string;
    onConfirm: () => void;
  }) {
    setModalContent(content);
    setModalOpen(true);
  }

  return (
    <div
      className="py-6 px-6 md:px-24"
      role="region"
      aria-label="Agenda de tous les professionnels du service"
    >
      <AgendaHeader
        showDepartmentSelector={true}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        setCurrentPage={setCurrentPage}
        enableCreatePatient={true}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        searchSources={searchSources}
      />

      {/* DESKTOP PAGINATION CONTROLS */}
      <section
        className="hidden lg:flex justify-end items-center gap-4 mb-4"
        role="navigation"
        aria-label="Pagination desktop"
      >
        <AgendaPagination
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          totalItems={resources.length}
          isMobile={false}
        />
      </section>

      <section className="flex flex-col lg:flex-row gap-10 mt-6">
        <AgendaDateNavigator
          navigatorRef={navigatorRef}
          startDate={startDate}
          onDateSelect={handleDateSelectionWithLimit}
        />

        {/* MOBILE PAGINATION CONTROLS */}
        <section className="lg:hidden mb-4" role="navigation" aria-label="Pagination mobile">
          <AgendaPagination
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            totalItems={resources.length}
            isMobile={true}
          />
        </section>

        <AgendaCalendar
          calendarRef={calendarRef}
          startDate={startDate}
          appointments={appointments}
          visibleResources={visibleResources}
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
            navigate('/secretary');
          }}
        />
      </section>
    </div>
  );
}

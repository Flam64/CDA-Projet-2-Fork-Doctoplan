import { DayPilot } from '@daypilot/daypilot-lite-react';
import type { Appointment } from '@/types/CalendarEvent.type';

type UseAgendaEventHandlersParams = {
  onModalOpen: (modal: { title: string; message: string; onConfirm: () => void }) => void;
  navigate: (path: string) => void;
  limitDate: DayPilot.Date;
  fallbackDate?: DayPilot.Date;
};

export default function useAgendaEventHandlers({
  onModalOpen,
  navigate,
  limitDate,
}: UseAgendaEventHandlersParams) {
  function handleEventClick(args: { e: { data: Appointment } }) {
    const event = args.e.data;

    onModalOpen({
      title: 'Modifier le rendez-vous',
      message: `Voulez-vous modifier le rendez-vous de ${event.patient_name} ?`,
      onConfirm: () => navigate('/secretary'),
    });
  }

  function handleTimeRangeSelected(args: {
    start: DayPilot.Date;
    end: DayPilot.Date;
    resource: string | number;
  }) {
    const selectedDate = args.start;

    if (selectedDate > limitDate) {
      onModalOpen({
        title: 'Date non disponible',
        message: `Les rendez-vous ne peuvent pas être créés après le ${limitDate.toString('dd/MM/yyyy')}.`,
        onConfirm: () => navigate('/secretary'),
      });
      return;
    }

    const doctorId = args.resource;
    const date = selectedDate.toString();

    onModalOpen({
      title: 'Créer un rendez-vous',
      message: `Souhaitez-vous créer un rendez-vous le ${date.slice(0, 16).replace('T', ' à ')} ?`,
      onConfirm: () => navigate(`/secretary/doctor/${doctorId}/appointment/create?date=${date}`),
    });
  }

  return { handleEventClick, handleTimeRangeSelected };
}

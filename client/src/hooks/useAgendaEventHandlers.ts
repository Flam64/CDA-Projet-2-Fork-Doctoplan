import { DayPilot } from '@daypilot/daypilot-lite-react';

type UserRole = 'doctor' | 'secretary';

type UseAgendaEventHandlersParams = {
  onModalOpen: (modal: { title: string; message: string; onConfirm: () => void }) => void;
  navigate: (path: string) => void;
  limitDate: DayPilot.Date;
  userRole: UserRole;
};

export default function useAgendaEventHandlers({
  onModalOpen,
  navigate,
  limitDate,
  userRole,
}: UseAgendaEventHandlersParams) {
  function handleEventClick(args: { e: { data: DayPilot.EventData } }) {
    const event = args.e.data;

    onModalOpen({
      title: 'Modifier le rendez-vous',
      message: `Voulez-vous modifier le rendez-vous de ${event.text} ?`,
      onConfirm: () => {
        const updateUrl =
          userRole === 'doctor'
            ? `/doctor/appointment/${event.id}/update`
            : `/secretary/appointment/${event.id}/update`;
        navigate(updateUrl);
      },
    });
  }

  function handleTimeRangeSelected(args: {
    start: DayPilot.Date;
    end: DayPilot.Date;
    resource?: string | number;
  }) {
    const selectedDate = args.start;

    if (selectedDate > limitDate) {
      onModalOpen({
        title: 'Date non disponible',
        message: `Les rendez-vous ne peuvent pas être créés après le ${limitDate.toString('dd/MM/yyyy')}.`,
        onConfirm: () => {
          navigate(userRole === 'doctor' ? '/doctor' : '/secretary');
        },
      });
      return;
    }

    const doctorId = args.resource;
    const date = selectedDate.toString(); // format ISO

    const baseUrl =
      userRole === 'doctor'
        ? `/doctor/appointment/create?date=${date}`
        : `/secretary/doctor/${doctorId}/appointment/create?date=${date}`;

    onModalOpen({
      title: 'Créer un rendez-vous',
      message: `Souhaitez-vous créer un rendez-vous le ${date.slice(0, 16).replace('T', ' à ')} ?`,
      onConfirm: () => {
        navigate(baseUrl);
      },
    });
  }

  return {
    handleEventClick,
    handleTimeRangeSelected,
  };
}

import { DayPilot } from '@daypilot/daypilot-lite-react';

type UserRole = 'doctor' | 'secretary';

type OnModalOpenProps = {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

type UseAgendaEventHandlersParams = {
  onModalOpen: (modal: OnModalOpenProps) => void;
  navigate: (path: string, options?: { state?: Record<string, string> }) => void;
  limitDate: DayPilot.Date;
  userRole: UserRole;
  doctorId?: number | undefined;
  fromPage?: 'doctor' | 'secretary' | 'global'; // global : vue multi médecin
};

export default function useAgendaEventHandlers({
  onModalOpen,
  navigate,
  limitDate,
  userRole,
  doctorId,
  fromPage = 'global',
}: UseAgendaEventHandlersParams) {
  function handleEventClick(args: { e: { data: DayPilot.EventData } }) {
    const event = args.e.data as {
      id: string | number;
      text: string;
    };

    const updateUrl =
      userRole === 'doctor'
        ? `/doctor/appointment/${event.id}/update`
        : `/secretary/appointment/${event.id}/update`;

    const cancelUrl =
      userRole === 'doctor'
        ? '/doctor'
        : fromPage === 'doctor'
          ? `/secretary/doctor/${doctorId}/agenda`
          : '/secretary';

    onModalOpen({
      title: 'Modifier le rendez-vous',
      message: `Voulez-vous modifier le rendez-vous de ${event.text} ?`,
      onConfirm: () => navigate(updateUrl),
      onCancel: () => navigate(cancelUrl),
    });
  }

  function handleTimeRangeSelected(args: {
    start: DayPilot.Date;
    end: DayPilot.Date;
    resource?: string | number;
  }) {
    const selectedDate = args.start;

    const doctorIdForSecretary = fromPage === 'doctor' ? doctorId : args.resource;

    if (selectedDate > limitDate) {
      const cancelUrl =
        userRole === 'doctor'
          ? '/doctor'
          : fromPage === 'doctor'
            ? `/secretary/doctor/${doctorId}/agenda`
            : '/secretary';

      onModalOpen({
        title: 'Date non disponible',
        message: `Les rendez-vous ne peuvent pas être créés après le ${limitDate.toString('dd/MM/yyyy')}.`,
        onConfirm: () => {
          navigate(userRole === 'doctor' ? '/doctor' : '/secretary');
        },
        onCancel: () => {
          navigate(cancelUrl);
        },
      });
      return;
    }

    if (userRole === 'secretary' && !doctorIdForSecretary) {
      console.warn('Aucun médecin sélectionné pour créer un rendez-vous.');
      return;
    }

    const date = selectedDate.toString();

    const baseUrl =
      userRole === 'doctor'
        ? `/doctor/appointment/create?date=${date}`
        : `/secretary/doctor/${doctorIdForSecretary}/appointment/create?date=${date}`;

    const cancelUrl =
      userRole === 'doctor'
        ? '/doctor'
        : fromPage === 'doctor'
          ? `/secretary/doctor/${doctorIdForSecretary}/agenda`
          : '/secretary';

    onModalOpen({
      title: 'Créer un rendez-vous',
      message: `Souhaitez-vous créer un rendez-vous le ${date.slice(0, 16).replace('T', ' à ')} ?`,
      onConfirm: () => {
        const state: Record<string, string> | undefined =
          userRole === 'secretary' && fromPage === 'global' ? { from: '/secretary' } : undefined;
        if (state) {
          navigate(baseUrl, { state });
        } else {
          navigate(baseUrl);
        }
      },
      onCancel: () => navigate(cancelUrl),
    });
  }

  return {
    handleEventClick,
    handleTimeRangeSelected,
  };
}

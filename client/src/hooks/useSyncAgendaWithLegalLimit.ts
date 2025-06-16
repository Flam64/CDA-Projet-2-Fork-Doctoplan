import { useState, useRef } from 'react';
import { DayPilot, DayPilotCalendar, DayPilotNavigator } from '@daypilot/daypilot-lite-react';

type UseSyncAgendaWithLegalLimit = {
  selectedAgendaDate: DayPilot.Date;
  updateAgendaDate: (newDate: DayPilot.Date) => void;
  agendaCalendarRef: React.RefObject<DayPilotCalendar | null>;
  agendaNavigatorRef: React.RefObject<DayPilotNavigator | null>;
  handleDateSelectionWithLimit: (selectedDate: DayPilot.Date) => void;
};

export default function useSyncAgendaWithLegalLimit(
  openModal?: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
  ) => void,
): UseSyncAgendaWithLegalLimit {
  const [selectedAgendaDate, setSelectedAgendaDate] = useState(DayPilot.Date.today());

  const agendaCalendarRef = useRef<DayPilotCalendar>(null);
  const agendaNavigatorRef = useRef<DayPilotNavigator>(null);

  const resetToToday = () => {
    const today = DayPilot.Date.today();
    setSelectedAgendaDate(today);
    agendaCalendarRef.current?.control?.update({ startDate: today });
    agendaNavigatorRef.current?.control?.select(today);
  };

  const handleDateSelectionWithLimit = (selectedDate: DayPilot.Date) => {
    const today = DayPilot.Date.today();
    const maxDate = today.addMonths(3);
    const calendar = agendaCalendarRef.current?.control;
    const navigator = agendaNavigatorRef.current?.control;

    // ❌ Date before today
    if (selectedDate < today) {
      if (openModal) {
        openModal(
          'Date invalide',
          `Il est impossible de créer un rendez-vous pour une date antérieure à aujourd’hui (${today.toString('dd/MM/yyyy')}).`,
          resetToToday,
        );
      } else {
        resetToToday();
      }
      return;
    }

    // ❌ Date beyond the 3 month limit
    if (selectedDate > maxDate) {
      if (openModal) {
        openModal(
          'Date non autorisée',
          `Les rendez-vous ne peuvent pas dépasser le ${maxDate.toString('dd/MM/yyyy')}.`,
          resetToToday,
        );
      } else {
        resetToToday();
      }
      return;
    }

    // ✅ Valid date
    setSelectedAgendaDate(selectedDate);
    calendar?.update({ startDate: selectedDate });
    navigator?.select(selectedDate);
  };

  const updateAgendaDate = (newDate: DayPilot.Date) => {
    setSelectedAgendaDate(newDate);
    agendaCalendarRef.current?.control?.update({ startDate: newDate });
    agendaNavigatorRef.current?.control?.select(newDate);
  };

  return {
    selectedAgendaDate,
    updateAgendaDate,
    agendaCalendarRef,
    agendaNavigatorRef,
    handleDateSelectionWithLimit,
  };
}

import { DayPilotNavigator } from '@daypilot/daypilot-lite-react';
import { useAppointmentContext } from '@/hooks/useAppointment';

export default function Calendar() {
  const { selectedDay, handleSelectedDay } = useAppointmentContext();
  return (
    <>
      <DayPilotNavigator
        selectMode="Day"
        showMonths={1}
        skipMonths={1}
        locale="fr-fr"
        selectionDay={selectedDay} // toujours un DayPilot.Date valide
        onTimeRangeSelected={args => handleSelectedDay(args.day)} // gestion des changements
      />
    </>
  );
}

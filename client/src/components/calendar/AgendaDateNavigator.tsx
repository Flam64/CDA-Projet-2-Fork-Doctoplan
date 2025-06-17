import { DayPilotNavigator, DayPilot } from '@daypilot/daypilot-lite-react';
import type { RefObject } from 'react';

type AgendaDateNavigatorProps = {
  navigatorRef: RefObject<DayPilotNavigator | null>;
  startDate: DayPilot.Date;
  onDateSelect: (day: DayPilot.Date) => void;
};

export default function AgendaDateNavigator({
  navigatorRef,
  startDate,
  onDateSelect,
}: AgendaDateNavigatorProps) {
  return (
    <aside
      aria-label="Navigateur de date"
      className="flex justify-center lg:justify-start bg-white border-1 p-7 rounded-md border-gray-300"
    >
      <DayPilotNavigator
        ref={navigatorRef}
        selectMode="Day"
        showMonths={1}
        skipMonths={1}
        locale="fr-fr"
        selectionDay={startDate}
        onTimeRangeSelected={args => onDateSelect(args.day)}
        onBeforeCellRender={args => {
          const today = DayPilot.Date.today().getDatePart();

          // Don't make disabled today
          if (args.cell.isToday) return;

          const cellDay = parseInt(args.cell.html);
          const jsDate = startDate instanceof DayPilot.Date ? startDate.toDate() : startDate;
          const year = jsDate.getFullYear();
          const month = jsDate.getMonth();

          const cellDate = new DayPilot.Date(new Date(year, month, cellDay)).getDatePart();

          if (cellDate < today) {
            args.cell.cssClass = 'past-date-disabled';
          }
        }}
      />
    </aside>
  );
}

import { DayPilotNavigator, DayPilot } from '@daypilot/daypilot-lite-react';
import type { RefObject } from 'react';
import NoteList from '@/components/note/NoteList';

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
      className="flex flex-col sm:flex-row lg:flex-col gap-6 bg-white border-1 p-7 rounded-md border-gray-300"
      aria-label="Navigateur de date"
    >
      <div className="w-full sm:w-1/2 lg:w-full sm:mx-0 mx-auto max-w-[240px] self-center">
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
      </div>

      <div className="w-full sm:w-1/2 lg:w-full">
        <NoteList dateNote={startDate} />
      </div>
    </aside>
  );
}

import { DayPilot, DayPilotCalendar } from '@daypilot/daypilot-lite-react';
import { roundStartToNextHalfHour } from '@/utils/roundStartToNextHalfHour';
import type { Appointment } from '@/types/CalendarEvent.type';
import { RefObject } from 'react';

type DoctorAgendaCalendarProps = {
  calendarRef: RefObject<DayPilotCalendar | null>;
  startDate: DayPilot.Date;
  visibleDays: DayPilot.Date[];
  appointments: Appointment[];
  onEventClick: (args: { e: { data: Appointment } }) => void;
  onTimeRangeSelected: (args: {
    start: DayPilot.Date;
    end: DayPilot.Date;
    resource: string | number;
  }) => void;
};

export default function DoctorAgendaCalendar({
  calendarRef,
  startDate,
  visibleDays,
  appointments,
  onEventClick,
  onTimeRangeSelected,
}: DoctorAgendaCalendarProps) {
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <article className="flex-1" aria-label="Agenda du médecin">
      <DayPilotCalendar
        ref={calendarRef}
        viewType="Resources"
        startDate={startDate}
        timeFormat="Clock24Hours"
        locale="fr-fr"
        headerDateFormat="dddd d/MM"
        columns={visibleDays.map((date, index) => {
          const label = date.toString('dddd d/MM', 'fr-fr');
          return {
            id: index,
            name: capitalize(date.toString('dddd', 'fr-fr')),
            html: `
      <div class="text-sm font-semibold text-blue">
        ${capitalize(label)}
      </div>
    `,
          };
        })}
        events={appointments.map(event => {
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
                  <span class="text-xs text-gray-400">Début: ${event.start_time.slice(11, 16)}</span>
                </p>
              </div>
            `,
            start: new DayPilot.Date(snappedStart.toISOString()),
            end: new DayPilot.Date(snappedEnd.toISOString()),
            resource: visibleDays.findIndex(
              day => day.toString().slice(0, 10) === snappedStart.toISOString().slice(0, 10),
            ),
          };
        })}
        onEventClick={onEventClick}
        onTimeRangeSelected={onTimeRangeSelected}
      />
    </article>
  );
}

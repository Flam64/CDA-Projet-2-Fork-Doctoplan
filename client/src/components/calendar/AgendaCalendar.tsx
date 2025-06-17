import { DayPilot, DayPilotCalendar } from '@daypilot/daypilot-lite-react';
import { roundStartToNextHalfHour } from '@/utils/roundStartToNextHalfHour';
import type { Appointment } from '@/types/CalendarEvent.type';
import { RefObject, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type AgendaCalendarProps = {
  calendarRef: RefObject<DayPilotCalendar | null>;
  startDate: DayPilot.Date;
  appointments: Appointment[];
  visibleResources: {
    id: string | number;
    name: string;
    avatar: string;
    speciality: string;
  }[];
  onEventClick: (args: { e: { data: Appointment } }) => void;
  onTimeRangeSelected: (args: {
    start: DayPilot.Date;
    end: DayPilot.Date;
    resource: string | number;
  }) => void;
};

export default function AgendaCalendar({
  calendarRef,
  startDate,
  appointments,
  visibleResources,
  onEventClick,
  onTimeRangeSelected,
}: AgendaCalendarProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Checks that the user clicked on an <a> tag
      if (target.tagName === 'A' && target.classList.contains('doctor-name')) {
        e.preventDefault();
        const id = target.getAttribute('data-id');
        if (id) {
          navigate(`/secretary/doctor/${id}/agenda`);
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [navigate]);
  // 🔽 This useEffect intercepts clicks on doctors' names
  // displayed in DayPilot's columns.
  // These links are created in an HTML string (not in JSX),
  // so React can't automatically attach a click handler to them.
  // We therefore listen for all clicks on the page, and filter
  // to react only to those on <a> tags that have the "doctor-name" class.
  // We use `navigate()` to redirect via React Router (SPA) without reloading the page,
  // even if the link already contains an href.

  return (
    <article className="flex-1" aria-label="Agenda de tous les médecins et leurs rendez-vous">
      <DayPilotCalendar
        ref={calendarRef}
        viewType="Resources"
        startDate={startDate}
        timeFormat="Clock24Hours"
        locale="fr-fr"
        columns={visibleResources.map(resource => ({
          name: resource.name,
          id: resource.id,
          html: `
            <div class="flex items-center gap-3 p-2">
              <img src="${resource.avatar}" alt="${resource.name}" class="w-8 h-8 object-cover" />
              <div>
                <a 
                  href="/secretary/doctorAgenda/${resource.id}" 
                  class="doctor-name text-sm font-semibold text-blue hover:underline"
                  data-id="${resource.id}"
                >
                  ${resource.name}
                </a>
                <div class="text-xs text-gray-400">${resource.speciality}</div>
              </div>
            </div>
          `,
        }))}
        events={appointments.map(event => {
          const doctorId = event.doctor_id;
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
            resource: doctorId,
          };
        })}
        onEventClick={onEventClick}
        onTimeRangeSelected={onTimeRangeSelected}
      />
    </article>
  );
}

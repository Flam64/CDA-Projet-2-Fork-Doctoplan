import { useState, useEffect, useMemo, useCallback } from 'react';
import { useGetAppointmentsByDoctorAndDateLazyQuery } from '@/types/graphql-generated';
import type { Appointment as AppointmentType } from '@/types/CalendarEvent.type';

export default function useDoctorWeekAppointments(doctorId: number | undefined, dates: Date[]) {
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [fetchAppointments] = useGetAppointmentsByDoctorAndDateLazyQuery();

  const formattedDates = useMemo(() => dates.map(d => d.toISOString().slice(0, 10)), [dates]);

  const refetch = useCallback(async () => {
    if (!doctorId || formattedDates.length === 0) {
      setAppointments([]);
      return;
    }

    setLoading(true);
    try {
      const results = await Promise.all(
        formattedDates.map(async date => {
          const res = await fetchAppointments({
            variables: { doctorId, date },
          });
          return res.data?.getAppointmentsByDoctorAndDate ?? [];
        }),
      );

      const all = results.flat().map(appt => {
        const start = new Date(appt.start_time);
        const end = new Date(start.getTime() + appt.duration * 60 * 1000);

        return {
          id: String(appt.id),
          patient_name: `${appt.patient.firstname} ${appt.patient.lastname}`,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          statut: appt.status,
          appointment_type: appt.appointmentType.reason,
          doctor_id: String(appt.doctor.id),
        };
      });

      setAppointments(all);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [doctorId, formattedDates, fetchAppointments]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { appointments, loading, error, refetch };
}

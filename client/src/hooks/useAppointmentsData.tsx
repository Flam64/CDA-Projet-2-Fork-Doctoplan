import { useState, useEffect, useMemo, useCallback } from 'react';
import { useGetAppointmentsByDoctorAndDateLazyQuery } from '@/types/graphql-generated';
import type { Appointment as AppointmentType } from '@/types/CalendarEvent.type';

export default function useAppointmentsData(doctorIds: number[], date: Date) {
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [fetchAppointments] = useGetAppointmentsByDoctorAndDateLazyQuery();

  const formattedDate = useMemo(() => date.toISOString().slice(0, 10), [date]);

  const refetch = useCallback(async () => {
    if (doctorIds.length === 0) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const results = await Promise.all(
        doctorIds.map(async doctorId => {
          const res = await fetchAppointments({
            variables: { doctorId, date: formattedDate },
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
      setError(err instanceof Error ? err : new Error('An unknown error has occurred'));
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [doctorIds, formattedDate, fetchAppointments]);

  //  Prevent infinite loop using stable dependencies
  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formattedDate, JSON.stringify(doctorIds)]);

  return { appointments, loading, error, refetch };
}

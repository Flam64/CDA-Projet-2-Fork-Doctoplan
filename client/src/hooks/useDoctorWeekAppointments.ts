import { useState, useEffect } from 'react';
import { useGetAppointmentsByDoctorAndDateLazyQuery } from '@/types/graphql-generated';
import type { Appointment as AppointmentType } from '@/types/CalendarEvent.type';

export default function useDoctorWeekAppointments(doctorId: number | undefined, dates: Date[]) {
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [fetchAppointments] = useGetAppointmentsByDoctorAndDateLazyQuery();

  useEffect(() => {
    if (!doctorId || dates.length === 0) {
      setAppointments([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);

      try {
        const formattedDates = dates.map(d => d.toISOString().slice(0, 10));
        const results = await Promise.all(
          formattedDates.map(date =>
            fetchAppointments({ variables: { doctorId, date } }).then(
              res => res.data?.getAppointmentsByDoctorAndDate ?? [],
            ),
          ),
        );

        const allAppointments = results.flat().map(appt => {
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

        setAppointments(allAppointments);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erreur inconnue'));
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [doctorId, fetchAppointments, dates]);

  return { appointments, loading, error };
}

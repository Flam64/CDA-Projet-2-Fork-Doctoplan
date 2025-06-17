import { useEffect } from 'react';
import { useAppointmentContext } from '@/hooks/useAppointment';

export default function useAgendaRefresh(refetchAppointments: () => void) {
  const { needToBeRefresh, setNeedToBeRefresh } = useAppointmentContext();

  useEffect(() => {
    if (needToBeRefresh) {
      refetchAppointments();
      setNeedToBeRefresh(false);
    }
  }, [needToBeRefresh, refetchAppointments, setNeedToBeRefresh]);
}

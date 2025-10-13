import { useContext } from 'react';
import { AppointmentContext, AppointmentContextType } from '@/contexts/createappointment.context';

export function useAppointmentContext(): AppointmentContextType {
  const context = useContext(AppointmentContext);

  if (context === undefined) {
    throw new Error('useAppointmentContext must be used within an AuthProvider');
  }

  return context;
}

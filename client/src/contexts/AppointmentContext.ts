import { createContext } from 'react';
import { DayPilot } from '@daypilot/daypilot-lite-react';
import { PatientAppointment } from '@/types/appointement.type';

export type AppointmentContextType = {
  selectedDepartment: string;
  selectedDay: DayPilot.Date;
  SaveAppointment: PatientAppointment;
  handleSelectedDepartment: (value: string) => void;
  handleStartChange: (value: string) => void;
  handleTypeChange: (value: string, name: string) => void;
  handleAppointmentChange: (appointment: PatientAppointment) => void;
  handleAppointment: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleSelectedDay: (value: DayPilot.Date) => void;
  handleSubmitAppointment: () => void;
  handleUpdateAppointment: (appointmentId: string) => void;
  needToBeRefresh: boolean;
  setNeedToBeRefresh: (value: boolean) => void;
};

export const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

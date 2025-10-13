import { DayPilot } from '@daypilot/daypilot-lite-react';

//******** Minimum type of appointments required for calculation.
export type AppointmentSlot = {
  start_time: string;
  duration: number;
};

//******** Converts a time (HH:MM) to a UTC timestamp in milliseconds for a given day.
export const toDateTime = (time: string, date: DayPilot.Date): number => {
  const [hour, minute] = time.split(':').map(Number);
  const dateIsoString = date.toDate().toISOString().slice(0, 10);
  const dateObj = new Date(dateIsoString + 'T00:00:00Z');
  dateObj.setUTCHours(hour, minute, 0, 0);
  return dateObj.getTime();
};

//******** Checks if two intervals overlap.
export const isOverlap = (startA: number, endA: number, startB: number, endB: number): boolean => {
  return startA < endB && startB < endA;
};

//******** Check if a slot is available based on existing appointments.
export const isSlotAvailable = (
  time: string,
  date: DayPilot.Date,
  appointments: AppointmentSlot[],
): boolean => {
  const slotStart = toDateTime(time, date);
  const slotEnd = slotStart + 30 * 60 * 1000;

  return !appointments.some(appt => {
    const apptStart = new Date(appt.start_time).getTime();
    const apptEnd = apptStart + appt.duration * 60 * 1000;
    return isOverlap(slotStart, slotEnd, apptStart, apptEnd);
  });
};

//******** Checks if a slot is available based on existing appointments. Returns the list of unavailable time slots.
export const getDisabledTimes = (
  date: DayPilot.Date,
  appointments: AppointmentSlot[],
  hours: string[],
): string[] => {
  return hours.filter(hour => !isSlotAvailable(hour, date, appointments));
};

import { useAppointmentContext } from '@/hooks/useAppointment';
import alarmClockOff from '@/assets/alarm-clock-off.svg';

export default function TimeDisplayInputEnd() {
  const { SaveAppointment } = useAppointmentContext();

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="end-time" className="text-sm text-blue-900 font-semibold">
        Fin
      </label>
      <div className="relative w-[136px] h-[60px]">
        <img
          src={alarmClockOff}
          alt="Icône fin"
          className="absolute left-2 top-1/2 transform -translate-y-1/2 w-5 h-5"
        />
        <input
          id="end-time"
          type="time"
          value={SaveAppointment.end || ''}
          disabled
          className="w-full h-full pl-10 pr-4 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
        />
      </div>
    </div>
  );
}

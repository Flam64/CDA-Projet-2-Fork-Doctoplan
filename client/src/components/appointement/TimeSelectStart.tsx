import { generateTimeOptions } from '@/utils/generatedTimeOptions';
import { useAppointmentContext } from '@/hooks/useAppointment';
import alarmClockOn from '@/assets/alarm-clock-on.svg';

type TimeSelectStartProps = {
  disabledOptions?: string[];
};

export default function TimeSelectStart({ disabledOptions }: TimeSelectStartProps) {
  const timeOptions = generateTimeOptions();
  const { SaveAppointment, handleStartChange } = useAppointmentContext();

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="start-time" className="text-sm text-blue-900 font-semibold">
        Début
      </label>
      <div className="relative w-[134px] h-[60px]">
        <img
          src={alarmClockOn}
          alt="Icône début"
          className="absolute left-2 top-1/2 transform -translate-y-1/2 w-5 h-5"
        />
        <select
          id="start-time"
          value={SaveAppointment.start || ''}
          onChange={e => handleStartChange(e.target.value)}
          className="w-full h-full pl-10 pr-4 border border-gray-300 rounded-lg bg-white text-blue-900 cursor-pointer"
        >
          <option value="">-</option>
          {timeOptions.map(time => {
            const isDisabled = disabledOptions?.includes(time);
            return (
              <option
                key={time}
                value={time}
                disabled={isDisabled}
                className={isDisabled ? 'bg-red-100 text-red-400' : ''}
              >
                {time}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
}

import { useAppointmentContext } from '@/hooks/useAppointment';
import { formatDate } from '@/utils/formatDateFr';

export default function DateDisplayInput() {
  const { selectedDay } = useAppointmentContext();

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="day-selected" className="text-sm text-blue-900 font-semibold">
        Jour
      </label>
      <div className="w-[134px] h-[60px]">
        <input
          id="day-selected"
          type="text"
          value={formatDate(selectedDay.toDate())}
          disabled
          className="w-full h-full text-center border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
        />
      </div>
    </div>
  );
}

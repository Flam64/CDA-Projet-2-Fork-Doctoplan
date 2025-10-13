import { Planning } from '@/pages/CreateUser';
import UserButtons from './UserButtons';
import { useMemo } from 'react';
import { useUserPlanningState } from '@/hooks/useUserPlanningState';

const days = [
  { fr: 'Lundi', en: 'Monday' },
  { fr: 'Mardi', en: 'Tuesday' },
  { fr: 'Mercredi', en: 'Wednesday' },
  { fr: 'Jeudi', en: 'Thursday' },
  { fr: 'Vendredi', en: 'Friday' },
  { fr: 'Samedi', en: 'Saturday' },
  { fr: 'Dimanche', en: 'Sunday' },
];

type UserPlanningProps = {
  userPlanning: Planning;
  setUserPlanning: (planning: Planning | ((prev: Planning) => Planning)) => void;
  error: string;
  isDisable: boolean;
  setError: (error: string) => void;
  setIsDisable: (isDisable: boolean) => void;
  id?: string;
};

export default function UserPlanning({
  userPlanning,
  setUserPlanning,
  error,
  setError,
  isDisable,
  setIsDisable,
  id,
}: UserPlanningProps) {
  const timeOptions = useMemo(() => {
    return Array.from({ length: 48 }, (_, i) => {
      const hours = Math.floor(i / 2);
      const minutes = i % 2 === 0 ? '00' : '30';
      return `${hours}h${minutes}`;
    });
  }, []);

  const getMinutes = (time: string | null) => {
    if (!time) return null;
    const [h, m] = time.split('h');
    return parseInt(h) * 60 + parseInt(m);
  };
  const userPlanningState = useUserPlanningState(id ?? '');
  const planning = userPlanningState.user?.plannings?.find(plan => plan.end === null);

  const possibleDate = planning?.start
    ? new Date(new Date(planning.start).setMonth(new Date(planning.start).getMonth() + 3))
    : undefined;

  const calculateTotalWeeklyMinutes = (planning: Planning): number => {
    return Object.values(planning.period.days).reduce((total, { start, end }) => {
      const startMin = getMinutes(start);
      const endMin = getMinutes(end);
      if (startMin !== null && endMin !== null && endMin > startMin) {
        return total + (endMin - startMin);
      }
      return total;
    }, 0);
  };

  const handleChange = (day: string, field: 'start' | 'end' | 'startPeriod', value: string) => {
    setIsDisable(false);
    setError('');

    setUserPlanning(prev => {
      if (field === 'startPeriod') {
        const updatedPlanning = {
          ...prev,
          period: {
            ...prev.period,
            start: value,
          },
        };
        return updatedPlanning;
      } else {
        const updatedDay = {
          ...prev.period.days[day],
          [field]: value,
        };
        const startMin = getMinutes(updatedDay.start);
        const endMin = getMinutes(updatedDay.end);

        if (startMin !== null && endMin !== null && startMin >= endMin) {
          setError("L'heure de fin doit être supérieure à l'heure de début.");
          setIsDisable(true);
          return prev;
        }

        if ((startMin !== null && endMin === null) || (endMin !== null && startMin === null)) {
          setError('Les deux horaires doivent être remplis.');
          setIsDisable(true);
        }

        const updatedPlanning = {
          ...prev,
          period: {
            ...prev.period,
            days: {
              ...prev.period.days,
              [day]: updatedDay,
            },
          },
        };
        const totalHours = calculateTotalWeeklyMinutes(updatedPlanning) / 60;
        if (totalHours > 48) {
          setError('Le total hebdomadaire dépasse 48 heures.');
          setIsDisable(true);
        }

        return updatedPlanning;
      }
    });
  };
  return (
    <section className="bg-white items-center p-12 mb-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-blue font-semibold ">
          {id ? `Ajouter un nouveau planning` : 'Planning du nouveau médecin'}
        </h3>
        {id && (
          <>
            <label className="mr-2" htmlFor="planning">
              Date de début
            </label>
            <input
              id="planning"
              type="date"
              required={true}
              value={userPlanning.period.start}
              min={possibleDate?.toISOString().split('T')[0]}
              onChange={e => handleChange('period', 'startPeriod', e.target.value)}
            />
          </>
        )}
      </div>
      {error && (
        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
          {error}
        </div>
      )}
      <article className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {days.map(({ fr, en }) => (
          <div key={en} className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
            <p className="font-semibold mb-2">{fr}</p>
            <div className="flex flex-col items-start gap-2">
              <span>Début</span>
              <select
                value={userPlanning.period.days[en].start}
                onChange={e => handleChange(en, 'start', e.target.value)}
                className="border border-gray-300 rounded p-1"
              >
                <option value="">-</option>
                {timeOptions.map(time => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col items-start gap-2">
              <span>Fin</span>
              <select
                value={userPlanning.period.days[en].end}
                onChange={e => handleChange(en, 'end', e.target.value)}
                className="border border-gray-300 rounded p-1"
              >
                <option value="">-</option>
                {timeOptions.map(time => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </article>
      <UserButtons id={null} isDisable={isDisable} />
    </section>
  );
}

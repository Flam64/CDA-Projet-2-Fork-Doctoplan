import { Planning } from '@/pages/CreateUser';
import { useGetUserByIdQuery } from '@/types/graphql-generated';
import { useState } from 'react';
const days = [
  { fr: 'Lundi', en: 'Monday' },
  { fr: 'Mardi', en: 'Tuesday' },
  { fr: 'Mercredi', en: 'Wednesday' },
  { fr: 'Jeudi', en: 'Thursday' },
  { fr: 'Vendredi', en: 'Friday' },
  { fr: 'Samedi', en: 'Saturday' },
  { fr: 'Dimanche', en: 'Sunday' },
];

const initialPlanning: Planning = days.reduce(
  (acc, day) => {
    acc.period.days[day.en] = { start: '', end: '', off: false };
    return acc;
  },
  {
    period: {
      start: '',
      end: '',
      days: {},
    },
  } as Planning,
);

export function useUserPlanningState(id: string) {
  const [userPlanning, setUserPlanning] = useState<Planning>(initialPlanning);
  const [error, setError] = useState('');
  const [isDisable, setIsDisable] = useState(false);
  const { data } = useGetUserByIdQuery({
    variables: { id: String(id ?? '') },
  });
  const user = data?.getUserById;
  return { userPlanning, error, isDisable, setUserPlanning, setError, setIsDisable, id, user };
}

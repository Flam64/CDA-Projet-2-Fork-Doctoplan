import { Planning } from '@/types/graphql-generated';

export const PlanningTable = ({ schedule }: { schedule: Partial<Planning> }) => {
  const days = [
    { name: 'Lundi', startKey: 'monday_start', endKey: 'monday_end' },
    { name: 'Mardi', startKey: 'tuesday_start', endKey: 'tuesday_end' },
    { name: 'Mercredi', startKey: 'wednesday_start', endKey: 'wednesday_end' },
    { name: 'Jeudi', startKey: 'thursday_start', endKey: 'thursday_end' },
    { name: 'Vendredi', startKey: 'friday_start', endKey: 'friday_end' },
    { name: 'Samedi', startKey: 'saturday_start', endKey: 'saturday_end' },
    { name: 'Dimanche', startKey: 'sunday_start', endKey: 'sunday_end' },
  ];
  return (
    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
      <tbody>
        {days.map(day => {
          const startTime = schedule[day.startKey as keyof Planning];
          const endTime = schedule[day.endKey as keyof Planning];
          return (
            <tr key={day.name} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '8px', fontWeight: 'bold', width: '120px' }}>{day.name}</td>
              <td style={{ padding: '8px' }}>{startTime ? `${startTime} - ${endTime}` : '-'}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

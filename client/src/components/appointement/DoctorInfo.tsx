import { GetUserByIdQuery } from '@/types/graphql-generated';
import calendarClock from '@/assets/calendar-clock.svg';

type Doctor = GetUserByIdQuery['getUserById'];

export default function DoctorInfo({ doctor }: { doctor: Doctor }) {
  return (
    <div className="flex flex-col mt-4 mb-4">
      <div className="flex gap-4 items-center">
        <img src={calendarClock} alt="icone de creation de rendez-vous" />
        <h2>
          Créer un rendez-vous avec{' '}
          <span className="text-accent">
            {doctor.firstname} {doctor.lastname}, {doctor.departement?.label ?? 'Aucun département'}
          </span>
        </h2>
      </div>
    </div>
  );
}

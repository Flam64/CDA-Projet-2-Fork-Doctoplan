import InputForm from '@/components/form/InputForm';
import SelectForm from '@/components/form/SelectForm';
import { Link } from 'react-router-dom';
export default function DoctorVacation() {
  const handleSubmit = () => {};
  return (
    <main className="container  mx-auto pt-4 pr-12 pl-12 pb-12 flex items-center flex-col gap-4">
      <div className="w-full max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
          <SelectForm
            name="type"
            value={'SaveAppointment.appointmentType'}
            title="Type"
            option={[]}
            // handle={handleAppointment}
            handle={() => {}}
          />
          <div className=" flex justify-between">
            <div className="w-[48%] flex flex-col gap-2">
              <InputForm
                title="Début"
                name="start"
                type="date"
                value={''}
                placeholder="Début"
                handle={() => {}}
              />
            </div>
            <div className="w-[48%] flex flex-col gap-2">
              <InputForm
                title="Fin"
                name="end"
                type="date"
                value={''}
                placeholder="Fin"
                handle={() => {}}
              />
            </div>
          </div>
          <button type="submit" className="standard-button mt-4 transition">
            Créer
          </button>
          <Link to={'/doctor'} className="standard-button-red transition text-center">
            Annuler
          </Link>
        </form>
      </div>
    </main>
  );
}

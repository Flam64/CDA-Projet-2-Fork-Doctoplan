import DateDisplayInput from '@/components/appointement/DateDisplayInput';
import TimeDisplayInputEnd from '@/components/appointement/TimeDisplayInputEnd';
import TimeSelectStart from '@/components/appointement/TimeSelectStart';
import DoctorSelect from '@/components/form/DoctorSelect';
import DoctorSlots from '@/components/doctor/DoctorSlots';
import AppointmentTypesSelect from '@/components/form/AppointmentTypesSelect';
import { useAppointmentContext } from '@/hooks/useAppointment';
import { useNavigate } from 'react-router-dom';

type FormAppointmentPatientProps = {
  patient_id: string | undefined;
};

export default function FormAppointmentPatient({ patient_id }: FormAppointmentPatientProps) {
  const navigate = useNavigate();
  const { SaveAppointment, handleSubmitAppointment } = useAppointmentContext();
  if (patient_id === undefined) {
    return <div className="flex items-center justify-center h-screen">Patient not found</div>;
  }
  const handleSubmitInfo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await handleSubmitAppointment();
      navigate(`/secretary/patient/${SaveAppointment.patient_id}`);
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire :', error);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmitInfo}>
        <section className="flex flex-col gap-4">
          <DoctorSlots />
          <DoctorSelect />
          <AppointmentTypesSelect />
          <section className="flex flex-col gap-2">
            {/* Ligne des champs : Jour, Début, Fin */}
            <div className="flex gap-4 items-end whitespace-nowrap">
              <DateDisplayInput />
              <TimeSelectStart />
              <TimeDisplayInputEnd />
            </div>
          </section>
          <button type="submit" className="cta block mx-auto">
            Ajouter
          </button>
        </section>
      </form>
    </>
  );
}

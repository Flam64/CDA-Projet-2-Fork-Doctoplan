import DateDisplayInput from '@/components/appointement/DateDisplayInput';
import TimeDisplayInputEnd from '@/components/appointement/TimeDisplayInputEnd';
import TimeSelectStart from '@/components/appointement/TimeSelectStart';
import DoctorSelect from '@/components/form/DoctorSelect';
import UserItem from '@/components/user/UserItem';
import AppointmentTypesSelect from '@/components/form/AppointmentTypesSelect';
import { Patient } from '@/types/patient.type';
import { PatientAppointment } from '@/types/appointement.type';
import { useAppointmentContext } from '@/hooks/useAppointment';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

type FormAppointmentUpdateProps = {
  selectedPatient: Patient;
  selectedAppointment: PatientAppointment;
  selectedDepartment: string;
  idAppointment: string;
};

export default function FormAppointmentUpdate({
  selectedPatient,
  selectedAppointment,
  selectedDepartment,
  idAppointment,
}: FormAppointmentUpdateProps) {
  const navigate = useNavigate();
  const { handleUpdateAppointment, handleAppointmentChange, handleSelectedDepartment } =
    useAppointmentContext();
  const handleSubmitInfo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await handleUpdateAppointment(idAppointment);
      navigate(`/secretary/`);
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire :', error);
    }
  };

  useEffect(() => {
    handleAppointmentChange(selectedAppointment);
    handleSelectedDepartment(selectedDepartment);
  }, [handleAppointmentChange, selectedAppointment, selectedDepartment, handleSelectedDepartment]);

  return (
    <>
      <form onSubmit={handleSubmitInfo}>
        <section className="flex flex-col gap-4 w-full max-w-[600px] mx-auto">
          {/* User Info */}
          <div className="w-full min-h-[5rem] flex items-center transition-all duration-300 mt-4">
            <div className="animate-fadeInSlideIn w-full max-w-md mx-auto">
              <UserItem<Patient> user={selectedPatient}>
                {p => (
                  <p>
                    <span className="font-bold">
                      {p.firstname} {p.lastname}
                    </span>
                    - N° sécu : {p.social_number}
                  </p>
                )}
              </UserItem>
            </div>
          </div>

          {/* Doctor Select */}
          <div className="w-full max-w-md mx-auto">
            <DoctorSelect />
          </div>

          {/* Appointment Type Select */}
          <div className="w-full max-w-md mx-auto">
            <AppointmentTypesSelect />
          </div>

          {/* Date and Time Selection (adjust width) */}
          <section className="flex gap-4 items-end whitespace-nowrap w-full max-w-md mx-auto">
            <div className="w-full max-w-[150px]">
              <DateDisplayInput />
            </div>
            <div className="w-full max-w-[150px]">
              <TimeSelectStart />
            </div>
            <div className="w-full max-w-[150px]">
              <TimeDisplayInputEnd />
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex flex-col mt-4 w-full max-w-md mx-auto">
            <button type="submit" className="standard-button">
              Modifier
            </button>
            <Link to="/secretary" className="standard-button-red text-center mt-4">
              Annuler
            </Link>
          </div>
        </section>
      </form>
    </>
  );
}

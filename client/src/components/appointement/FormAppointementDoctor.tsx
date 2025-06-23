import { FormEvent, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppointmentContext } from '@/hooks/useAppointment';
import PatientSearch from '@/components/appointement/PatientSearch';
import SelectForm from '@/components/form/SelectForm';
import DateTimeSection from '@/components/appointement/DateTimeSection';
import { generateTimeOptions } from '@/utils/generatedTimeOptions';
import { getDisabledTimes } from '@/utils/getAppointementTimeStartDisabled';
import { Patient } from '@/types/patient.type';
import { useAuth } from '@/hooks/useAuth';

type FormAppointementDoctorProps = {
  selectedPatient: Patient | null;
  setSelectedPatient: (patient: Patient | null) => void;
  appointmentTypes: { key: string; value: string }[];
  appointments: { start_time: string; duration: number }[];
  onAppointmentCreated?: () => void;
  doctorId: number;
};

export default function FormAppointementDoctor({
  selectedPatient,
  setSelectedPatient,
  appointmentTypes,
  appointments,
  onAppointmentCreated,
  doctorId,
}: FormAppointementDoctorProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    SaveAppointment,
    handleAppointment,
    handleSubmitAppointment,
    selectedDay,
    handleTypeChange,
  } = useAppointmentContext();

  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';

  const backUrl = (() => {
    if (location.state?.from === '/secretary') return '/secretary';
    if (isDoctor) return '/doctor';
    return `/secretary/doctor/${doctorId}/agenda`;
  })();

  const disabledTimes = getDisabledTimes(selectedDay, appointments, generateTimeOptions());

  useEffect(() => {
    if (selectedPatient?.id) {
      handleTypeChange(selectedPatient.id, 'patient_id');
    }
  }, [selectedPatient, handleTypeChange]);

  const handleSubmitInfo = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await handleSubmitAppointment();

      // Refetch
      if (onAppointmentCreated) {
        await onAppointmentCreated();
      }

      if (isDoctor) {
        navigate('/doctor/appointment/create');
      } else {
        // Redirection cohérente après soumission
        if (location.state?.from === '/secretary') {
          navigate('/secretary');
        } else {
          navigate(`/secretary/doctor/${doctorId}/agenda`);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la création du rendez-vous :', error);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmitInfo} className="flex flex-col gap-4 w-full max-w-md">
        <PatientSearch selectedPatient={selectedPatient} setSelectedPatient={setSelectedPatient} />

        <SelectForm
          name="appointmentType"
          value={SaveAppointment.appointmentType}
          title="Motif de consultation"
          option={appointmentTypes}
          handle={handleAppointment}
        />

        <DateTimeSection disabledTimes={disabledTimes} />

        <button type="submit" className="standard-button mt-4 transition">
          Créer le rendez-vous
        </button>
        <Link
          to={backUrl}
          state={location.state} // 👈 préserve l'origine de navigation
          className="standard-button-red transition text-center"
        >
          Annuler
        </Link>
      </form>
    </div>
  );
}

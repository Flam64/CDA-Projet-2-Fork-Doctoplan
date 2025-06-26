import { useAuth } from '@/hooks/useAuth';
import {
  useCheckDoctorDateAppointmentsLazyQuery,
  useCreateVacationMutation,
  useGetVacationByIdQuery,
  useUpdateVacationMutation,
} from '@/types/graphql-generated';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
type VacationDataType = {
  start: string;
  end: string;
};
type CreateVacationModalProps = {
  id?: string | null;
  onClose: () => void;
};
export default function CreateVacationModal({ onClose, id }: CreateVacationModalProps) {
  const [vacationData, setVacationData] = useState<VacationDataType>({
    start: '',
    end: '',
  });
  const [createVaction] = useCreateVacationMutation();
  const [updateVaction] = useUpdateVacationMutation();
  const [checkDoctorDateAppointments] = useCheckDoctorDateAppointmentsLazyQuery();

  const { user } = useAuth();
  const { data, refetch } = useGetVacationByIdQuery({
    variables: { getVacationByIdId: user?.id || '' },
  });
  const vacationList = data?.getVacationById;

  useEffect(() => {
    if (id) {
      const vacationToEdit = vacationList?.find(vacation => vacation.id === id);
      if (vacationToEdit) {
        setVacationData({
          start: vacationToEdit.start,
          end: vacationToEdit.end,
        });
      }
    }
  }, [id, vacationList]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (vacationData.start !== '' && vacationData.end !== '') {
      try {
        if (user && (await checkDates(vacationData))) {
          if (id) {
            await updateVaction({
              variables: { input: vacationData, doctorId: user.id, vacationId: id },
            });
          } else {
            await createVaction({ variables: { input: vacationData, createVacationId: user?.id } });
          }
          toast.success(id ? 'Congé modifié avec succès ! 🚀' : 'Congé créé avec succès ! 🚀');
          refetch();
          onClose();
        }
      } catch (error) {
        toast.error('Erreur lors de la création de congé', error);
      }
    } else {
      toast.error('Les dates de début et de fin doivent être renseignées.');
    }
  };

  const checkDates = async (updatedData: VacationDataType) => {
    if (user && updatedData.start && updatedData.end) {
      const checkAppointment = await checkDoctorDateAppointments({
        variables: {
          doctorId: +user?.id,
          dates: {
            start: updatedData.start,
            end: updatedData.end,
          },
        },
      });
      if (checkAppointment.data?.checkDoctorDateAppointments) {
        toast.error('Vous avez un rendez-vous prévu pour ces dates!');
        return;
      }
      if (
        vacationList?.some(
          vacation => updatedData.start >= vacation.start && updatedData.start <= vacation.end,
        )
      ) {
        toast.error('Vous avez déjà fait une demande pour cette date!');
      }
      if (new Date(updatedData.end) < new Date(updatedData.start)) {
        setVacationData({ ...vacationData, end: '' });
        toast.error('La date de fin doit être postérieure à la date de début.');
      }
    }
    return true;
  };
  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedData = { ...vacationData, [name]: value };
    const check = await checkDates(updatedData);
    if (check) setVacationData(updatedData);
  };
  return (
    <div className="w-full max-w-md mx-auto bg-white p-5">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
        <div className=" flex justify-between">
          <section className="w-[48%] flex flex-col gap-2">
            <label htmlFor={'start'}>Début *</label>
            <input
              type="date"
              name="start"
              id="start"
              value={vacationData.start}
              placeholder="Début"
              required={true}
              disabled={false}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 my-2"
            />
          </section>
          <section className="w-[48%] flex flex-col gap-2">
            <label htmlFor={'end'}>Fin *</label>
            <input
              type="date"
              name="end"
              id="end"
              value={vacationData.end}
              placeholder="Fin"
              required={true}
              disabled={false}
              min={vacationData.start || undefined}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 my-2"
            />
          </section>
        </div>
        <button type="submit" className="standard-button mt-4 transition">
          {id ? 'Modifier' : 'Créer'}
        </button>
        <button onClick={onClose} className="standard-button-red transition text-center">
          Annuler
        </button>
      </form>
    </div>
  );
}

import { useState } from 'react';
import {
  DoctorAppointmentSlot,
  useGetDoctorSlotByDepartementLazyQuery,
} from '@/types/graphql-generated';
import DepartmentSelect from '@/components/form/DepartmentSelect';
import { useAppointmentContext } from '@/hooks/useAppointment';

export default function DoctorSlots() {
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState<DoctorAppointmentSlot[]>([]);
  const [GetDoctorSlotByDepartement] = useGetDoctorSlotByDepartementLazyQuery();
  const {
    selectedDepartment,
    selectedDay,
    handleStartChange,
    handleTypeChange,
    handleSelectedDepartment,
  } = useAppointmentContext();

  const checkDoctorAvailability = async () => {
    setLoading(true);
    const { data } = await GetDoctorSlotByDepartement({
      variables: {
        departementId: parseInt(selectedDepartment),
        date: selectedDay.toDate().toDateString(),
      },
    });
    setLoading(false);

    const slots = data?.getDoctorSlotByDepartement || [];
    if (slots.length === 0) {
      alert('Aucun rendez-vous disponible pour cette date et ce département.');
      return;
    }
    setSlots(slots as DoctorAppointmentSlot[]);
  };

  const handleSlotClick = (slot: DoctorAppointmentSlot) => {
    handleStartChange(slot.debut_libre.split(':').slice(0, 2).join(':'));
    handleTypeChange(slot.user_id, 'user_id');
  };
  return (
    <>
      <section className="flex flex-col md:flex-row lg:justify-between md:items-center gap-4 mb-0">
        <div className="flex justify-center lg:justify-start w-full">
          <DepartmentSelect
            value={selectedDepartment}
            onChange={newLabel => {
              handleSelectedDepartment(newLabel);
            }}
          />
        </div>
        <div className="flex justify-center md:justify-end w-full">
          <div className="w-full max-w-xs">
            <button
              type="button"
              className="w-full bg-blue text-white rounded-md px-4 py-2 hover:bg-blue-600 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => {
                checkDoctorAvailability();
              }}
            >
              Prochains créneaux
            </button>
          </div>
        </div>
      </section>
      {loading && (
        <section className="flex flex-col gap-4 mb-1 sm:w-full md:w-3/4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-blue-500"></div>
        </section>
      )}
      {slots.length > 0 && (
        <section className="flex flex-col gap-4 mb-1 sm:w-full md:w-3/4">
          <div className="flex flex-col gap-2">
            {Object.entries(
              slots.reduce(
                (acc, slot) => {
                  const key = `${slot.firstname} ${slot.lastname}`;
                  if (!acc[key]) {
                    acc[key] = [];
                  }
                  acc[key].push(slot);
                  return acc;
                },
                {} as Record<string, typeof slots>,
              ),
            ).map(([name, slotsForPerson]) => (
              <article
                key={name}
                className="border-1 border-solid border-blue bg-white rounded-md w-full p-2"
              >
                <h4 className="font-medium">{name}</h4>
                <ul className="list-disc pl-1">
                  {slotsForPerson.map(slot => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => handleSlotClick(slot)}
                      className="inline-block bg-blue text-white text-sm px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 m-2 p-2"
                      aria-label={`Sélectionner le créneau de ${slot.debut_libre} à ${slot.fin_libre}`}
                    >
                      <div className="flex flex-col">
                        <span>{slot.debut_libre.slice(0, 5)}</span>
                        <span>{slot.fin_libre.slice(0, 5)}</span>
                      </div>
                    </button>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

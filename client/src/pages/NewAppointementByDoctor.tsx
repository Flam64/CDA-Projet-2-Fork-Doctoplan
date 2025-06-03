import DateDisplayInput from '@/components/appointement/DateDisplayInput';
import TimeDisplayInputEnd from '@/components/appointement/TimeDisplayInputEnd';
import TimeSelectStart from '@/components/appointement/TimeSelectStart';
import SearchBar from '@/components/form/SearchBar';
import SelectForm from '@/components/form/SelectForm';
import UserItem from '@/components/user/UserItem';
import { useSearchPatientsQuery } from '@/types/graphql-generated';
import { Patient } from '@/types/patient.type';
import { formatDate } from '@/utils/formatDateFr';
import { DayPilot, DayPilotNavigator } from '@daypilot/daypilot-lite-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function NewAppointementByDoctor() {
  const [params] = useSearchParams();

  const [selectedDay, setSelectedDay] = useState<DayPilot.Date>(
    new DayPilot.Date(DayPilot.Date.today()),
  );
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    const dateParam = params.get('date');
    if (dateParam) {
      const [fullDate, timePart] = dateParam.split('T');
      setSelectedDay(new DayPilot.Date(fullDate));

      if (timePart) {
        const hourMinute = timePart.slice(0, 5);
        setStartTime(hourMinute);

        const [hour, minute] = hourMinute.split(':').map(Number);
        const end = new Date();
        end.setHours(hour, minute + 30);
        const endHour = end.getHours().toString().padStart(2, '0');
        const endMinute = end.getMinutes().toString().padStart(2, '0');
        setEndTime(`${endHour}:${endMinute}`);
      }
    }
  }, [params]);

  const handleStartChange = (value: string) => {
    setStartTime(value);
    const [hour, minute] = value.split(':').map(Number);
    const newDate = new Date();
    newDate.setHours(hour, minute + 30);
    const endHour = newDate.getHours().toString().padStart(2, '0');
    const endMinute = newDate.getMinutes().toString().padStart(2, '0');
    setEndTime(`${endHour}:${endMinute}`);
  };

  const {
    data: patientData,
    loading: loadingPatients,
    error: errorPatients,
  } = useSearchPatientsQuery({
    variables: { query: searchQuery },
    skip: searchQuery.length < 2,
  });

  const searchSources = [
    {
      name: 'Patients',
      items: patientData?.searchPatients ?? [],
      loading: loadingPatients,
      error: errorPatients ? errorPatients.message : null,
      getKey: (patient: Patient) => `patient-${patient.id}`,
    },
  ];

  return (
    <>
      <div>{`NewAppointementByDoctor ${params.get('doctor')}`}</div>
      <div className="flex flex-col w-3/4">
        <section className="flex flex-col gap-4 self-start">
          <div className="flex gap-4">
            <img src="/calendar-clock.svg" alt="icone de creation de rendez-vous" />
            <h2>
              Creer un rendez-vous avec Nom du doctor, <span>profession, service</span>
            </h2>
          </div>
          <div className="self-start">
            <SearchBar<Patient>
              placeholder="Rechercher un patient..."
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              sources={searchSources}
            >
              {(patient, _source, onSelect) => (
                <button
                  type="button"
                  className="w-full text-left block p-2 border-b last:border-b-0 hover:bg-gray-100"
                  onClick={() => {
                    setSelectedPatient(patient); // sélectionne le patient
                    onSelect(); // ferme la searchBar
                  }}
                >
                  <p className="font-semibold">
                    🧑 {patient.firstname} {patient.lastname}
                  </p>
                  <p className="text-sm text-gray-500">N° sécu : {patient.social_number}</p>
                </button>
              )}
            </SearchBar>
          </div>
        </section>
      </div>

      <section className="bg-bgBodyColor sm:w-full md:w-3/4 p-4 sm:p-6 md:p-12 lg:p-24 rounded-sm shadow-md border-borderColor flex flex-col md:flex-row justify-center gap-10 md:gap-45">
        <aside>
          <DayPilotNavigator
            selectMode="Day"
            showMonths={1}
            skipMonths={1}
            locale="fr-fr"
            selectionDay={selectedDay}
            onTimeRangeSelected={args => setSelectedDay(args.day)}
          />
        </aside>

        <section className="flex flex-col gap-4">
          {/* ✅ Affiche les infos du patient sélectionné */}
          {selectedPatient && (
            <UserItem<Patient> user={selectedPatient}>
              {p => (
                <p>
                  <span className="font-bold">
                    {p.firstname} {p.lastname}
                  </span>{' '}
                  - N° sécu : {p.social_number}
                </p>
              )}
            </UserItem>
          )}

          <SelectForm
            name="motifs"
            value="pupu"
            title="Motif de consultation"
            option={[]}
            handle={() => console.warn('truc')}
          />
          <section className="flex flex-col gap-2">
            <div className="flex gap-4 items-end whitespace-nowrap">
              <DateDisplayInput value={formatDate(selectedDay.toDate())} />
              <TimeSelectStart value={startTime} onChange={handleStartChange} />
              <TimeDisplayInputEnd value={endTime} />
            </div>
          </section>
        </section>
      </section>
    </>
  );
}

import { useEffect, useState } from 'react';
import {
  useCreateUserMutation,
  useGetFullUserInfoLazyQuery,
  useUpdateUserMutation,
} from '@/types/graphql-generated';
import { ApolloError } from '@apollo/client';
import UserPersonalForm from '@/components/user/UserPersonalForm';
import UserProfessionalForm from '@/components/user/UserProfessionalForm';
import UserPlanning from '@/components/user/UserPlanning';
import { useNavigate, useParams } from 'react-router-dom';
import UserButtons from '@/components/user/UserButtons';
import { formatInputPlanning } from '@/utils/formatInputPlanning';

type FormDataType = {
  lastname: string;
  firstname: string;
  email: string;
  role: string;
  status: string;
  activationDate: string | null;
  departementId: number;
  gender: string;
  tel: string;
};

export type Planning = {
  period: {
    start: string;
    end: string;
    days: {
      [day: string]: {
        start: string;
        end: string;
        off: boolean;
      };
    };
  };
};

const initialFormData: FormDataType = {
  lastname: '',
  firstname: '',
  email: '',
  role: '',
  status: 'active',
  activationDate: null,
  departementId: 0,
  gender: '',
  tel: '',
};

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

export default function CreateUser() {
  const { id } = useParams();
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [error, setError] = useState('');
  const [isDoctor, setIsDoctor] = useState(false);
  const [isDisable, setIsDisable] = useState(false);
  const [formData, setFormData] = useState<FormDataType>(initialFormData);
  const [userPlanning, setUserPlanning] = useState<Planning>(initialPlanning);
  const navigate = useNavigate();
  const [getFullUserInfo, { data: fullUserInfoData, refetch }] = useGetFullUserInfoLazyQuery();
  useEffect(() => {
    if (id) {
      const getUserInfo = async () => {
        await getFullUserInfo({
          variables: {
            getFullUserInfoId: id,
          },
        });
      };
      getUserInfo();
    }
  }, [id, getFullUserInfo]);

  useEffect(() => {
    const user = fullUserInfoData?.getFullUserInfo;
    if (user) {
      setFormData({
        lastname: user.lastname,
        firstname: user.firstname,
        email: user.email,
        role: user.role,
        status: user.status || 'active',
        departementId: Number(user.departement?.id),
        activationDate: user.activationDate || null,
        gender: user.gender || '',
        tel: user.tel || '',
      });
      if (user.role === 'doctor') {
        setIsDoctor(true);
        const planning = user.plannings?.[0];
        setUserPlanning(prev => ({
          period: {
            start:
              planning && planning.start
                ? new Date(planning.start).toLocaleDateString('fr-FR')
                : '',
            end: planning && planning.end ? new Date(planning.end).toLocaleDateString('fr-FR') : '',
            days: Object.fromEntries(
              Object.keys(prev.period.days).map(day => {
                const lowerDay = day.toLowerCase();
                const startKey = `${lowerDay}_start` as keyof typeof planning;
                const endKey = `${lowerDay}_end` as keyof typeof planning;

                return [
                  day,
                  {
                    start: formatTime(planning?.[startKey] || ''),
                    end: formatTime(planning?.[endKey] || ''),
                    off: false,
                  },
                ];
              }),
            ),
          },
        }));
      }
    }
  }, [fullUserInfoData]);

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    return `${parseInt(hours, 10)}h${minutes}`;
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setError('');
    setIsDisable(false);
    const { name, value } = e.target;

    if (name === 'role') {
      setIsDoctor(value === 'doctor');
    }
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (
      isDoctor &&
      !Object.values(userPlanning.period.days).some(
        day => (day.start !== '' && day.end !== '') || day.off,
      )
    ) {
      setError('Au moins un jour doit être rempli.');
      return;
    }
    if (error) {
      setIsDisable(true);
    }
    try {
      const planningInput = formatInputPlanning(userPlanning, isDoctor);
      const variables = {
        input: {
          ...formData,
          departementId: +formData.departementId,
          ...(isDoctor &&
            !id && {
              plannings: [
                {
                  start: formData.activationDate ?? new Date().toDateString(),
                  ...planningInput,
                },
              ],
            }),
        },
      };
      if (!id) {
        await createUser({
          variables: variables,
        });
      } else {
        await updateUser({
          variables: {
            ...variables,
            updateUserId: id,
          },
        });
      }
      await refetch();
      navigate('/admin/users');
    } catch (err) {
      setError(
        err instanceof ApolloError
          ? String(err.graphQLErrors[0].extensions?.originalError)
          : `Une erreur inattendue s'est produite.`,
      );
    }
  };
  return (
    <main className="container mx-auto pt-4 pr-12 pl-12 pb-12 flex flex-col gap-4">
      <header className="flex items-center mb-4">
        <h2 className="text-xl mr-5 font-semibold text-gray-700">Créer un nouvel utilisateur</h2>
      </header>
      <form onSubmit={handleSubmit}>
        <section className="bg-white items-center p-12 mb-4">
          {error && (
            <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
              {error}
            </div>
          )}
          <article className="flex flex-col md:flex-row justify-around p-2 gap-4">
            <UserPersonalForm
              handleInputChange={handleInputChange}
              id={id ?? null}
              formData={{
                ...formData,
                activationDate: formData.activationDate ? formData.activationDate.toString() : null,
              }}
            />
            <UserProfessionalForm
              handleInputChange={handleInputChange}
              id={id ?? null}
              formData={{
                ...formData,
                activationDate: formData.activationDate ? formData.activationDate.toString() : null,
              }}
            />
          </article>
          {!isDoctor && <UserButtons id={id ?? null} isDisable={isDisable} />}
        </section>
        {isDoctor && (
          <UserPlanning
            userPlanning={userPlanning}
            setUserPlanning={setUserPlanning}
            error={error}
            setError={setError}
            isDisable={isDisable}
            setIsDisable={setIsDisable}
            id={id ?? ''}
          />
        )}
      </form>
    </main>
  );
}

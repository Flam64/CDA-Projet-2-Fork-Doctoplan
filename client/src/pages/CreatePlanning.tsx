import { useCreateDoctorPlanningMutation, useGetUserByIdQuery } from '@/types/graphql-generated';
import { useNavigate, useParams } from 'react-router-dom';
import UserPlanning from '@/components/user/UserPlanning';
import { formatInputPlanning } from '@/utils/formatInputPlanning';
import { useUserPlanningState } from '@/hooks/useUserPlanningState';

export default function CreatePlanning() {
  const { id } = useParams();
  const navigate = useNavigate();
  const userPlanningState = useUserPlanningState(id ?? '');
  const [createPlanning] = useCreateDoctorPlanningMutation();
  const { refetch } = useGetUserByIdQuery({
    variables: { id: String(id ?? '') },
  });
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !Object.values(userPlanningState.userPlanning.period.days).some(
        day => (day.start !== '' && day.end !== '') || day.off,
      )
    ) {
      userPlanningState.setError('Au moins un jour doit être rempli.');
      return;
    }

    if (userPlanningState.error) {
      userPlanningState.setIsDisable(true);
    }
    try {
      const planningInput = formatInputPlanning(userPlanningState.userPlanning, true);
      await createPlanning({
        variables: {
          input: {
            ...planningInput,
            start: userPlanningState.userPlanning.period.start ?? new Date().toISOString(),
          },
          createDoctorPlanningId: id ?? '',
        },
      });
      await refetch();
      navigate(`/admin/users/${id}/planning`);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <UserPlanning {...userPlanningState} />
      </form>
    </div>
  );
}

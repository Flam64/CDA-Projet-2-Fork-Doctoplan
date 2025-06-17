import { Planning } from "@/pages/CreateUser";

export const formatInputPlanning = (userPlanning: Planning, isDoctor: boolean) => {
  if (!isDoctor) {
    return {} 
  }
  return Object.keys(userPlanning.period.days).reduce(
    (acc, day) => {
      const dayLower = day.toLowerCase();
      acc[`${dayLower}_start`] =
        (userPlanning.period.days[day].off || userPlanning.period.days[day].start) === ''
          ? null
          : userPlanning.period.days[day].start;
      acc[`${dayLower}_end`] =
        userPlanning.period.days[day].off || userPlanning.period.days[day].end === ''
          ? null
          : userPlanning.period.days[day].end;
      return acc;
    },
    {} as Record<string, string | null>,
  );
}
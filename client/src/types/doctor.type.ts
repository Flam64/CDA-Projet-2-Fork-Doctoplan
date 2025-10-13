export type Doctor = {
  id: string;
  firstname: string;
  lastname: string;
  profession?: string;
  departement: { label: string };
};

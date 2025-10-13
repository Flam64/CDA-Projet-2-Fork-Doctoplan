import SelectForm from '@/components/form/SelectForm';
import { useGetDepartementsQuery } from '@/types/graphql-generated';

type DepartmentSelectProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function DepartmentSelect({ value, onChange }: DepartmentSelectProps) {
  const { data, loading } = useGetDepartementsQuery();

  if (loading || !data?.getDepartements) return null;

  const options = data.getDepartements.map(dep => ({
    key: dep.id,
    value: dep.label,
  }));

  return (
    <div className="mb-4 max-w-xs">
      <SelectForm
        name="department"
        value={value}
        title="Service"
        option={options}
        handle={e => {
          onChange(e.target.value);
        }}
      />
    </div>
  );
}

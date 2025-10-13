// Définition du type des props du composant avec une contrainte sur T
type ModuleListProps<T> = {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  getKey: (item: T) => string | number;
};

export default function ModuleList<T>({ data, renderItem, getKey }: ModuleListProps<T>) {
  return (
    <ul className="border-l-4 border-blue rounded-md shadow-sm divide-y divide-gray-100 w-full mx-auto bg-white space-y-2">
      {data.map((item, index) => (
        <li
          key={getKey(item)}
          className={`px-4 py-3 ${index % 2 === 0 ? 'bg-white' : 'bg-lightBlue'} hover:bg-gray-100`}
        >
          {/* La fonction "renderItem" permet de personnaliser l'affichage de chaque élément */}
          {renderItem(item, index)}
        </li>
      ))}
    </ul>
  );
}

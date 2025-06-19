type SelectFormProps = {
  name: string;
  value: string;
  title: string;
  option: {
    key: string;
    value: string;
  }[];
  handle: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  disabled?: boolean;
};

/**
 * Element Language du Formulaire. On va interroger le serveur pour récuperer la liste complète
 * value : valeur courante
 * handle : hook a appeler sur l'evenement
 */
function SelectForm({ name, value, title, option, handle, required, disabled }: SelectFormProps) {
  return (
    <label>
      {title}
      <select
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 my-2"
        name={name}
        value={value}
        onChange={handle}
        required={required}
        disabled={disabled}
      >
        {option.map(opt => (
          <option key={opt.key} value={opt.key}>
            {opt.value}
          </option>
        ))}
      </select>
    </label>
  );
}

export default SelectForm;

import { ChangeEvent } from 'react';

type inputFormProps = {
  title: string;
  name: string;
  placeholder?: string;
  rows?: number;
  value: string;
  required?: boolean;
  handle: (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => void;
};

function TextareaForm({ title, name, rows, value, placeholder, required, handle }: inputFormProps) {
  return (
    <section>
      <label htmlFor={name}>
        {title}
        {required ? ' *' : ''}
      </label>
      <textarea
        name={name}
        id={name}
        value={value}
        rows={rows ? rows : 2}
        placeholder={placeholder}
        required={required || false}
        onChange={handle}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 my-2"
      />
    </section>
  );
}

export default TextareaForm;

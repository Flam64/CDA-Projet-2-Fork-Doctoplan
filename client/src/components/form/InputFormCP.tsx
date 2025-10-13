import SearchBarCP from './SearchBarCP';

type inputFormProps = {
  handle: (cp: string, ville: string) => void;
  value: string;
  valuecity: string;
};

function InputFormCP({ handle, value, valuecity }: inputFormProps) {
  const clickInput = () => {
    const resultList = document.querySelector('.search-bar') as HTMLDivElement;
    resultList.classList.toggle('hidden');
    const input = document.getElementById('zip_code') as HTMLInputElement;
    const newInput = document.getElementById('new_zip_code') as HTMLInputElement;
    newInput.focus();
    if (input && newInput) {
      newInput.value = input.value;
    }
  };

  return (
    <>
      <section className="relative">
        <label htmlFor="zip_code">Code postale</label>
        <div className="flex gap-2 my-2">
          <input
            type="text"
            name="zip_code"
            id="zip_code"
            value={value}
            readOnly={true}
            placeholder="Code postale"
            onClick={clickInput}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 my-2"
          />
          <button
            type="button"
            onClick={clickInput}
            className="px-2 w-40 h-10 py-2 m-2 text-sm font-medium text-white cta rounded-md hover:bg-blue-600 transition-colors duration-200"
            aria-controls="search-bar"
          >
            Changer CP
          </button>
        </div>
        {value && <SearchBarCP cpdefault={value} handle={handle} />}
      </section>
      <section>
        <label htmlFor="city">Ville</label>
        <input
          type="text"
          name="city"
          id="city"
          defaultValue={valuecity}
          placeholder="Ville"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 my-2"
        />
      </section>
    </>
  );
}

export default InputFormCP;

export const formatDate = (input: Date | string) => {
  if (input === '') return '';
  const date = new Date(input);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

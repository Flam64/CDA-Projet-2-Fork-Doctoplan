export const formatSSN = (input: string): string => {
  // Supprimer les espaces pour obtenir les chiffres
  const digits = input.replace(/\s+/g, '');

  if (digits.length !== 15) {
    return input;
  }

  // Vérifier que l'entrée ne contient que des chiffres et des espaces
  if (!/^[\d\s]+$/.test(input)) {
    return input;
  }

  // Formater le numéro au format SSN
  const formattedSSN = `${digits.slice(0, 1)} ${digits.slice(1, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 10)} ${digits.slice(10, 13)} ${digits.slice(13, 15)}`;

  return formattedSSN;
};

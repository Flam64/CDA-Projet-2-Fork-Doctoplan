export const cutStringNote = (noteString: string, maxLength: number): string => {
  if (noteString.length <= maxLength) return noteString;

  const trimmed = noteString.slice(0, maxLength);
  const lastSpaceIndex = trimmed.lastIndexOf(' ');

  if (lastSpaceIndex === -1) {
    // Aucun espace trouvé dans la portion, on coupe brutalement
    return trimmed + '...';
  }

  return trimmed.slice(0, lastSpaceIndex) + '...';
};

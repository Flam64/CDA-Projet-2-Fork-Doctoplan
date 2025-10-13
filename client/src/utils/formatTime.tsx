export const formatTime = (timeStr: string) => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  return `${parseInt(hours, 10)}h${minutes}`;
};

export const generateTimeOptions = (startHour = 8, endHour = 19) => {
  const times = [];
  for (let h = startHour; h < endHour; h++) {
    times.push(`${h.toString().padStart(2, '0')}:00`);
    times.push(`${h.toString().padStart(2, '0')}:30`);
  }
  return times;
};

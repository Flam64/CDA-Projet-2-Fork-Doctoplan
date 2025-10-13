export const getPathFromRole = (role: string) => {
  if (role === 'admin') {
    return '/admin/users';
  } else if (role === 'secretary' || role === 'doctor' || role === 'agent') {
    return `/${role}`;
  }
  return '/';
};

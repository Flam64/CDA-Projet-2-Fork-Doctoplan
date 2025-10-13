import { ReactNode } from 'react';

type UserItemProps<T> = {
  user: T;
  children: (user: T) => ReactNode;
};

export default function UserItem<T>({ user, children }: UserItemProps<T>) {
  return (
    <article className="border-1 border-solid border-blue bg-white rounded-md w-full max-w-md mx-auto p-4">
      {children(user)}
    </article>
  );
}

/* eslint-env jest */

import 'reflect-metadata';
import { ApolloServer } from '@apollo/server';
import { buildSchema } from 'type-graphql';
import { User } from '../entities/user.entity';
import { UserResolver } from '../resolvers/user.resolver';
import { UserStatus } from '../entities/user.entity';

// ✅ Global fetch mock
global.fetch = jest.fn() as any;
const mockedFetch = global.fetch as jest.MockedFunction<typeof fetch>;

type ApolloResponse<T> = {
  body: {
    kind: 'single';
    singleResult: {
      data?: T;
      errors?: any;
    };
  };
};

describe('Mutation: sendResetPassword', () => {
  let server: ApolloServer;

  beforeAll(async () => {
    const schema = await buildSchema({
      resolvers: [UserResolver],
      // bypassing the authentication system
      authChecker: () => true,
    });

    server = new ApolloServer({ schema });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const SEND_RESET_MUTATION = `
    mutation SendResetPassword($email: sendEmailInput!) {
      sendResetPassword(email: $email)
    }
  `;

  it('Envoie un email si utilisateur actif', async () => {
    const mockUser = {
      id: 1,
      email: 'michel.diaz@hopital.gouv.fr',
      status: UserStatus.ACTIVE,
    };

    jest.spyOn(User, 'findOneBy').mockResolvedValueOnce(mockUser as any);
    mockedFetch.mockResolvedValueOnce({ ok: true } as any);

    const res = (await server.executeOperation({
      query: SEND_RESET_MUTATION,
      variables: { email: { email: 'michel.diaz@hopital.gouv.fr' } },
    })) as ApolloResponse<{ sendResetPassword: boolean }>;

    expect(res.body.singleResult.errors).toBeUndefined();
    expect(res.body.kind).toBe('single');
    expect(res.body.singleResult.data?.sendResetPassword).toBe(true);

    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(mockedFetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/mail\/login\/init$/),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('michel.diaz@hopital.gouv.fr'),
      }),
    );
  });

  it('Ne fait rien si utilisateur inactif', async () => {
    const mockUser = {
      id: 1,
      email: 'thibault.leclerc@hopital.gouv.fr',
      status: UserStatus.INACTIVE,
    };

    jest.spyOn(User, 'findOneBy').mockResolvedValueOnce(mockUser as any);

    const res = (await server.executeOperation({
      query: SEND_RESET_MUTATION,
      variables: { email: { email: 'thibault.leclerc@hopital.gouv.fr' } },
    })) as ApolloResponse<{ sendResetPassword: boolean }>;

    expect(res.body.singleResult.errors).toBeUndefined();
    expect(res.body.singleResult.data?.sendResetPassword).toBe(true);
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it('Ne fait rien si utilisateur inexistant', async () => {
    jest.spyOn(User, 'findOneBy').mockResolvedValueOnce(null);

    const res = (await server.executeOperation({
      query: SEND_RESET_MUTATION,
      variables: { email: { email: 'unknown@example.com' } },
    })) as ApolloResponse<{ sendResetPassword: boolean }>;

    expect(res.body.singleResult.errors).toBeUndefined();
    expect(res.body.singleResult.data?.sendResetPassword).toBe(true);
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it('Renvoie une erreur si problème BDD', async () => {
    jest.spyOn(User, 'findOneBy').mockRejectedValueOnce(new Error('DB Error'));

    const res = (await server.executeOperation({
      query: SEND_RESET_MUTATION,
      variables: { email: { email: 'thibault.leclerc@hopital.gouv.fr' } },
    })) as ApolloResponse<{ sendResetPassword: boolean }>;

    expect(res.body.kind).toBe('single');
    expect(res.body.singleResult.errors?.[0].message).toBe(
      'Erreur lors de la verification utilisateur',
    );
  });
});

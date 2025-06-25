import argon2 from 'argon2';
import { Resolver, Mutation, Arg, Ctx, Query, UseMiddleware } from 'type-graphql';
import { Response } from 'express';

import { User } from '../entities/user.entity';
import { LoginInput, AuthResponse } from '../types/auth.type';
import { generateToken } from '../utils/jwt.utils';
import { AuthMiddleware } from '../middlewares/auth.middleware';

@Resolver()
export class AuthResolver {
  @Mutation(() => AuthResponse)
  async login(
    @Arg('input') input: LoginInput,
    @Ctx() context: { res: Response },
  ): Promise<AuthResponse> {
    const user = await User.findOne({
      where: { email: input.email },
      relations: ['departement'],
    });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await argon2.verify(user.password, input.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const token = generateToken(user);

    context.res.setHeader(
      'Set-Cookie',
      `token=${token}; HttpOnly; Secure; Max-Age=${1 * 24 * 60 * 60 * 1000}`,
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    const plainUser = Object.assign(new User(), userWithoutPassword);

    return { user: plainUser };
  }

  @Mutation(() => Boolean)
  @UseMiddleware(AuthMiddleware)
  async logout(@Ctx() context: { res: Response }): Promise<boolean> {
    context.res.setHeader(
      'Set-Cookie',
      'token=; HttpOnly; Secure; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    );

    return true;
  }

  @Query(() => User, { nullable: true })
  @UseMiddleware(AuthMiddleware)
  async me(@Ctx() context: { user: User }): Promise<User | null> {
    return context.user;
  }
}

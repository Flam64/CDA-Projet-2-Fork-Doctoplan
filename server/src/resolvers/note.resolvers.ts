import { Arg, Query, Resolver, Authorized, Mutation, Ctx, UseMiddleware } from 'type-graphql';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { GraphQLError } from 'graphql';
import { Note } from '../entities/note.entity';
import { NoteInput } from '../types/note.type';
import { User, UserRole } from '../entities/user.entity';

@Resolver()
export class NoteResolver {
  @Query(() => [Note])
  @UseMiddleware(AuthMiddleware)
  @Authorized([UserRole.SECRETARY, UserRole.DOCTOR])
  async getNoteByIDAndDate(
    @Arg('dateNote') dateNote: string,
    @Ctx() context: { user: User },
  ): Promise<Note[] | null> {
    return await Note.find({
      where: {
        user: {
          id: context.user?.id,
        },
        dateNote,
      },
      relations: ['user'],
    });
  }

  @Query(() => Note)
  @UseMiddleware(AuthMiddleware)
  @Authorized([UserRole.SECRETARY, UserRole.DOCTOR])
  async getNoteByID(@Arg('id') id: string, @Ctx() context: { user: User }): Promise<Note | null> {
    return await Note.findOne({
      where: {
        user: {
          id: context.user?.id,
        },
        id: +id,
      },
      relations: ['user'],
    });
  }

  @Mutation(() => Note)
  @UseMiddleware(AuthMiddleware)
  @Authorized([UserRole.SECRETARY, UserRole.DOCTOR])
  async createNote(
    @Arg('noteData') noteData: NoteInput,
    @Ctx() context: { user: User },
  ): Promise<Note | null> {
    const userExists = await User.findOne({
      where: { id: context.user?.id },
    });

    if (!userExists) {
      throw new GraphQLError(`L'utilisateur avec l'id ${context.user?.id} n'existe pas`, {
        extensions: {
          code: 'USER_NOT_FOUND',
          originalError: 'Aucun utilisateur trouvé',
        },
      });
    }

    try {
      const note = new Note();
      note.dateNote = noteData.dateNote;
      note.user = userExists;
      note.note = noteData.note;
      const numNote = await note.save();

      return numNote;
    } catch (error) {
      throw new GraphQLError(`Échec de la création du patient`, {
        extensions: {
          code: 'NOTE_CREATION_FAILED',
          originalError: error.message,
        },
      });
    }
  }

  @Mutation(() => Boolean)
  @UseMiddleware(AuthMiddleware)
  @Authorized([UserRole.SECRETARY, UserRole.DOCTOR])
  async updateNote(
    @Arg('noteData') noteData: NoteInput,
    @Ctx() context: { user: User },
  ): Promise<boolean> {
    if (!noteData.id) {
      throw new GraphQLError(`L'utilisateur avec l'id ${context.user?.id} n'existe pas`, {
        extensions: {
          code: 'USER_NOT_FOUND',
          originalError: 'Aucun utilisateur trouvé',
        },
      });
    }

    const userExists = await User.findOne({
      where: { id: context.user?.id },
    });

    if (!userExists) {
      throw new GraphQLError(`L'utilisateur avec l'id ${context.user?.id} n'existe pas`, {
        extensions: {
          code: 'USER_NOT_FOUND',
          originalError: 'Aucun utilisateur trouvé',
        },
      });
    }

    const noteExists = await Note.findOne({
      where: {
        user: {
          id: context.user?.id,
        },
        id: noteData.id,
      },
    });

    if (!noteExists) {
      throw new GraphQLError(`La note n'existe pas`, {
        extensions: {
          code: 'NOTE_NOT_FOUND',
          originalError: 'Aucune note trouvée',
        },
      });
    }

    try {
      noteExists.dateNote = noteData.dateNote;
      noteExists.note = noteData.note;
      await noteExists.save();

      return true;
    } catch (error) {
      throw new GraphQLError(`Échec de la création du patient`, {
        extensions: {
          code: 'NOTE_CREATION_FAILED',
          originalError: error.message,
        },
      });
    }
  }
}

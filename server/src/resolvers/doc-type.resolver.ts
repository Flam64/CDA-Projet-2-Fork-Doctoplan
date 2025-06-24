import { Query, Resolver, Arg, Authorized } from 'type-graphql';
import { GraphQLError } from 'graphql';
import { DocType, DocumentType } from '../entities/doc-type.entity';
import { UserRole } from '../entities/user.entity';

@Resolver()
export class DocTypeResolver {
  @Query(() => [DocType])
  @Authorized([UserRole.SECRETARY, UserRole.DOCTOR])
  async getAllDocType(@Arg('typeDoc') typeDoc: string): Promise<DocType[]> {
    switch (typeDoc) {
      case DocumentType.PATIENT:
        return await DocType.find({ where: { type: DocumentType.PATIENT } });
      case DocumentType.APPOINTMENT:
        return await DocType.find({ where: { type: DocumentType.APPOINTMENT } });
      case DocumentType.APPOINTMENTDOCTOR:
        return await DocType.find({ where: { type: DocumentType.APPOINTMENTDOCTOR } });
    }
    throw new GraphQLError('Document Type incorrect', {
      extensions: {
        code: 'GET_ALL_DOC_TYPE_FAILED',
        originalError: 'Le type de document demandé est incorrect',
      },
    });
  }
}

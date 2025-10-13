import { Arg, Mutation, Query, Resolver, Authorized, Int } from 'type-graphql';
import { Departement, DepartementStatus } from '../entities/departement.entity';
import { GraphQLError } from 'graphql';
import { DepartementInput, DepartementsWithTotal } from '../types/departement.type';
import { UserRole } from '../entities/user.entity';
import redisClient from '../database/redis';
import { ILike } from 'typeorm';

@Resolver()
export class DepartementResolver {
  @Query(() => [Departement])
  @Authorized([UserRole.SECRETARY, UserRole.DOCTOR, UserRole.ADMIN, UserRole.AGENT])
  async getDepartements(): Promise<Departement[]> {
    const cachedDepartements = await redisClient.get('departements');
    if (cachedDepartements) {
      return JSON.parse(cachedDepartements);
    }
    const departements = await Departement.find({
      relations: {
        user: true,
      },
    });
    redisClient.set('departements', JSON.stringify(departements), { EX: 60 * 60 * 24 * 30 });
    return departements;
  }

  @Query(() => DepartementsWithTotal)
  @Authorized([UserRole.SECRETARY, UserRole.DOCTOR, UserRole.ADMIN, UserRole.AGENT])
  async getAllDepartementsWithPagination(
    @Arg('limit', () => Int, { nullable: true }) limit?: number,
    @Arg('page', () => Int, { nullable: true }) page?: number,
    @Arg('search', { nullable: true }) search?: string,
  ) {
    const take = limit ?? 0;
    const skip = page && page > 0 ? (page - 1) * take : 0;
    const [departements, total] = await Departement.findAndCount({
      order: { label: 'ASC' },
      take,
      skip,
      where: [{ label: ILike(`%${search}%`) }],
    });
    return { departements, total };
  }

  @Mutation(() => Boolean)
  @Authorized([UserRole.ADMIN])
  async createDepartement(@Arg('data') data: DepartementInput) {
    try {
      const newDepartement = new Departement();
      newDepartement.label = data.label;
      newDepartement.building = data.building;
      newDepartement.wing = data.wing;
      newDepartement.level = data.level;

      await newDepartement.save();
      redisClient.del('departements');
      return true;
    } catch (error) {
      console.error(error);
      throw new GraphQLError('Échec de la création de département', {
        extensions: {
          code: 'DEPARTEMENT_CREATION_FAILED',
          originalError: error.message,
        },
      });
    }
  }

  @Mutation(() => Boolean)
  @Authorized([UserRole.ADMIN])
  async updateDepartment(@Arg('id') id: string, @Arg('data') data: DepartementInput) {
    const department = await Departement.findOneBy({ id: +id });
    if (!department) {
      throw new GraphQLError('Service non trouvé', {
        extensions: {
          code: 'DEPARTEMENT_NOT_FOUND',
        },
      });
    }
    if (department.label !== data.label) {
      department.label = data.label;
    }
    department.building = data.building;
    department.wing = data.wing;
    department.level = data.level;
    department.save();
    redisClient.del('departements');
    return true;
  }

  @Mutation(() => Boolean)
  @Authorized([UserRole.ADMIN])
  async changeDepartmentStatus(@Arg('id') id: string) {
    const department = await Departement.findOneBy({ id: +id });
    if (!department) {
      throw new GraphQLError('Service non trouvé', {
        extensions: {
          code: 'DEPARTEMENT_NOT_FOUND',
        },
      });
    }
    department.status =
      department.status === DepartementStatus.ACTIVE
        ? DepartementStatus.INACTIVE
        : DepartementStatus.ACTIVE;

    await Departement.update({ id: department.id }, { ...department });
    redisClient.del('departements');
    return true;
  }
}

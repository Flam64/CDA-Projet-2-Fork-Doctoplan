import { buildSchema } from 'type-graphql';

import { PatientResolver } from './resolvers/patient.resolver';
import { AuthResolver } from './resolvers/auth.resolver';
import { DepartementResolver } from './resolvers/departement.resolver';
import { CityResolver } from './resolvers/city.resolver';
import { LogResolver } from './resolvers/log.resolver';
import { getUserFromToken } from './utils/jwt.utils';
import { AppointmentResolver } from './resolvers/appointment.resolver';
import { UserResolver } from './resolvers/user.resolver';
import { PatientDocResolver } from './resolvers/patient-doc.resolver';
import { DocTypeResolver } from './resolvers/doc-type.resolver';
import { PlanningResolver } from './resolvers/planning.resolver';
import { AgentResolver } from './resolvers/agent.resolver';
import { JSONScalar } from './scalar/json.scalar';
import { doctorAppointmentSlotResolver } from './resolvers/doctorAppointmentSlot.resolver';
import { AppointmentTypeResolver } from './resolvers/appointement-type.resolver';
import { NoteResolver } from './resolvers/note.resolvers';
import { appointmentDocSecretaryResolver } from './resolvers/appointmentDocSecretary.resolver';

export default async function createSchema() {
  return await buildSchema({
    resolvers: [
      AuthResolver,
      DepartementResolver,
      PatientResolver,
      CityResolver,
      AppointmentResolver,
      LogResolver,
      UserResolver,
      DocTypeResolver,
      PatientDocResolver,
      PlanningResolver,
      AgentResolver,
      doctorAppointmentSlotResolver,
      AppointmentTypeResolver,
      NoteResolver,
      appointmentDocSecretaryResolver,
    ],
    validate: true,
    authChecker: async ({ context }, roles) => {
      const user = await getUserFromToken(context.req.headers.cookie);

      if (roles.length === 0) return !!user;

      if (!user) return false;

      return roles.includes(user.role);
    },
    scalarsMap: [
      {
        type: Object,
        scalar: JSONScalar,
      },
    ],
  });
}

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { graphql, GraphQLSchema, print } from 'graphql';
import { gql } from 'graphql-tag';

import createSchema from '../schema';
import { UserRole, UserStatus } from '../entities/user.entity';
import { generateToken } from '../utils/jwt.utils';
import { Appointment, AppointmentStatus } from '../entities/appointment.entity';
import { Patient } from '../entities/patient.entity';
import { Departement, DepartementStatus } from '../entities/departement.entity';
import { User } from '../entities/user.entity';
import { AppointmentType } from '../entities/appointment-type.entity';
import { City } from '../entities/city.entity';

const GET_UPCOMING_APPOINTMENTS = gql`
  query GetUpcomingAppointmentsByPatientAndDepartment($socialNumber: String, $departmentId: Float) {
    getUpcomingAppointmentsByPatientAndDepartment(
      socialNumber: $socialNumber
      departmentId: $departmentId
    ) {
      id
      start_time
      status
      patient {
        social_number
        firstname
        lastname
      }
      doctor {
        firstname
        lastname
      }
      departement {
        id
        label
      }
      appointmentType {
        reason
      }
    }
  }
`;

describe('AgentResolver', () => {
  let schema: GraphQLSchema;
  let adminToken: string;
  let agentToken: string;
  let doctorToken: string;
  let testPatient: Patient;
  let testDepartment: Departement;
  let testDoctor: User;
  let testType: AppointmentType;
  let testAppointment: Appointment;
  let testCity: City;

  beforeAll(async () => {
    schema = await createSchema();

    adminToken = generateToken({
      id: 1,
      email: 'admin@test.com',
      role: UserRole.ADMIN,
    });

    agentToken = generateToken({
      id: 3,
      email: 'agent@test.com',
      role: UserRole.AGENT,
    });

    doctorToken = generateToken({
      id: 2,
      email: 'doctor@test.com',
      role: UserRole.DOCTOR,
    });

    testDepartment =
      (await Departement.findOne({ where: { label: 'Test Department' } })) ||
      (await Departement.create({
        label: 'Test Department',
        building: 'Test Building',
        wing: 'Test Wing',
        level: 'Test Level',
        status: DepartementStatus.ACTIVE,
      }).save());

    testDoctor =
      (await User.findOne({ where: { email: 'test.doctor@example.com' } })) ||
      (await User.create({
        email: 'test.doctor@example.com',
        password: 'password',
        firstname: 'Test',
        lastname: 'Doctor',
        role: UserRole.DOCTOR,
        departement: testDepartment,
        status: UserStatus.ACTIVE,
      }).save());

    testCity =
      (await City.findOne({ where: { zip_code: '12345' } })) ||
      (await City.create({
        zip_code: '12345',
        city: 'Test City',
      }).save());

    testPatient =
      (await Patient.findOne({ where: { social_number: '99999999999' } })) ||
      (await Patient.create({
        firstname: 'Test',
        lastname: 'Patient',
        social_number: '99999999999',
        gender: 'M',
        birth_date: '1990-01-01',
        adress: 'Test Address',
        phone_number: '1234567890',
        email: 'test.patient@example.com',
        note: '',
        birth_city: 'Test City',
        private_assurance: '',
        referring_physician: '',
        contact_person: '',
        city: testCity,
      }).save());

    testType =
      (await AppointmentType.findOne({ where: { reason: 'Test Appointment' } })) ||
      (await AppointmentType.create({
        reason: 'Test Appointment',
      }).save());

    const now = new Date();
    const fifteenMinutesLater = new Date(now.getTime() + 15 * 60 * 1000);

    testAppointment = await Appointment.create({
      start_time: fifteenMinutesLater,
      duration: 30,
      status: AppointmentStatus.CONFIRMED,
      doctor: testDoctor,
      patient: testPatient,
      created_by: testDoctor,
      appointmentType: testType,
      departement: testDepartment,
    }).save();
  });

  afterAll(async () => {
    if (testAppointment) {
      await Appointment.delete(testAppointment.id);
    }
  });

  it('should require either socialNumber or departmentId', async () => {
    const result = await graphql({
      schema,
      source: print(GET_UPCOMING_APPOINTMENTS),
      contextValue: {
        req: {
          headers: {
            cookie: `token=${agentToken}`,
          },
        },
      },
    });

    expect(result.errors).toBeDefined();
    expect(result.errors![0].message).toContain(
      'Either socialNumber or departmentId must be provided',
    );
  });

  it('should fetch appointments by socialNumber for agent', async () => {
    const result = await graphql({
      schema,
      source: print(GET_UPCOMING_APPOINTMENTS),
      variableValues: {
        socialNumber: '99999999999',
      },
      contextValue: {
        req: {
          headers: {
            cookie: `token=${agentToken}`,
          },
        },
      },
    });

    expect(result.errors).toBeUndefined();
    expect(result.data).toBeDefined();

    const data = result.data as { getUpcomingAppointmentsByPatientAndDepartment: Appointment[] };
    expect(data.getUpcomingAppointmentsByPatientAndDepartment).toBeDefined();

    data.getUpcomingAppointmentsByPatientAndDepartment.forEach((appointment) => {
      expect(appointment.patient.social_number).toBe('99999999999');
    });
  });

  it('should fetch appointments by both socialNumber and departmentId', async () => {
    const result = await graphql({
      schema,
      source: print(GET_UPCOMING_APPOINTMENTS),
      variableValues: {
        socialNumber: '99999999999',
        departmentId: testDepartment.id,
      },
      contextValue: {
        req: {
          headers: {
            cookie: `token=${agentToken}`,
          },
        },
      },
    });

    expect(result.errors).toBeUndefined();
    expect(result.data).toBeDefined();

    const data = result.data as { getUpcomingAppointmentsByPatientAndDepartment: Appointment[] };
    expect(data.getUpcomingAppointmentsByPatientAndDepartment).toBeDefined();

    data.getUpcomingAppointmentsByPatientAndDepartment.forEach((appointment) => {
      expect(appointment.patient.social_number).toBe('99999999999');
      expect(appointment.departement.id).toBe(String(testDepartment.id));
    });
  });

  it('should not allow doctor role to access appointments', async () => {
    const result = await graphql({
      schema,
      source: print(GET_UPCOMING_APPOINTMENTS),
      variableValues: {
        departmentId: testDepartment.id,
      },
      contextValue: {
        req: {
          headers: {
            cookie: `token=${doctorToken}`,
          },
        },
      },
    });

    expect(result.errors).toBeDefined();
    expect(result.errors![0].message).toContain('Access denied!');
  });

  it('should only fetch confirmed appointments', async () => {
    const now = new Date();
    const fifteenMinutesLater = new Date(now.getTime() + 15 * 60 * 1000);

    const canceledAppointment = await Appointment.create({
      start_time: fifteenMinutesLater,
      duration: 30,
      status: AppointmentStatus.CANCELED,
      doctor: testDoctor,
      patient: testPatient,
      created_by: testDoctor,
      appointmentType: testType,
      departement: testDepartment,
    }).save();

    try {
      const result = await graphql({
        schema,
        source: print(GET_UPCOMING_APPOINTMENTS),
        variableValues: {
          socialNumber: '99999999999',
        },
        contextValue: {
          req: {
            headers: {
              cookie: `token=${agentToken}`,
            },
          },
        },
      });

      expect(result.errors).toBeUndefined();
      expect(result.data).toBeDefined();

      const data = result.data as { getUpcomingAppointmentsByPatientAndDepartment: Appointment[] };

      const hasCanceledAppointments = data.getUpcomingAppointmentsByPatientAndDepartment.some(
        (appointment) => appointment.status === AppointmentStatus.CANCELED,
      );

      expect(hasCanceledAppointments).toBe(false);
    } finally {
      await Appointment.delete(canceledAppointment.id);
    }
  });

  it('should only fetch appointments within the next 30 minutes', async () => {
    const now = new Date();
    const fortyFiveMinutesLater = new Date(now.getTime() + 45 * 60 * 1000);

    const laterAppointment = await Appointment.create({
      start_time: fortyFiveMinutesLater,
      duration: 30,
      status: AppointmentStatus.CONFIRMED,
      doctor: testDoctor,
      patient: testPatient,
      created_by: testDoctor,
      appointmentType: testType,
      departement: testDepartment,
    }).save();

    try {
      const result = await graphql({
        schema,
        source: print(GET_UPCOMING_APPOINTMENTS),
        variableValues: {
          socialNumber: '99999999999',
        },
        contextValue: {
          req: {
            headers: {
              cookie: `token=${agentToken}`,
            },
          },
        },
      });

      expect(result.errors).toBeUndefined();
      expect(result.data).toBeDefined();

      const data = result.data as { getUpcomingAppointmentsByPatientAndDepartment: Appointment[] };

      const hasLaterAppointment = data.getUpcomingAppointmentsByPatientAndDepartment.some(
        (appointment) => appointment.id === laterAppointment.id,
      );

      expect(hasLaterAppointment).toBe(false);

      const now = new Date();
      const thirtyMinutesLater = new Date(now.getTime() + 30 * 60 * 1000);

      data.getUpcomingAppointmentsByPatientAndDepartment.forEach((appointment) => {
        const appointmentDate = new Date(appointment.start_time);
        expect(appointmentDate <= thirtyMinutesLater).toBe(true);
        expect(appointmentDate >= now).toBe(true);
      });
    } finally {
      await Appointment.delete(laterAppointment.id);
    }
  });

  it('should not allow admin to access appointments by departmentId', async () => {
    const result = await graphql({
      schema,
      source: print(GET_UPCOMING_APPOINTMENTS),
      variableValues: {
        departmentId: testDepartment.id,
      },
      contextValue: {
        req: {
          headers: {
            cookie: `token=${adminToken}`,
          },
        },
      },
    });

    expect(result.errors).toBeDefined();
    expect(result.errors![0].message).toContain('Access denied!');
  });
});

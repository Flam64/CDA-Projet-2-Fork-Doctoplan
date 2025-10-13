import { describe, it, expect, beforeAll } from '@jest/globals';
import { graphql, GraphQLSchema, print } from 'graphql';
import { gql } from 'graphql-tag';

import createSchema from '../schema';
import { UserRole } from '../entities/user.entity';
import { PatientInput } from '../types/patient.type';
import { generateToken } from '../utils/jwt.utils';
import { Patient } from '../entities/patient.entity';

const PATIENT_UPDATE_MUTATION = gql`
  mutation UpdatePatient($patientData: PatientInput!) {
    updatePatient(patientData: $patientData) {
      adress
      birth_city
      birth_date
      contact_person
      email
      firstname
      gender
      id
      lastname
      phone_number
      private_assurance
      referring_physician
      social_number
      city {
        city
        zip_code
      }
    }
  }
`;

describe('PatientResolver', () => {
  let schema: GraphQLSchema;
  let doctorToken: string;
  let adminToken: string;
  let testUpdatePatient: PatientInput;

  beforeAll(async () => {
    schema = await createSchema();

    adminToken = generateToken({
      id: 1,
      email: 'admin@test.com',
      role: UserRole.ADMIN,
    });

    doctorToken = generateToken({
      id: 2,
      email: 'doctor@test.com',
      role: UserRole.DOCTOR,
    });

    testUpdatePatient = {
      adress: 'tesdt',
      birth_city: '',
      birth_date: '1944-04-29',
      city: 'LYON',
      contact_person: '',
      email: 'stephane.gosselin@monemail.fr',
      firstname: 'Stéphane',
      gender: 'M',
      id: '1',
      lastname: 'Gosselin',
      note: '',
      phone_number: '0404040404',
      zip_code: '69009',
      private_assurance: '',
      referring_physician: '',
      social_number: '111111111111111',
    };
  });

  it('should return patient object because data + authentification are ok', async () => {
    const result = await graphql({
      schema,
      source: print(PATIENT_UPDATE_MUTATION),
      variableValues: {
        patientData: testUpdatePatient,
      },
      contextValue: {
        req: {
          headers: {
            cookie: `token=${doctorToken}`,
          },
        },
      },
    });
    expect(result.errors).toBeUndefined();
    const data = result.data as { updatePatient: Patient };
    expect(data.updatePatient.social_number).toEqual('111111111111111');
  });
  /**
   * Reste a tester :
   *  - Refus si on envoi pas le cookie
   */

  it('should return error class validator', async () => {
    testUpdatePatient.social_number = '1########dfssdfsfs44 04 33 125 802 31';

    const result = await graphql({
      schema,
      source: print(PATIENT_UPDATE_MUTATION),
      variableValues: {
        patientData: testUpdatePatient,
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
  });
  /**
   * Reste a tester :
   *  - Email
   *  - Téléphone
   *  - genre
   *  - Date anniversaire
   *  - Nom et prénom non vides
   */

  it('should return error because agent couldn t update', async () => {
    const result = await graphql({
      schema,
      source: print(PATIENT_UPDATE_MUTATION),
      variableValues: {
        patientData: testUpdatePatient,
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
  });

  it('should return error because user not exists', async () => {
    testUpdatePatient.id = '1111111';

    const result = await graphql({
      schema,
      source: print(PATIENT_UPDATE_MUTATION),
      variableValues: {
        patientData: testUpdatePatient,
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
  });
});

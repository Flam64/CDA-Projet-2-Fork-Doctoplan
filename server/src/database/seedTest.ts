import argon2 from 'argon2';
import { Departement, DepartementStatus } from '../entities/departement.entity';
import { User, UserRole } from '../entities/user.entity';
import { Patient } from '../entities/patient.entity';
import { City } from '../entities/city.entity';

export async function seedTestDatabase() {
  await User.delete({});
  await Departement.delete({});

  const departement = await Departement.create({
    label: 'Test',
    building: 'Test',
    wing: 'Test',
    level: 'Test',
    status: DepartementStatus.ACTIVE,
  }).save();

  const hash = await argon2.hash('password');

  await User.create({
    email: 'test@test.com',
    password: hash,
    firstname: 'Test',
    lastname: 'Test',
    departement: departement,
    role: UserRole.ADMIN,
  }).save();

  await User.create({
    email: 'doctor@test.com',
    password: hash,
    firstname: 'Doctor',
    lastname: 'Test',
    departement: departement,
    role: UserRole.DOCTOR,
  }).save();

  await User.create({
    email: 'agent@test.com',
    password: hash,
    firstname: 'Agent',
    lastname: 'Test',
    role: UserRole.AGENT,
    departement: departement,
  }).save();

  const newcity = await City.create({
    zip_code: '69009',
    city: 'LYON',
  }).save();

  await Patient.create({
    adress: 'tesdt',
    birth_city: '',
    birth_date: '1944-04-29',
    contact_person: '',
    email: 'stephane.gosselin@monemail.fr',
    firstname: 'Stéphane',
    gender: 'M',
    lastname: 'Gosselin',
    note: '',
    phone_number: '0404040404',
    private_assurance: '',
    referring_physician: '',
    social_number: '111111111111111',
    city: newcity,
  }).save();
}

if (require.main === module) {
  (async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { dataSource } = require('./client');
    try {
      await dataSource.initialize();
      await seedTestDatabase();
      console.info('Test database seeded successfully');
      process.exit(0);
    } catch (error) {
      console.error('Failed to seed test database:', error);
      process.exit(1);
    }
  })();
}

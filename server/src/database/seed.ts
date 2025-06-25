import argon2 from 'argon2';
import { dataSource } from './client';
import { User, UserRole, UserStatus } from '../entities/user.entity';
import { Departement } from '../entities/departement.entity';
import { seedDoctors } from './seed-fakeDoctors';
import { seedTestAppointments } from './seedTestAppointments';
import { Planning } from '../entities/planning.entity';
import 'reflect-metadata';
import 'dotenv/config';

async function seedDatabase() {
  console.info('🌱 Starting database seeding...');

  try {
    await dataSource.initialize();
    console.info('📊 Database connection initialized');

    await dataSource.runMigrations();
    console.info('📦 Migrations executed successfully');

    const existingAdmin = await User.findOne({
      where: { email: 'admin@doctoplan.com' },
    });

    let existingDepartement = await Departement.findOne({
      where: { label: 'Administration' },
    });

    if (!existingDepartement) {
      console.info('👤 Departement not found, creating...');
      existingDepartement = new Departement();
      existingDepartement.label = 'Administration';
      existingDepartement.building = 'A';
      existingDepartement.wing = 'droite';
      existingDepartement.level = 'RDC';
      await existingDepartement.save();
    }

    if (!existingAdmin) {
      console.info('👤 Admin user not found, creating...');

      const hashedPassword = await argon2.hash(process.env.ADMIN_PASSWORD || 'admin123');

      const adminUser = new User();
      adminUser.email = 'admin@doctoplan.com';
      adminUser.password = hashedPassword;
      adminUser.role = UserRole.ADMIN;
      adminUser.firstname = 'Admin';
      adminUser.lastname = 'User';
      adminUser.departement = existingDepartement;
      adminUser.profession = 'Administrateur';
      adminUser.gender = 'M';
      adminUser.tel = '0606060606';
      adminUser.status = UserStatus.ACTIVE;

      await adminUser.save();

      const hashedSecPassword = await argon2.hash(process.env.SECRETARY_PASSWORD || 'secretary123');

      const secretaryUser = new User();
      secretaryUser.email = 'secretary@doctoplan.com';
      secretaryUser.password = hashedSecPassword;
      secretaryUser.role = UserRole.SECRETARY;
      secretaryUser.firstname = 'secretary';
      secretaryUser.lastname = 'User';
      secretaryUser.departement = existingDepartement;
      secretaryUser.status = UserStatus.ACTIVE;

      await secretaryUser.save();

      console.info('✅ Admin and secretary users created successfully');
    } else {
      console.info('👤 Admin user already exists, skipping creation');
    }

    const existingAgent = await User.findOne({
      where: { email: 'agent@doctoplan.com' },
    });

    if (!existingAgent) {
      console.info('👤 Agent user not found, creating...');

      const hashedAgentPassword = await argon2.hash(process.env.AGENT_PASSWORD || 'agent123');

      const agentUser = new User();
      agentUser.email = 'agent@doctoplan.com';
      agentUser.password = hashedAgentPassword;
      agentUser.role = UserRole.AGENT;
      agentUser.firstname = 'agent';
      agentUser.lastname = 'User';
      agentUser.departement = existingDepartement;
      agentUser.status = UserStatus.ACTIVE;

      await agentUser.save();

      console.info('✅ Agent user created successfully');
    } else {
      console.info('👤 Agent user already exists, skipping creation');
    }

    const existingDevDoctor = await User.findOne({
      where: { email: 'doctor@doctoplan.com' },
    });

    if (!existingDevDoctor) {
      console.info('👤 Dev doctor not found, creating...');

      const hashedDoctorPassword = await argon2.hash(
        process.env.DEV_DOCTOR_PASSWORD || 'doctor123',
      );

      const doctorUser = new User();
      doctorUser.email = 'doctor@doctoplan.com';
      doctorUser.password = hashedDoctorPassword;
      doctorUser.role = UserRole.DOCTOR;
      doctorUser.firstname = 'Dev';
      doctorUser.lastname = 'Doctor';
      let pediatrieDepartement = await Departement.findOne({ where: { label: 'Pédiatrie' } });
      if (!pediatrieDepartement) {
        pediatrieDepartement = new Departement();
        pediatrieDepartement.label = 'Pédiatrie';
        pediatrieDepartement.building = 'B';
        pediatrieDepartement.wing = 'gauche';
        pediatrieDepartement.level = '1er';
        await pediatrieDepartement.save();
      }
      doctorUser.departement = pediatrieDepartement;
      doctorUser.profession = 'Pédiatre';
      doctorUser.gender = 'F';
      doctorUser.tel = '0707070707';
      doctorUser.status = UserStatus.ACTIVE;
      doctorUser.activationDate = new Date().toISOString().slice(0, 10);

      await doctorUser.save();

      const planning = new Planning();
      planning.user = doctorUser;
      planning.start = new Date().toISOString().slice(0, 10);

      planning.monday_start = '09:00';
      planning.monday_end = '17:00';

      planning.tuesday_start = '09:00';
      planning.tuesday_end = '17:00';

      planning.wednesday_start = '09:00';
      planning.wednesday_end = '17:00';

      planning.thursday_start = '09:00';
      planning.thursday_end = '17:00';

      planning.friday_start = '09:00';
      planning.friday_end = '17:00';

      planning.saturday_start = null;
      planning.saturday_end = null;
      planning.sunday_start = null;
      planning.sunday_end = null;

      await planning.save();

      console.info('🗓️ Planning hebdomadaire (lun–ven 9h–17h) ajouté pour Dev Doctor');

      console.info('✅ Dev doctor user and full weekly planning created successfully');
    } else {
      console.info('👤 Dev doctor already exists, skipping creation');
    }

    try {
      await seedDoctors();
    } catch (error) {
      console.error('❌ Failed to seed doctors:', error);
    }

    await seedTestAppointments();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await dataSource.destroy();
    console.info('🔌 Database connection closed');
  }
}

seedDatabase()
  .then(() => {
    console.info('🎉 Database seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error during seeding:', error);
    process.exit(1);
  });

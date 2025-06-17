import argon2 from 'argon2';
import { dataSource } from './client';
import { User, UserRole, UserStatus } from '../entities/user.entity';
import { Departement } from '../entities/departement.entity';
import { seedDoctors } from './seed-fakeDoctors';
import { seedTestAppointments } from './seedTestAppointments';
import 'reflect-metadata';
import 'dotenv/config';

async function seedDatabase() {
  console.info('🌱 Starting database seeding...');

  try {
    await dataSource.initialize();
    console.info('📊 Database connection initialized');

    // ✅ Execute migrations befor seed in order to have all the department to create new doctor user
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
      doctorUser.departement = existingDepartement; // Département par défaut (Administration)
      doctorUser.profession = 'Pédiatre';
      doctorUser.gender = 'F';
      doctorUser.tel = '0707070707';
      doctorUser.status = UserStatus.ACTIVE;

      await doctorUser.save();

      console.info('✅ Dev doctor user created successfully');
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

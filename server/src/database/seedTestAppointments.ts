import { Departement } from '../entities/departement.entity';
import { City } from '../entities/city.entity';
import { Patient } from '../entities/patient.entity';
import { User } from '../entities/user.entity';
import { Appointment, AppointmentStatus } from '../entities/appointment.entity';
import { AppointmentType } from '../entities/appointment-type.entity';
import { UserRole } from '../entities/user.entity';
import { UserStatus } from '../entities/user.entity';
import argon2 from 'argon2';

export async function seedTestAppointments() {
  console.info('📅 Creating test appointments for agent page...');

  try {
    const departments = [
      { label: 'Dermatologie', building: 'B', wing: 'gauche', level: '1er' },
      { label: 'Cardiologie', building: 'C', wing: 'droite', level: '2ème' },
      { label: 'Pédiatrie', building: 'A', wing: 'centre', level: 'RDC' },
    ];

    const createdDepartments = [];
    for (const dept of departments) {
      let department = await Departement.findOne({ where: { label: dept.label } });
      if (!department) {
        console.info(`Creating department: ${dept.label}`);
        department = new Departement();
        department.label = dept.label;
        department.building = dept.building;
        department.wing = dept.wing;
        department.level = dept.level;
        await department.save();
      } else {
        console.info(`Department already exists: ${dept.label}`);
      }
      createdDepartments.push(department);
    }

    let testCity = await City.findOne({ where: { zip_code: '75001' } });
    if (!testCity) {
      console.info('Creating test city: Paris');
      testCity = new City();
      testCity.zip_code = '75001';
      testCity.city = 'Paris';
      await testCity.save();
    } else {
      console.info('Test city already exists: Paris');
    }

    const patientsData = [
      {
        firstname: 'Jean',
        lastname: 'Dupont',
        social_number: '1212121212122',
        email: 'jean.dupont@email.com',
      },
      {
        firstname: 'Marie',
        lastname: 'Martin',
        social_number: '1987654321098',
        email: 'marie.martin@email.com',
      },
      {
        firstname: 'Pierre',
        lastname: 'Durand',
        social_number: '1555666777888',
        email: 'pierre.durand@email.com',
      },
      {
        firstname: 'Sophie',
        lastname: 'Bernard',
        social_number: '1333444555666',
        email: 'sophie.bernard@email.com',
      },
    ];

    const createdPatients = [];
    for (const patientData of patientsData) {
      let patient = await Patient.findOne({ where: { social_number: patientData.social_number } });
      if (!patient) {
        console.info(`Creating patient: ${patientData.firstname} ${patientData.lastname}`);
        patient = new Patient();
        patient.firstname = patientData.firstname;
        patient.lastname = patientData.lastname;
        patient.social_number = patientData.social_number;
        patient.email = patientData.email;
        patient.gender = 'M';
        patient.birth_date = '1990-01-01';
        patient.adress = '123 Rue de Test';
        patient.phone_number = '0123456789';
        patient.note = 'Patient de test';
        patient.birth_city = 'Paris';
        patient.private_assurance = '';
        patient.referring_physician = '';
        patient.contact_person = '';
        patient.city = testCity;
        await patient.save();
      } else {
        console.info(`Patient already exists: ${patientData.firstname} ${patientData.lastname}`);
      }
      createdPatients.push(patient);
    }

    const doctorsData = [
      {
        firstname: 'Dr Sarah',
        lastname: 'Bishop',
        email: 'dr.bishop@doctoplan.com',
        department: createdDepartments[0],
      },
      {
        firstname: 'Dr Michel',
        lastname: 'Maboul',
        email: 'dr.maboul@doctoplan.com',
        department: createdDepartments[0],
      },
      {
        firstname: 'Dr Alice',
        lastname: 'Coeur',
        email: 'dr.coeur@doctoplan.com',
        department: createdDepartments[1],
      },
      {
        firstname: 'Dr Paul',
        lastname: 'Enfant',
        email: 'dr.enfant@doctoplan.com',
        department: createdDepartments[2],
      },
    ];

    const createdDoctors = [];
    for (const doctorData of doctorsData) {
      let doctor = await User.findOne({ where: { email: doctorData.email } });
      if (!doctor) {
        console.info(`Creating doctor: ${doctorData.firstname} ${doctorData.lastname}`);
        const hashedPassword = await argon2.hash('doctor123');
        doctor = new User();
        doctor.email = doctorData.email;
        doctor.password = hashedPassword;
        doctor.firstname = doctorData.firstname;
        doctor.lastname = doctorData.lastname;
        doctor.role = UserRole.DOCTOR;
        doctor.status = UserStatus.ACTIVE;
        doctor.departement = doctorData.department;
        doctor.profession = 'Médecin';
        doctor.gender = 'M';
        doctor.tel = '0123456789';
        await doctor.save();
      } else {
        console.info(`Doctor already exists: ${doctorData.firstname} ${doctorData.lastname}`);
      }
      createdDoctors.push(doctor);
    }

    const appointmentTypesData = ['Consultation', 'Suivi', 'Contrôle', 'Urgence'];

    const createdAppointmentTypes = [];
    for (const typeName of appointmentTypesData) {
      let appointmentType = await AppointmentType.findOne({ where: { reason: typeName } });
      if (!appointmentType) {
        console.info(`Creating appointment type: ${typeName}`);
        appointmentType = new AppointmentType();
        appointmentType.reason = typeName;
        await appointmentType.save();
      } else {
        console.info(`Appointment type already exists: ${typeName}`);
      }
      createdAppointmentTypes.push(appointmentType);
    }

    const now = new Date();
    const appointmentsData = [
      {
        patient: createdPatients[0],
        doctor: createdDoctors[0],
        department: createdDepartments[0],
        appointmentType: createdAppointmentTypes[0],
        start_time: new Date(now.getTime() + 5 * 60 * 1000),
        duration: 30,
      },
      {
        patient: createdPatients[1],
        doctor: createdDoctors[1],
        department: createdDepartments[0],
        appointmentType: createdAppointmentTypes[1],
        start_time: new Date(now.getTime() + 15 * 60 * 1000),
        duration: 45,
      },
      {
        patient: createdPatients[2],
        doctor: createdDoctors[2],
        department: createdDepartments[1],
        appointmentType: createdAppointmentTypes[2],
        start_time: new Date(now.getTime() + 25 * 60 * 1000),
        duration: 30,
      },
      {
        patient: createdPatients[3],
        doctor: createdDoctors[3],
        department: createdDepartments[2],
        appointmentType: createdAppointmentTypes[3],
        start_time: new Date(now.getTime() + 60 * 60 * 1000),
        duration: 30,
      },
    ];

    const devDoctor = await User.findOne({ where: { email: 'doctor@doctoplan.com' } });
    if (devDoctor) {
      appointmentsData.push({
        patient: createdPatients[0],
        doctor: devDoctor,
        department: devDoctor.departement,
        appointmentType: createdAppointmentTypes[0],
        start_time: new Date(now.getTime() + 90 * 60 * 1000),
        duration: 30,
      });
    }

    for (const appointmentData of appointmentsData) {
      const existingAppointment = await Appointment.findOne({
        where: {
          patient: { id: appointmentData.patient.id },
          doctor: { id: appointmentData.doctor.id },
          start_time: appointmentData.start_time,
        },
      });

      if (!existingAppointment) {
        console.info(
          `Creating appointment for ${appointmentData.patient.firstname} ${appointmentData.patient.lastname} with Dr. ${appointmentData.doctor.lastname}`,
        );
        const appointment = new Appointment();
        appointment.patient = appointmentData.patient;
        appointment.doctor = appointmentData.doctor;
        appointment.created_by = appointmentData.doctor;
        appointment.departement = appointmentData.department;
        appointment.appointmentType = appointmentData.appointmentType;
        appointment.start_time = appointmentData.start_time;
        appointment.duration = appointmentData.duration;
        appointment.status = AppointmentStatus.CONFIRMED;
        await appointment.save();
      } else {
        console.info(
          `Appointment already exists for ${appointmentData.patient.firstname} ${appointmentData.patient.lastname} with Dr. ${appointmentData.doctor.lastname}`,
        );
      }
    }

    console.info('✅ Test appointments created successfully');
    console.info(`📊 Created:`);
    console.info(`   - ${createdDepartments.length} departments`);
    console.info(`   - ${createdPatients.length} patients`);
    console.info(`   - ${createdDoctors.length} doctors`);
    console.info(`   - ${createdAppointmentTypes.length} appointment types`);
    console.info(`   - ${appointmentsData.length} appointments`);

    console.info('\n🔍 Pour tester la page agent:');
    console.info('   Numéros de sécurité sociale:');
    createdPatients.forEach((patient) => {
      console.info(`   - ${patient.social_number} (${patient.firstname} ${patient.lastname})`);
    });
    console.info('   IDs des départements:');
    createdDepartments.forEach((dept) => {
      console.info(`   - ${dept.id} (${dept.label})`);
    });
  } catch (error) {
    console.error('❌ Failed to seed test appointments:', error);
    throw error;
  }
}

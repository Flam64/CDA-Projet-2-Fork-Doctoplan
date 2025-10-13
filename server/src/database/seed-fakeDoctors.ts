import { User, UserRole, UserStatus } from '../entities/user.entity';
import { Departement } from '../entities/departement.entity';
import argon2 from 'argon2';

const firstnames = ['Jean', 'Marie', 'Paul', 'Luc', 'Claire', 'Sophie'];
const lastnames = ['Durand', 'Lemoine', 'Moreau', 'Garcia', 'Leroy', 'Faure'];

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function sanitize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD') // Separate letter and accent
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z]/g, ''); // Remove all non-lowercase letters (a–z)
}

export async function seedDoctors() {
  console.info('📋 Fetching all departments...');
  const departements = await Departement.find();

  for (const departement of departements) {
    for (let i = 0; i < 6; i++) {
      const firstname = getRandom(firstnames);
      const lastname = getRandom(lastnames);
      const baseEmail = `medecin.${sanitize(lastname)}`;
      let email = `${baseEmail}@hospital.com`;
      let suffix = 1;
      while (await User.findOneBy({ email })) {
        suffix++;
        email = `${baseEmail}${suffix}@hospital.com`;
      }
      const user = new User();
      user.email = email;
      user.password = await argon2.hash('medecin123');
      user.firstname = firstname;
      user.lastname = lastname;
      user.role = UserRole.DOCTOR;
      user.status = UserStatus.ACTIVE;
      user.departement = departement;
      user.profession = 'Médecin';
      user.gender = Math.random() > 0.5 ? 'Homme' : 'Femme';
      user.tel = `06${Math.floor(10000000 + Math.random() * 89999999)}`;

      try {
        await user.save();
      } catch (err) {
        console.warn(`⚠️ Error doctor creation (${email}):`, err.message);
      }
    }
  }
}

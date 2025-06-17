import { MigrationInterface, QueryRunner } from 'typeorm';

export class Data1746023848449 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO city
        SELECT id,cast(postal_code as varchar(15)),city FROM citytemp;`,
    );

    await queryRunner.query(
      `INSERT INTO departement (label, status, building, wing, level)
        SELECT
            m.service,
            'active',
            '',
            '',
            ''
        from mytable m
        GROUP BY 1;`,
    );

    await queryRunner.query(
      `INSERT INTO "user"(email, password,firstname,lastname,status,"departementId")
          SELECT
              m.email_medecin,
              '',
              substr(m.nom_medecin,1,POSITION(' ' IN m.nom_medecin)),
              substr(m.nom_medecin,POSITION(' ' IN m.nom_medecin)),
              'active',
              max(d.id)
          FROM mytable m
          INNER JOIN departement d ON d.label = m.service
          GROUP by m.email_medecin,m.nom_medecin,m.genre_medecin;`,
    );

    await queryRunner.query(
      `INSERT INTO patient (email, firstname, lastname, phone_number, social_number, private_assurance, gender, birth_date, birth_city, note, adress, referring_physician, contact_person, "cityId")
        SELECT
            m.email_patient,
            substr(m.nom_patient,1,POSITION(' ' IN m.nom_patient)),
            substr(m.nom_patient,POSITION(' ' IN m.nom_patient)),
            '',
            m.social_number,
            '',
            m.sex_patient,
            cast(m.date_naissance_patient as date),
            '',
            '',
            '',
            '',
            '',
            max(c.id)
        FROM mytable m
        LEFT JOIN city c
            ON substr(c.zip_code,1,5) = substr(m.code_postal,1,5)
        GROUP BY
            m.nom_patient,
            m.social_number,
            m.date_naissance_patient,
            m.email_patient,
            m.sex_patient;`,
    );

    await queryRunner.query(
      `INSERT INTO planning (start, monday_start, monday_end, tuesday_start, tuesday_end, wednesday_start, wednesday_end, thursday_start, thursday_end, friday_start, friday_end, saturday_start, saturday_end, sunday_start, sunday_end, "user_id")
        SELECT
            CURRENT_DATE + INTERVAL '-1 day',
            CASE WHEN m."jours_ouvrés" LIKE '%lundi%' then (DATE_PART('hour',(heure_debut)::TIME) || ':00')::TIME end,
            CASE WHEN m."jours_ouvrés" LIKE '%lundi%' then (DATE_PART('hour',(heure_fin)::TIME) || ':00')::TIME end,
            CASE WHEN m."jours_ouvrés" LIKE '%mardi%' then (DATE_PART('hour',(heure_debut)::TIME) || ':00')::TIME end,
            CASE WHEN m."jours_ouvrés" LIKE '%mardi%' then (DATE_PART('hour',(heure_fin)::TIME) || ':00')::TIME end,
            CASE WHEN m."jours_ouvrés" LIKE '%mercredi%' then (DATE_PART('hour',(heure_debut)::TIME) || ':00')::TIME end,
            CASE WHEN m."jours_ouvrés" LIKE '%mercredi%' then (DATE_PART('hour',(heure_fin)::TIME) || ':00')::TIME end,
            CASE WHEN m."jours_ouvrés" LIKE '%jeudi%' then (DATE_PART('hour',(heure_debut)::TIME) || ':00')::TIME end,
            CASE WHEN m."jours_ouvrés" LIKE '%jeudi%' then (DATE_PART('hour',(heure_fin)::TIME) || ':00')::TIME end,
            CASE WHEN m."jours_ouvrés" LIKE '%vendredi%' then (DATE_PART('hour',(heure_debut)::TIME) || ':00')::TIME end,
            CASE WHEN m."jours_ouvrés" LIKE '%vendredi%' then (DATE_PART('hour',(heure_fin)::TIME) || ':00')::TIME end,
            CASE WHEN m."jours_ouvrés" LIKE '%samedi%' then (DATE_PART('hour',(heure_debut)::TIME) || ':00')::TIME end,
            CASE WHEN m."jours_ouvrés" LIKE '%samedi%' then (DATE_PART('hour',(heure_fin)::TIME) || ':00')::TIME end,
            CASE WHEN m."jours_ouvrés" LIKE '%dimanche%' then (DATE_PART('hour',(heure_debut)::TIME) || ':00')::TIME end,
            CASE WHEN m."jours_ouvrés" LIKE '%dimanche%' then (DATE_PART('hour',(heure_fin)::TIME) || ':00')::TIME end,
            u.id
        FROM mytable m
        INNER JOIN "user" u ON u.firstname = substr(m.nom_medecin,1,POSITION(' ' IN m.nom_medecin)) AND u.lastname = substr(m.nom_medecin,POSITION(' ' IN m.nom_medecin))
        GROUP BY u.id,m."jours_ouvrés",heure_debut ,heure_fin;`,
    );

    await queryRunner.query(`
      INSERT INTO "appointement-type"(reason)
      SELECT DISTINCT motif_consultation FROM mytable
      WHERE motif_consultation IS NOT NULL AND motif_consultation <> '';
    `);

    await queryRunner.query(`
      INSERT INTO appointment (
          start_time,
          duration,
          status,
          user_id,
          patient_id,
          created_by,
          appointment_type_id,
          departement_id
        )
        SELECT
          case
            when DATE_PART('minute',CAST(m.date AS DATE) + CAST(m.rdv_début AS TIME))=45 then
              CAST(m.date AS DATE) + INTERVAL '1 year' + CAST(DATE_PART('hour',CAST(m.date AS DATE) + CAST(m.rdv_début AS TIME)) || ':30' AS TIME)
            when DATE_PART('minute',CAST(m.date AS DATE) + CAST(m.rdv_début AS TIME))=15 then
              CAST(m.date AS DATE) + INTERVAL '1 year' + CAST(DATE_PART('hour',CAST(m.date AS DATE) + CAST(m.rdv_début AS TIME)) || ':00' AS TIME)
            else
              CAST(m.date AS DATE) + INTERVAL '1 year' + CAST(m.rdv_début AS TIME)
          end,
          case
            when m.durée = 45 then
              60
            when m.durée = 15 then
              30
            else
              m.durée
          end,
          'confirmed',
          u.id,
          p.id,
          u.id,
          at.id,
          d.id
        FROM mytable m
        INNER JOIN "user" u ON u.email = m.email_medecin
        INNER JOIN patient p ON p.social_number = m.social_number
        INNER JOIN "appointement-type" at ON at.reason = m.motif_consultation
        INNER JOIN departement d ON d.label = m.service;
    `);

    await queryRunner.query(`
      INSERT INTO doc_type VALUES (1,'Carte didentité','patient');
      INSERT INTO doc_type VALUES (2,'Passeport','patient');
      INSERT INTO doc_type VALUES (3,'Assurance','patient');
      INSERT INTO doc_type VALUES (4,'Carte vitale','patient');
      INSERT INTO doc_type VALUES (5,'Notes','patient');
    `);

    await queryRunner.query(`
      INSERT INTO doc_type VALUES (6,'Odronnance','appointment');
      INSERT INTO doc_type VALUES (7,'Autre','appointment');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM appointment;`);
    await queryRunner.query(`DELETE FROM planning;`);
    await queryRunner.query(`DELETE FROM patient;`);
    await queryRunner.query(`DELETE FROM "user";`);
    await queryRunner.query(`DELETE FROM "appointement-type";`);
    await queryRunner.query(`DELETE FROM departement;`);
    await queryRunner.query(`DELETE FROM city;`);
  }
}

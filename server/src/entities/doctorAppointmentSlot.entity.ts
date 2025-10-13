import { ViewEntity, ViewColumn, BaseEntity } from 'typeorm';
import { Field, ObjectType } from 'type-graphql';

/**
 * Creation d'une vue pour les créneaux de rendez-vous disponibles des médecins .
 * les WITH JOURS permettent de générer une série de dates à partir d'aujourd'hui jusqu'à 3 mois plus tard.
 * les CREENEAUX permettent de récupérer les horaires de disponibilité des médecins pour chaque jour.
 * date_part('isodow', tt.jour) est utilisé pour déterminer le jour de la semaine (1 = lundi, 2 = mardi, etc.).
 * CROSS JOIN est utilisé pour combiner les jours avec les horaires de disponibilité des médecins.
 *            Attention, cela peut générer un grand nombre de lignes si de nombreux médecins sont disponibles.
 * les APPOINTEMENT permettent de récupérer les rendez-vous existants pour chaque médecin.
 * LAG est utilisé pour obtenir la fin du rendez-vous précédent afin de déterminer les créneaux libres.
 * les LIBRES permettent de calculer les créneaux libres en fonction des rendez-vous et des horaires de disponibilité.
 *
 * La vue peut être un peu couteuse en performance si de nombreux médecins sont disponibles, a tester en production.
 */
@ObjectType()
@ViewEntity({
  expression: `
    WITH jours AS (
      SELECT generate_series(
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '3 months' - INTERVAL '1 day',
        INTERVAL '1 day'
      )::DATE AS jour
    ),
    creneaux AS (
      SELECT
        tt.jour,
        a.user_id,
        CASE
          WHEN date_part('isodow', tt.jour) = 1 THEN monday_start
          WHEN date_part('isodow', tt.jour) = 2 THEN tuesday_start
          WHEN date_part('isodow', tt.jour) = 3 THEN wednesday_start
          WHEN date_part('isodow', tt.jour) = 4 THEN thursday_start
          WHEN date_part('isodow', tt.jour) = 5 THEN friday_start
          WHEN date_part('isodow', tt.jour) = 6 THEN saturday_start
          WHEN date_part('isodow', tt.jour) = 7 THEN sunday_start
        END AS debut_libreapp,
        CASE
          WHEN date_part('isodow', tt.jour) = 1 THEN monday_end
          WHEN date_part('isodow', tt.jour) = 2 THEN tuesday_end
          WHEN date_part('isodow', tt.jour) = 3 THEN wednesday_end
          WHEN date_part('isodow', tt.jour) = 4 THEN thursday_end
          WHEN date_part('isodow', tt.jour) = 5 THEN friday_end
          WHEN date_part('isodow', tt.jour) = 6 THEN saturday_end
          WHEN date_part('isodow', tt.jour) = 7 THEN sunday_end
        END AS fin_libreapp
      FROM planning a
      INNER JOIN "user" u on u.id = a.user_id and u.status = 'active'
      INNER JOIN jours tt ON tt.jour >= (a.start)::DATE AND tt.jour <= COALESCE((a."end")::DATE, tt.jour)
    ),
    appointement AS (
      SELECT
        a.user_id,
        (a.start_time)::DATE AS jour,
        (a.start_time)::TIME AS debut,
        (a.start_time + (a.duration || ' minutes')::INTERVAL)::TIME AS fin,
        LAG((a.start_time + (a.duration || ' minutes')::INTERVAL)::TIME) OVER (
          PARTITION BY a.user_id, (a.start_time)::DATE
          ORDER BY a.start_time
        ) AS prev_fin
      FROM appointment a
      JOIN "user" u on u.id = a.user_id and u.status = 'active'
      INNER JOIN jours tt ON tt.jour = (a.start_time)::DATE
    ),
    libres AS (
      -- rendez-vous
      SELECT
        c.jour,
        c.user_id,
        c.prev_fin AS debut_libre,
        c.debut AS fin_libre
      FROM appointement c
      WHERE c.prev_fin IS NOT NULL

      UNION ALL

      -- avant le premier rendez-vous (si rendez-vous)
      SELECT
        a.jour,
        a.user_id,
        a.debut_libreapp,
        (SELECT MIN(c2.debut) FROM appointement c2 WHERE c2.jour = a.jour AND c2.user_id = a.user_id)
      FROM creneaux a
      WHERE EXISTS (
        SELECT 1 FROM appointement c3 WHERE c3.jour = a.jour AND c3.user_id = a.user_id
      )

      UNION ALL

      -- après le dernier rendez-vous (si rendez-vous)
      SELECT
        a.jour,
        a.user_id,
        (SELECT MAX(c2.fin) FROM appointement c2 WHERE c2.jour = a.jour AND c2.user_id = a.user_id),
        a.fin_libreapp
      FROM creneaux a
      WHERE EXISTS (
        SELECT 1 FROM appointement c3 WHERE c3.jour = a.jour AND c3.user_id = a.user_id
      )

      UNION ALL

      -- Journée entière libre si aucun rendez-vous
      SELECT
        a.jour,
        a.user_id,
        a.debut_libreapp,
        a.fin_libreapp
      FROM creneaux a
      WHERE NOT EXISTS (
        SELECT 1 FROM appointement c WHERE c.jour = a.jour AND c.user_id = a.user_id
      )
    )
    SELECT
      ROW_NUMBER() OVER (ORDER BY l.jour, l.debut_libre) AS id,
      jour,
      l.user_id,
      u.firstname,
      u.lastname,
      u."departementId" departement_id,
      debut_libre,
      fin_libre
    FROM libres l
    INNER JOIN "user" u ON u.id = l.user_id
    WHERE (debut_libre < fin_libre)
    ORDER BY jour, debut_libre;
  `,
})
export class DoctorAppointmentSlot extends BaseEntity {
  @Field()
  @ViewColumn()
  id: number;

  @Field()
  @ViewColumn()
  jour: string;

  @Field()
  @ViewColumn()
  user_id: string;

  @Field()
  @ViewColumn()
  firstname: string;

  @Field()
  @ViewColumn()
  lastname: string;

  @Field()
  @ViewColumn()
  departement_id: string;

  @Field()
  @ViewColumn()
  debut_libre: string;

  @Field()
  @ViewColumn()
  fin_libre: string;
}

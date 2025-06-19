ALTER DATABASE doctoplan
SET TIMEZONE TO 'Europe/Paris';

CREATE TABLE mytable(
  id INTEGER NOT NULL,
   description                  VARCHAR(255) NOT NULL
  ,informations_complémentaires VARCHAR(255) NOT NULL
  ,date                         VARCHAR(255)  NOT NULL
  ,durée                        INTEGER  NOT NULL
  ,rdv_début                    VARCHAR(11) NOT NULL
  ,nom_medecin                  VARCHAR(100) NOT NULL
  ,email_medecin                VARCHAR(100) NOT NULL
  ,genre_medecin                VARCHAR(5) NOT NULL
  ,service                      VARCHAR(100) NOT NULL
  ,jours_ouvrés                 VARCHAR(50) NOT NULL
  ,heure_debut                  VARCHAR(5) NOT NULL
  ,heure_fin                    VARCHAR(5) NOT NULL
  ,FIELD13                      VARCHAR(100) NOT NULL
  ,motif_consultation           VARCHAR(100) NOT NULL
  ,pieces_ajoutées              VARCHAR(100) NOT NULL
  ,nom_patient                  VARCHAR(100) NOT NULL
  ,sex_patient                  VARCHAR(1) NOT NULL
  ,social_number                VARCHAR(25) NOT NULL
  ,email_patient                VARCHAR(100) NOT NULL
  ,fichiers_ajoutés_medcine     VARCHAR(100) NOT NULL
  ,info_ajoutée_dossier_medecin VARCHAR(100) NOT NULL
  ,date_naissance_patient       VARCHAR(20)  NOT NULL
  ,code_postal                  VARCHAR(10)  NOT NULL
  ,ville_patient                VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS citytemp (
  id INTEGER NOT NULL,
  postal_code varchar(250) DEFAULT NULL,
  city varchar(250) DEFAULT NULL,
  PRIMARY KEY (id)
);

COPY mytable
FROM '/docker-entrypoint-initdb.d/data.csv'
DELIMITER ',';


COPY citytemp
FROM '/docker-entrypoint-initdb.d/datacity.csv'
DELIMITER ',';
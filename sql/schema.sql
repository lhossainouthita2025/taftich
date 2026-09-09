SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS suivi_pedagogique
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE suivi_pedagogique;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  nom VARCHAR(120) NOT NULL,
  prenom VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'inspecteur', 'consultation') NOT NULL DEFAULT 'inspecteur',
  academie VARCHAR(160),
  direction TEXT,
  directions_provinciales JSON,
  matiere VARCHAR(160),
  specialite VARCHAR(255),
  avatar VARCHAR(32),
  telephone VARCHAR(64),
  bureau VARCHAR(255),
  doti VARCHAR(64),
  must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
  last_login DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS communes (
  id VARCHAR(64) PRIMARY KEY,
  nom_ar VARCHAR(160) NOT NULL,
  nom_fr VARCHAR(160) NOT NULL,
  province VARCHAR(160) NOT NULL,
  region VARCHAR(160) NOT NULL
);

CREATE TABLE IF NOT EXISTS etablissements (
  id VARCHAR(64) PRIMARY KEY,
  nom_ar VARCHAR(255) NOT NULL,
  nom_fr VARCHAR(255) NOT NULL,
  commune VARCHAR(160) NOT NULL,
  commune_fr VARCHAR(160) NOT NULL,
  type ENUM('college', 'lycee', 'qualifiant') NOT NULL,
  est_pionnier BOOLEAN NOT NULL DEFAULT FALSE,
  direction_provinciale VARCHAR(160) NOT NULL,
  academie VARCHAR(160) NOT NULL,
  code_etab VARCHAR(64),
  adresse VARCHAR(255),
  telephone VARCHAR(64),
  email VARCHAR(255),
  directeur_nom VARCHAR(255),
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  date_creation DATE
);

CREATE TABLE IF NOT EXISTS enseignants (
  id VARCHAR(64) PRIMARY KEY,
  doti VARCHAR(64) NOT NULL UNIQUE,
  nom VARCHAR(255) NOT NULL,
  nom_fr VARCHAR(255),
  etablissement_id VARCHAR(64) NOT NULL,
  etablissement_nom VARCHAR(255) NOT NULL,
  commune VARCHAR(160) NOT NULL,
  grade VARCHAR(255) NOT NULL,
  matiere VARCHAR(160) NOT NULL,
  cycle ENUM('ابتدائي','اعدادي', 'تأهيلي') NOT NULL,
  actif BOOLEAN NOT NULL DEFAULT TRUE,
  telephone VARCHAR(64),
  email VARCHAR(255),
  date_naissance DATE,
  date_recrutement DATE,
  echelon VARCHAR(64),
  promotion_echelon BOOLEAN NOT NULL DEFAULT FALSE,
  promotion_grade BOOLEAN NOT NULL DEFAULT FALSE,
  derniere_note DECIMAL(5, 2) NULL,
  derniere_annee_inspection SMALLINT NULL,
  derniere_date_inspection DATE NULL,
  remarques TEXT,
  emploi_du_temps JSON,
  FOREIGN KEY (etablissement_id) REFERENCES etablissements(id) ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS activities (
  id VARCHAR(64) PRIMARY KEY,
  type VARCHAR(32) NOT NULL,
  date DATE NOT NULL,
  commune VARCHAR(160) NOT NULL,
  etablissement_id VARCHAR(64) NOT NULL,
  etablissement_nom VARCHAR(255) NOT NULL,
  responsable_nom VARCHAR(255) NOT NULL,
  objet VARCHAR(255) NOT NULL,
  payload JSON NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (etablissement_id) REFERENCES etablissements(id) ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS annees_scolaires (
  id VARCHAR(32) PRIMARY KEY,
  libelle VARCHAR(32) NOT NULL,
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  est_active BOOLEAN NOT NULL DEFAULT FALSE,
  statut ENUM('en_cours', 'cloturee', 'a_venir') NOT NULL,
  description TEXT
);

CREATE INDEX idx_activities_date ON activities(date);
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_enseignants_matiere ON enseignants(matiere);
CREATE INDEX idx_etablissements_direction ON etablissements(direction_provinciale);

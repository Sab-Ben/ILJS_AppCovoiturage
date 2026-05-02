# ILJS App Covoiturage
Cette application est une plateforme de covoiturage moderne permettant la mise en relation de conducteurs et de passagers. 
Elle intègre un système de gestion de trajets, une messagerie en temps réel, un système de points et une cartographie interactive.

# Technologies Utilisées
## Backend
- Framework : Spring Boot 3.5.8
- Langage : Java 17
- Sécurité : Spring Security avec authentification par jetons JWT (JSON Web Token)
- Base de données : PostgreSQL
- Communication : WebSockets (Spring WebSocket) pour les notifications et messages en temps réel
- Gestion des mails : Spring Boot Starter Mail
- Build Tool : Maven

## Frontend
- Framework : Angular 19.2.0
- Gestion d'état : NgRx (Store & Effects)
- Design : Tailwind CSS
- Cartographie : Leaflet
- Communication Real-time : STOMP.js et SockJS
- Internationalisation : ngx-translate

## Infrastructure
Conteneurisation : Docker & Docker Compose

# Fonctionnalités Clés
- Authentification sécurisée : Système d'inscription et de connexion utilisant JWT.
- Recherche et Création de Trajets : Consultation et publication d'offres de covoiturage.
- Cartographie interactive : Visualisation des trajets sur une carte via Leaflet.
- Messagerie Instantanée : Chat en temps réel entre utilisateurs.
- Système de Points : Gestion d'un solde de points pour les réservations.
- Notifications : Alertes en temps réel via WebSockets.

# Prérequis
Docker et Docker Compose
(Optionnel pour le dev local) Java 17, Node.js (v18+) et Angular CLI.

# Installation et Lancement
Avec Docker (Recommandé)
Le projet est configuré pour être lancé rapidement avec Docker Compose.
Clonez le dépôt.

À la racine du projet, lancez : docker-compose up --build
L'application sera accessible sur :
- Backend : http://localhost:8080
- Base de données : PostgreSQL sur le port 5432

# Développement Local
## Backend
Bash
cd backend
./mvnw spring-boot:run

## Frontend
Bash
cd frontend
npm install
ng serve
L'application frontend sera disponible sur http://localhost:4200/.

# Structure du Projet
/backend : Code source Spring Boot, configuration JPA et sécurité.

/frontend : Application Angular, composants UI, services NgRx et assets.

docker-compose.yml : Configuration de l'orchestration des conteneurs (Base de données et Backend).

# CRM Event

Application web de gestion pour La Dernière Touche — **Laravel + Inertia.js + React**.

---

## Versions

| Outil | Version |
| --- | --- |
| PHP | 8.3 |
| Laravel | 13 |
| Inertia (Laravel et React) | 2 |
| React | 19 |
| Vite | 8 |
| Tailwind CSS | 4 |
| Node | ≥ 22.12 (exigé par Vite 8) |
| Base de données | MariaDB (hébergée sur Alwaysdata, partagée par l'équipe) |

---

## 1. Prérequis

### Linux

```bash
sudo apt update
sudo apt install php8.3 php8.3-cli php8.3-mbstring php8.3-xml php8.3-curl php8.3-mysql composer unzip -y
```

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install nodejs -y
```

### Windows

- PHP 8.3 (Thread Safe) : https://windows.php.net/download/ → extraire dans `C:\php` → ajouter `C:\php` au PATH
- Composer : https://getcomposer.org/Composer-Setup.exe
- Node.js LTS (≥ 22.12) : https://nodejs.org
- Git : https://git-scm.com/download/win

Dans `C:\php\php.ini`, décommenter (enlever le `;`) :

```
extension=curl
extension=fileinfo
extension=mbstring
extension=openssl
extension=pdo_mysql
```

### Vérification

```bash
php -v        # 8.3.x
composer -V
node -v       # v22.12 ou plus
npm -v
```

---

## 2. Installation

```bash
git clone git@github.com:crm-event/crm-event-gestion.git
cd crm-event-gestion
composer install
npm install
cp .env.example .env        # Windows : copy .env.example .env
php artisan key:generate
```

Dans `.env`, décommenter les lignes `DB_*` et y mettre les identifiants de la
base Alwaysdata (à demander à l'équipe, **jamais à committer**) :

```
DB_CONNECTION=mysql
DB_HOST=...
DB_PORT=3306
DB_DATABASE=...
DB_USERNAME=...
DB_PASSWORD=...
```

La base est **commune à toute l'équipe** : elle est déjà migrée, il n'y a rien
à lancer de plus. Ne jamais exécuter `php artisan migrate:fresh` sans prévenir
les autres — cette commande vide la base pour tout le monde.

---

## 3. Lancer le projet

```bash
composer run dev
```

Puis ouvrir **http://localhost:8000**.

Cette seule commande lance tout : le serveur PHP, Vite (rechargement
automatique du front), la file de tâches et l'affichage des logs. `Ctrl+C`
arrête l'ensemble.

Si le port 8000 ou 5173 est déjà pris, c'est qu'une instance tourne déjà :
l'arrêter avant d'en relancer une.

---

## 4. (Optionnel) Assistant IA — Laravel Boost

Si vous codez avec un assistant IA (Claude Code, Cursor, Copilot, PhpStorm…),
Laravel Boost lui donne la documentation des versions exactes du projet, les
conventions Laravel et un accès en lecture au schéma de la base.

Le paquet est déjà installé avec `composer install`. Il reste à le brancher sur
votre outil, une seule fois par machine :

```bash
php artisan boost:install
```

Choisir son outil quand la commande le demande. Le fichier `.mcp.json` généré
est propre à chaque machine et n'est pas versionné.

---

## Documentation

- [`docs/CONTEXTE-PROJET.md`](docs/CONTEXTE-PROJET.md) — le métier de la
  cliente, ses besoins et les décisions prises
- [`docs/bdd/`](docs/bdd/) — le schéma de la base et ses choix de conception

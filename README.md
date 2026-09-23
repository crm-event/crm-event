# CRM Event

Application web de gestion pour La Dernière Touche, en Laravel, Inertia.js et React.

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
| Node | 22.12 minimum (exigé par Vite 8) |
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

- PHP 8.3 (Thread Safe) : https://windows.php.net/download/, à extraire dans `C:\php`, puis ajouter `C:\php` au PATH
- Composer : https://getcomposer.org/Composer-Setup.exe
- Node.js LTS (22.12 minimum) : https://nodejs.org
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
git clone git@github.com:crm-event/crm-event.git
cd crm-event
composer install
npm install
cp .env.example .env        # Windows : copy .env.example .env
php artisan key:generate
```

Dans `.env`, décommenter les lignes `DB_*` et y mettre les identifiants de la
base Alwaysdata (à demander à l'équipe, jamais à committer) :

```
DB_CONNECTION=mysql
DB_HOST=...
DB_PORT=3306
DB_DATABASE=...
DB_USERNAME=...
DB_PASSWORD=...
```

La base est commune à toute l'équipe et déjà migrée, il n'y a donc rien à
lancer de plus. Ne jamais exécuter `php artisan migrate:fresh` sans prévenir les
autres, car cette commande vide la base pour tout le monde.

---

## 3. Lancer le projet

```bash
composer run dev
```

Puis ouvrir http://localhost:8000.

La commande lance le serveur PHP, Vite (rechargement automatique du front),
la file de tâches et l'affichage des logs. `Ctrl+C` arrête le tout.

Si le port 8000 ou 5173 est déjà pris, une instance tourne déjà. Il faut
l'arrêter avant d'en relancer une.

---

## 4. Laravel Boost (optionnel)

Pour ceux qui codent avec un assistant IA (Claude Code, Cursor, Copilot,
PhpStorm...). Laravel Boost donne à l'assistant la documentation correspondant
aux versions du projet, ainsi qu'un accès en lecture au schéma de la base.

Le paquet est déjà installé avec `composer install`. Il reste à le brancher sur
votre outil, une seule fois par machine :

```bash
php artisan boost:install
```

Choisir son outil quand la commande le demande. Le fichier `.mcp.json` généré
est propre à chaque machine et n'est pas versionné.

Quand le paquet `laravel/boost` est mis à jour, relancer
`php artisan boost:update` pour rafraîchir les consignes.

---

## 5. Au quotidien

### Après chaque `git pull`

```bash
composer install
npm install
```

Ces commandes installent exactement les versions enregistrées dans
`composer.lock` et `package-lock.json`. Il n'y a rien à faire sur la base, qui
est partagée.

### Modifier la base de données

- Toujours créer une nouvelle migration avec `php artisan make:migration`.
- Ne jamais modifier une migration déjà poussée. La base partagée l'a déjà
  appliquée, la modification ne serait donc jamais exécutée et le code ne
  correspondrait plus à la base.
- La personne qui écrit la migration la lance une fois avec
  `php artisan migrate`, puis prévient l'équipe, car la base change pour tout le
  monde au même moment.

### Ajouter une dépendance

En parler à l'équipe d'abord. Ensuite `composer require <paquet>` ou
`npm install <paquet>`, et committer ensemble le fichier de dépendances et son
fichier `.lock` (`composer.json` avec `composer.lock`, `package.json` avec
`package-lock.json`).

### Si une modification du `.env` n'est pas prise en compte

```bash
php artisan config:clear
```

### À ne jamais faire

| Commande ou action | Raison |
| --- | --- |
| `composer update`, `npm update` | Met à jour toutes les dépendances d'un coup et change les versions pour toute l'équipe. À faire seulement après accord, par une seule personne. |
| `php artisan migrate:fresh`, `migrate:reset`, `migrate:rollback`, `db:wipe` | Vide ou défait la base partagée pour tout le monde. |
| `php artisan db:seed` | Ajoute des données fictives dans la base de toute l'équipe. |
| Modifier les lignes `DB_*` de `phpunit.xml` | Les tests tournent sur une base SQLite en mémoire. Branchés sur Alwaysdata, ils videraient la base partagée à chaque lancement. |
| Mettre de vrais identifiants dans `.env.example` | Ce fichier est versionné et part sur GitHub. Les identifiants vont uniquement dans `.env`. |

---

## Documentation

- [`docs/CONTEXTE-PROJET.md`](docs/CONTEXTE-PROJET.md) : le métier de la
  cliente et les décisions prises
- [`docs/bdd/`](docs/bdd/) : le schéma de la base et ses choix de conception

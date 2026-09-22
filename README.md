# CRM Event

Application Laravel unique : **Laravel + Inertia.js + React**, une seule racine,
un seul `composer.json`, un seul `package.json`.

Deux espaces cohabitent dans la même application, derrière deux guards
d'authentification distincts :

| Espace | URL | Guard |
| --- | --- | --- |
| Back-office (coordinatrice) | `/gestion` | `manager` |
| Portail (les mariés) | `/` | `couple` |

Une session ouverte sur un espace ne donne aucun accès à l'autre.

---

## Versions

Versions réellement utilisées (relevées dans `composer.lock` et
`package-lock.json`) :

| Outil | Version |
| --- | --- |
| PHP | 8.3 (contrainte `^8.3`) |
| Laravel | 13.x |
| Inertia (Laravel) | 2.x |
| Inertia (React) | 2.x |
| React | 19 |
| Vite | 8 |
| Tailwind CSS | 4 |
| Node | ≥ 22.12 (exigé par Vite 8) |

---

## Linux

### Prérequis

```bash
sudo apt update
sudo apt install php8.3 php8.3-cli php8.3-mbstring php8.3-xml php8.3-curl php8.3-mysql composer unzip -y
```

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install nodejs -y
node -v
```

### Récupération du projet

```bash
git clone git@github.com:crm-event/crm-event-gestion.git
cd crm-event-gestion
composer install
npm install
cp .env.example .env
php artisan key:generate
```

Éditer `.env` : renseigner `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`,
`DB_PASSWORD`.

```bash
php artisan migrate
php artisan db:seed   # optionnel : un compte de démonstration par espace
```

---

## Windows

### Prérequis (installation manuelle)

- PHP 8.3 (Thread Safe) : https://windows.php.net/download/ → extraire dans `C:\php` → ajouter `C:\php` au PATH
- Composer : https://getcomposer.org/Composer-Setup.exe
- Node.js LTS (Vite 8 exige Node `>=22.12.0`) : https://nodejs.org
- Git : https://git-scm.com/download/win

Dans `C:\php\php.ini`, décommenter (enlever le `;`) :

```
extension=curl
extension=fileinfo
extension=mbstring
extension=openssl
extension=pdo_mysql
```

Vérification (PowerShell) :

```powershell
php -v
composer -V
node -v
npm -v
git --version
```

### Récupération du projet

```powershell
git clone git@github.com:crm-event/crm-event-gestion.git
cd crm-event-gestion
composer install
npm install
copy .env.example .env
php artisan key:generate
```

Éditer `.env` comme ci-dessus, puis :

```powershell
php artisan migrate
php artisan db:seed
```

---

## Lancer le projet

Deux terminaux, depuis la racine :

```
php artisan serve
```

```
npm run dev
```

Une seule adresse : **http://localhost:8000**

- `http://localhost:8000/` → portail des mariés
- `http://localhost:8000/gestion` → back-office

Les deux écrans de connexion sont `/login` et `/gestion/login`.

### Comptes de démonstration (après `php artisan db:seed`)

| Espace | E-mail | Mot de passe |
| --- | --- | --- |
| Back-office | `manager@crm-event.test` | `password` |
| Portail | `couple@crm-event.test` | `password` |

---

## Tests et style

```bash
php artisan test        # suite PHPUnit (SQLite en mémoire)
vendor/bin/pint         # formatage PHP
vendor/bin/pint --test  # vérification sans modification
```

Le build front doit exister avant de lancer les tests qui rendent une page
Inertia :

```bash
npm run build
```

---

## Organisation du code

```
app/Http/Controllers/Gestion/   back-office (guard "manager")
app/Http/Controllers/Portail/   portail      (guard "couple")
app/Models/                     User, Manager, Couple, Wedding, …
resources/js/Pages/Gestion/     pages Inertia du back-office
resources/js/Pages/Portail/     pages Inertia du portail
routes/web.php                  toutes les routes
database/migrations/            schéma métier
```

### Modèle d'authentification

La table `user` porte les identifiants (`email`, `password_hash`). Les tables
`manager` et `couple` en sont des spécialisations qui partagent la même clé
primaire. Les modèles `Manager` et `Couple` lisent la table `user` mais sont
restreints à leur population par un global scope : c'est ce qui rend la
séparation entre les deux espaces structurelle plutôt qu'un simple rôle.

---

## Configuration IDE (optionnel)

- **Interpréteur PHP** : `Settings → PHP` → faire pointer l'interpréteur vers le PHP 8.3 installé (doit correspondre à la sortie de `php -v`).
- **Interpréteur Node.js** : `Settings → Languages & Frameworks → Node.js`.

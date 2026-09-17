# CRM Event - Installation

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

Éditer `.env` : décommenter et renseigner `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`.

```bash
php artisan migrate
```

### Lancer le projet

```bash
composer run dev
```

Cette commande lance en même temps le serveur Laravel, Vite, la queue et les logs.

Sinon, dans deux terminaux séparés :

```bash
npm run dev
php artisan serve
```

---

## Windows

### Prérequis (installation manuelle)

- PHP 8.3 (Thread Safe) : https://windows.php.net/download/ → extraire dans `C:\php` → ajouter `C:\php` au PATH (variables d'environnement système)
- Composer : https://getcomposer.org/Composer-Setup.exe
- Node.js LTS (Vite 8 exige Node `^20.19.0` ou `>=22.12.0`) : https://nodejs.org
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

Éditer `.env` : décommenter et renseigner `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`.

```powershell
php artisan migrate
```

### Lancer le projet

```powershell
composer run dev
```

Cette commande lance en même temps le serveur Laravel, Vite, la queue et les logs.

Sinon, dans deux terminaux séparés :

```powershell
npm run dev
php artisan serve
```

---

## Configuration IDE (optionnel)

- **Interpréteur PHP** : `Settings → PHP` → faire pointer l'interpréteur vers le PHP 8.3 installé lors des prérequis (doit correspondre à la sortie de `php -v`).
- **Interpréteur Node.js** : `Settings → Languages & Frameworks → Node.js` si vous préférez lancer `npm run dev` depuis l'IDE plutôt que le terminal.
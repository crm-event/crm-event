# La Dernière Touche — Installation

---

## Linux

### Prérequis

```bash
sudo apt update
sudo apt install php8.3 php8.3-cli php8.3-mbstring php8.3-xml php8.3-curl php8.3-mysql composer nodejs npm unzip -y
```

### Récupération du projet

```bash
git clone git@github.com:crm-event/crm-event-gestion.git
cd crm-event-gestion
composer install
npm install --legacy-peer-deps
cp .env.example .env
php artisan key:generate
```

Éditer `.env` : décommenter et renseigner `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`.

```bash
php artisan migrate
```

### Lancer le projet

```bash
npm run dev
php artisan serve
```

---

## Windows

### Prérequis (installation manuelle)

- PHP 8.3 (Thread Safe) : https://windows.php.net/download/ → extraire dans `C:\php` → ajouter `C:\php` au PATH (variables d'environnement système)
- Composer : https://getcomposer.org/Composer-Setup.exe
- Node.js LTS : https://nodejs.org
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
npm install --legacy-peer-deps
copy .env.example .env
php artisan key:generate
```

Éditer `.env` : décommenter et renseigner `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`.

```powershell
php artisan migrate
```

### Lancer le projet

```powershell
npm run dev
php artisan serve
```
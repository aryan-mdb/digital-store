# Hostinger deploy (payanfoods.com)

One domain serves both parts:

- `public_html/` — the React build (`frontend/dist`) plus `laravel.php` and `.htaccess` from this folder
- `/api/*` and `/media/*` — rewritten by `.htaccess` to `laravel.php`, which boots the Laravel app in `~/payan/repo/backend` (outside `public_html`)

## Updating the live site

1. Push to `main`.
2. API: `ssh -p 65002 u891562998@93.127.208.137 'bash ~/payan/repo/deploy/hostinger/server-deploy.sh'`
3. Frontend: build locally (the server has no Node) and upload `dist/`:

   ```bash
   cd frontend
   VITE_API_URL=https://payanfoods.com/api npm run build
   scp -P 65002 -r dist/* u891562998@93.127.208.137:domains/payanfoods.com/public_html/
   ```

## Server notes

- Composer runs with `--no-scripts` because Hostinger disables `proc_open`; `php artisan package:discover` is run separately.
- The MySQL database is created in hPanel → Databases (shared hosting users cannot create databases over SSH).
- Backend settings live in `~/payan/repo/backend/.env` on the server (not in git).

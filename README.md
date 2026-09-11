# Ngu-h-e Clinic

Sistema de gestión para una clínica: pacientes, citas con disponibilidad por horario de médico, consultas clínicas, recetas con exportación a PDF, pagos, reportes financieros y adjuntos. Aplicación full-stack construida con **Laravel 12 + Inertia 2 + React 19**, con autenticación **Fortify** y control de acceso por roles con **Spatie Laravel Permission**.

## Stack

- Backend: **PHP 8.4 + Laravel 12**, Inertia (server-side routing), Fortify (auth + 2FA), Spatie Permission (RBAC), `barryvdh/laravel-dompdf` (recetas PDF), `intervention/image`.
- Frontend: **React 19 + TypeScript + Tailwind CSS 4**, componentes Radix/shadcn, `recharts` (reportes), `vite` + `@inertiajs/react`.
- Base de datos: **SQLite** por defecto (`DB_CONNECTION=sqlite` en `.env.example`; las migraciones usan FKs e índices pensados para MySQL/Postgres). Este entorno demo corre **PostgreSQL**.
- Tiempo real: **Laravel Reverb + Laravel Echo** (campana de notificaciones por WebSocket con fallback a props de Inertia). Requiere worker de colas (`database`) y servidor Reverb en ejecución.
- Tests: **Pest** (feature + unit) y CI en GitHub Actions (lint + matriz de tests).

## Roles y credenciales demo

El seeder crea un escenario de prueba (`php artisan migrate --seed`):

| Rol | Email | Contraseña | Acceso |
|-----|-------|-----------|--------|
| Admin | `admin@ngu.com` | `password` | Todo: pacientes, citas, consultas, pagos, reportes, gestión de staff |
| Doctor | `doctor@ngu.com` | `password` | Sus consultas/citas, agenda propia (`my-schedule`), crear consultas + recetas |
| Doctora | `dra.morales@ngu.com` | `password` | Lo mismo que doctor (segundo médico para agenda/disponibilidad) |
| Recepción | `recep@ngu.com` | `password` | Pacientes, citas, registro de pagos |
| Paciente | `maria.h@ngu.com` (también se auto-registra) | `password` | Portal propio: agendar citas, ver sus citas/recetas (descargar PDF), **Mi perfil** (datos básicos) |

Todos los roles ven la **campana de notificaciones** en la barra superior: cambios de estado de citas, recetas disponibles y pagos en tiempo real (WebSocket), más recordatorios programados (cita del día siguiente, completar perfil).

Cualquier usuario nuevo que se registra recibe automáticamente el rol `patient` y un expediente de paciente vinculado.

> Las contraseñas demo usan `password` porque `AppServiceProvider` solo aplica la política fuerte (`Password::defaults`) en producción.

## Instalación

```bash
git clone <repo>
cd Ngu-h-e

composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed       # crea tablas + roles + usuarios demo

npm install
npm run build

php artisan serve
```

Sistema: `http://localhost:8000`.

Para desarrollo con hot-reload, cola de trabajos y tiempo real:

```bash
npm run dev
php artisan queue:listen
php artisan reverb:start --host=127.0.0.1 --port=8080
```

Sin el worker no se entregan las notificaciones; sin Reverb la campana funciona degradada (datos al navegar, sin empuje en vivo). Los recordatorios programados requieren el scheduler:

```bash
php artisan schedule:work
```

Comandos disponibles: `app:notify-upcoming-appointments` (diario 18:00) y `app:notify-incomplete-profiles` (lunes 09:00).

## Estructura y decisiones de arquitectura

- **Capa de Acciones** (`app/Actions/`): la escritura de datos críticos va en clases `Action` (ej. `CreateConsultationAction`) envueltas en `DB::transaction`, manteniendo los controladores delgados. Cada consulta puede registrar, además, la receta y el pago en una sola transacción.
- **RBAC + scope por registro**: además de los grupos de rutas por rol (`role:admin|doctor|receptionist`…), las consultas acotan por el usuario: un doctor solo ve sus consultas/citas, el portal del paciente se filtra por `user_id` y las recetas validan propiedad en el controlador.
- **Control de permisos de la agenda**: la disponibilidad se calcula contra el `doctor_schedules` configurado y se re-verifica al guardar para evitar doble reserva.
- **Form Requests** para validación y **Policies** (a partir de la rama `refactor/policies-autorizacion`) para autorización a nivel de registro.
- **i18n**: claves en inglés vía `__()` resueltas con `lang/{locale}.json` (por defecto `es`); las fechas se formatean para el frontend en la zona de la app.

## Testing

```bash
php artisan test --compact      # suite completa
php artisan test --compact --filter=RoleAccess
npm run types                   # typecheck TypeScript
npm run lint                    # ESLint
vendor/bin/pint --dirty --format agent   # estilo PHP
```

Las pruebas de feature usan `RefreshDatabase` con SQLite en memoria (`:memory:`), por lo que cada archivo parte de una BD limpia y crea solo los roles/datos que necesita.

## Iconos / logo de la aplicación

El logo y los favicons se generan a partir de `public/logo.jpg` (1024×1024). El script `scripts/convert-logo.js` produce:

| Archivo | Uso |
|---------|-----|
| `public/favicon.ico` (16/32/48) | Icono de la pestaña del navegador |
| `public/apple-touch-icon.png` (180) | Icono iOS |
| `public/icon-192.png` / `public/icon-512.png` | Web app manifest (PWA) |
| `public/logo.png` (512) | Logo mostrado en sidebar, header y pantallas de login |

Referencias en la app:

- `resources/views/app.blade.php` → `<link rel="icon">`, `apple-touch-icon` y `site.webmanifest`.
- `resources/js/components/app-logo-icon.tsx` → renderiza `public/logo.png` como `<img>` dentro de una caja con color (se usa en `app-logo`, `app-header`, `auth-*`).

### Cómo reemplazar el logo de nuevo

1. Sustituye `public/logo.jpg` por tu nueva imagen (idealmente cuadrada, ≥ 1024×1024).
2. Regenera los assets (instala `sharp` temporalmente):

   ```bash
   npm install -D sharp
   node scripts/convert-logo.js
   npm uninstall sharp          # no deja la dependencia en el proyecto
   ```

3. Recompila el frontend: `npm run build`.

> `sharp` se instala solo de forma transitoria; no figura en `package.json` del proyecto.

## Demo en Laravel Cloud

1. Crear recurso **Postgres** y enlazarlo al environment (`DATABASE_URL`).
2. Crear cluster **WebSockets** (Reverb): *Resources → WebSockets → + New*, enlazarlo con *Add resource → WebSockets* y **redeploy**. Cloud inyecta las `REVERB_*` y `VITE_REVERB_*`. Tras el primer deploy, agregar el dominio de Cloud a los *allowed origins* del cluster (sin esto el socket falla en silencio).
3. Agregar **Managed queue** (los broadcasts usan la cola `database`).
4. Habilitar el **scheduler** en el environment (recordatorios).
5. Variables: `APP_KEY` (generar), `APP_URL` (dominio Cloud), `APP_ENV=production`, `APP_DEBUG=false`, `QUEUE_CONNECTION=database`, `BROADCAST_CONNECTION=reverb`.

> Nota demo: los adjuntos se guardan en disco local efímero y se pierden con cada redeploy. Para producción, migrar a object storage (`UploadAttachmentAction` + `AttachmentController@destroy`).

## Documentación de mejoras

Este repo se construyó por ramas de trabajo independientes a partir de una auditoría de calidad (seguridad, integridad de agenda, i18n y accesibilidad). Cada rama es mergeable por sí sola; el historial refleja esas unidades de cambio.

# Ngu-h-e Clinic

Sistema de gestión para una clínica: pacientes, citas con disponibilidad por horario de médico, consultas clínicas, recetas con exportación a PDF, pagos, reportes financieros y adjuntos. Aplicación full-stack construida con **Laravel 12 + Inertia 2 + React 19**, con autenticación **Fortify** y control de acceso por roles con **Spatie Laravel Permission**.

## Stack

- Backend: **PHP 8.4 + Laravel 12**, Inertia (server-side routing), Fortify (auth + 2FA), Spatie Permission (RBAC), `barryvdh/laravel-dompdf` (recetas PDF), `intervention/image`.
- Frontend: **React 19 + TypeScript + Tailwind CSS 4**, componentes Radix/shadcn, `recharts` (reportes), `vite` + `@inertiajs/react`.
- Base de datos: **SQLite** (fácil de localmente; las migraciones usan FKs e índices pensados para MySQL/Postgres).
- Tests: **Pest** (feature + unit) y CI en GitHub Actions (lint + matriz de tests).

## Roles y credenciales demo

El seeder crea un escenario de prueba (`php artisan migrate --seed`):

| Rol | Email | Contraseña | Acceso |
|-----|-------|-----------|--------|
| Admin | `admin@ngu.com` | `password` | Todo: pacientes, citas, consultas, pagos, reportes, gestión de staff |
| Doctor | `doctor@ngu.com` | `password` | Sus consultas/citas, agenda propia (`my-schedule`), crear consultas + recetas |
| Recepción | `recep@ngu.com` | `password` | Pacientes, citas, registro de pagos |
| Paciente | (se auto-registra) | — | Portal propio: agendar citas, ver sus citas/recetas (descargar PDF) |

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

Para desarrollo con hot-reload y cola de trabajos:

```bash
npm run dev
php artisan queue:listen
```

## Estructura y decisiones de arquitectura

- **Capa de Acciones** (`app/Actions/`): la escritura de datos críticos va en clases `Action` (ej. `CreateConsultationAction`) envueltas en `DB::transaction`, manteniendo los controladores delgados. Cada consulta puede registrar, además, la receta y el pago en una sola transacción.
- **RBAC + scope por registro**: además de los gruber de rutas por rol (`role:admin|doctor|receptionist`…), las consultas acotan por el usuario: un doctor solo ve sus consultas/citas, el portal del paciente se filtra por `user_id` y las recetas validan propiedad en el controlador.
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

## Documentación de mejoras

Este repo se construyó por ramas de trabajo independientes a partir de una auditoría de calidad (seguridad, integridad de agenda, i18n y accesibilidad). Cada rama es mergeable por sí sola; el historial refleja esas unidades de cambio.

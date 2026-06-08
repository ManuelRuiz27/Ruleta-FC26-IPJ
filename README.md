# Mundial FC 26 — Plataforma de Sorteo y Seguimiento

Para Vercel, este repo incluye `vercel.json` con la reescritura SPA.

## Variables para Vercel + Supabase

Configura estas variables en Vercel, dentro de Project Settings -> Environment Variables, para Production y Preview segun aplique:

```env
VITE_SUPABASE_URL=https://zfgmahstwayjrcurmsef.supabase.co
VITE_SUPABASE_ANON_KEY=
VITE_APP_ENV=production
VITE_APP_NAME="Mundial FC 26"
VITE_ENABLE_REALTIME=true
VITE_ENABLE_DEMO_MODE=false
```

En Supabase, `VITE_SUPABASE_URL` sale del Project URL del proyecto. La llave para `VITE_SUPABASE_ANON_KEY` debe ser una llave publica de cliente: preferentemente `sb_publishable_...`; en proyectos legacy tambien puede usarse la `anon public key`. Ambas se obtienen en Supabase Dashboard -> Project Settings -> API Keys o desde el dialogo Connect del proyecto.

No configures `service_role`, `sb_secret_...`, password de base de datos ni JWT secret en Vercel para este frontend.

## Estado actual de Supabase

El proyecto Supabase activo detectado es:

```txt
name: mundial-fc26
project ref: zfgmahstwayjrcurmsef
url: https://zfgmahstwayjrcurmsef.supabase.co
region: us-east-2
```

Actualmente la app inicializa el cliente Supabase si existen variables, pero la persistencia operativa sigue en Zustand + `localStorage`. Para operacion multi-dispositivo o realtime falta implementar la capa de lectura/escritura contra Supabase y aplicar migraciones SQL con RLS.
Plataforma oficial para la gestión operativa del sorteo y seguimiento del torneo "Mundial FC 26".

## Alcance MVP
Este repositorio contiene la Base Funcional (Primera Entrega) implementada en React + Vite + TypeScript, con estado manejado por Zustand y un UI shell basado en Tailwind CSS v4.

## Stack Técnico
- **Frontend:** React, Vite, TypeScript
- **Estilos:** Tailwind CSS v4
- **Estado Global:** Zustand
- **Rutas:** React Router DOM
- **Backend (Adaptador):** Supabase (PostgreSQL, Auth)

## Instalación y Ejecución Local

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Configurar variables de entorno:
   Copia el archivo `.env.example` a `.env` y configura tus credenciales de Supabase.
   ```bash
   cp .env.example .env
   ```
   > **Nota:** Para ejecutar la versión MVP en modo local/demo, no es estrictamente necesario tener conectada la base de datos, ya que el estado se maneja en memoria temporalmente mediante Zustand.

3. Correr el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Compilar para producción:
   ```bash
   npm run build
   ```

## Estructura de Directorios
- `src/components/`: Componentes UI reutilizables (Shell, Layout).
- `src/features/`: Módulos de la aplicación agrupados por funcionalidad (dashboard, setup, draw, bracket).
- `src/store/`: Manejador de estado global de Zustand.
- `src/types/`: Tipos de TypeScript estrictos basados en el modelo de datos documentado.
- `src/lib/`: Adaptadores, integraciones y utilidades (Ej: cliente de Supabase).
- `src/data/`: Datos iniciales (semillas temporales) para regiones, municipios y selecciones.

## Notas Importantes para Producción / Staging

⚠️ **Limitaciones Actuales de Almacenamiento (Local Storage)**
Actualmente la aplicación opera al 100% en el frontend utilizando Zustand con persistencia en `localStorage`. Por lo tanto:
- Los datos viven **exclusivamente en el navegador** de la computadora donde se ejecuta.
- Para operación multi-dispositivo en tiempo real se requiere implementar la conexión final con Supabase/backend.
- Para ambientes de **staging** o uso demostrativo, se recomienda usar **una sola laptop operadora** para centralizar todos los datos.
- Antes de cada evento o prueba mayor, se debe **exportar un respaldo manual** o respaldar el contenido de `localStorage`.

## Deployment (Despliegue Estático SPA)

El proyecto está preparado para ser desplegado como una Single Page Application (SPA) usando Vite en plataformas estáticas como:
- **Cloudflare Pages**
- **Netlify**
- **Vercel**

**Configuración de Build:**
- **Build command:** `npm run build`
- **Output directory:** `dist`

Asegúrate de configurar las reglas de reescritura de tu proveedor de hosting para redirigir todas las rutas a `index.html` y permitir que React Router maneje la navegación internamente.

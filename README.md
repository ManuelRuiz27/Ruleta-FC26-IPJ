# Mundial FC 26 — Plataforma de Sorteo y Seguimiento

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

## Despliegue
El proyecto está preparado para ser desplegado en Cloudflare Pages conectando este repositorio.
Comando de build: `npm run build`
Directorio de salida: `dist`

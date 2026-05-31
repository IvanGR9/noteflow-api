# NoteFlow API

API REST para NoteFlow, la app de notas de la Fase 7 de DAM. Construida con Next.js App Router y PostgreSQL en Neon.

- Backend desplegado en: (se añadirá tras el despliegue en Vercel)
- Repositorio app móvil: https://github.com/IvanGR9/noteflow

---

## Stack técnico

- Next.js 16 con App Router
- TypeScript
- PostgreSQL (Neon serverless)
- Zod para validación

---

## Setup local

### 1. Clonar el repositorio

```bash
git clone https://github.com/IvanGR9/noteflow-api.git
cd noteflow-api
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea el archivo `.env.local` con tu connection string de Neon:
DATABASE_URL=tu_connection_string_aqui

### 4. Ejecutar en local

```bash
npm run dev
```

La API estará disponible en `http://localhost:3000`.

---

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Connection string de PostgreSQL en Neon |

---

## Endpoints

### Notas

| Método | Ruta | Descripción | Body | Respuesta |
|--------|------|-------------|------|-----------|
| GET | `/api/notes` | Obtener todas las notas | — | 200 Array de notas |
| POST | `/api/notes` | Crear una nota | `{ title, type, content?, color? }` | 201 Nota creada |
| GET | `/api/notes/:id` | Obtener una nota por id | — | 200 Nota o 404 |
| PATCH | `/api/notes/:id` | Actualizar una nota | `{ title?, content?, color? }` | 200 Nota actualizada |
| DELETE | `/api/notes/:id` | Eliminar una nota | — | 204 Sin body |

### Checklist items

| Método | Ruta | Descripción | Body | Respuesta |
|--------|------|-------------|------|-----------|
| GET | `/api/notes/:id/checklist-items` | Obtener items de una nota | — | 200 Array de items |
| POST | `/api/notes/:id/checklist-items` | Crear un item | `{ text }` | 201 Item creado |
| PATCH | `/api/checklist-items/:itemId` | Actualizar un item | `{ text?, is_completed? }` | 200 Item actualizado |
| DELETE | `/api/checklist-items/:itemId` | Eliminar un item | — | 204 Sin body |

---

## Schema SQL

El schema completo está en `sql/schema.sql`. Tres tablas: `notes`, `checklist_items` y `note_tags`, con claves foráneas y `ON DELETE CASCADE`.

---

## Autor

**IvanGR9** — Proyecto Fase 7 · DAM
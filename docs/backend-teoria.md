# Backend — Teoría y arquitectura

## Patrón cliente-servidor

Una app móvil nunca debe conectarse directamente a la base de datos. Si el connection string de PostgreSQL estuviese en el código de la app, cualquiera que la descompile tendría acceso total a todos los datos.

El patrón cliente-servidor resuelve esto separando responsabilidades en tres capas: la app móvil es el cliente y solo sabe pedir datos, la API es el servidor y actúa como guardián que valida cada petición, y PostgreSQL es la base de datos que solo habla con la API, nunca con el exterior.

En NoteFlow esto significa que la app de React Native llama a `/api/notes`, la API valida la petición con Zod, ejecuta la query en Neon y devuelve solo lo necesario. La base de datos nunca queda expuesta.

## Qué es una API REST

REST es un estilo de arquitectura para construir APIs web. Una API REST expone recursos (en nuestro caso notas e items) a través de URLs, y usa los métodos HTTP para indicar qué operación se quiere hacer sobre ese recurso.

En NoteFlow usamos Next.js App Router para construir la API. Cada archivo `route.ts` dentro de `app/api/` define los handlers para una ruta concreta. Es la forma más moderna de hacer esto en el ecosistema de Next.js y no requiere configurar un servidor Express por separado.

## Métodos HTTP

Los métodos HTTP mapean directamente a operaciones sobre los datos:

- **GET** — leer datos. `GET /api/notes` devuelve todas las notas. `GET /api/notes/:id` devuelve una concreta.
- **POST** — crear datos. `POST /api/notes` crea una nota nueva con los datos del body.
- **PATCH** — modificar parcialmente. `PATCH /api/notes/:id` actualiza solo los campos enviados, sin tocar el resto.
- **DELETE** — eliminar. `DELETE /api/notes/:id` borra la nota y por CASCADE sus items y tags.

## Códigos de estado

Los códigos de estado le dicen al cliente qué ha pasado con su petición:

- **200 OK** — la petición fue bien y hay datos en la respuesta. Lo devuelve el GET.
- **201 Created** — se ha creado un recurso nuevo. Lo devuelve el POST al crear una nota o un item.
- **204 No Content** — la petición fue bien pero no hay nada que devolver. Lo devuelve el DELETE.
- **400 Bad Request** — los datos enviados no son válidos. Lo devuelve Zod cuando el body no pasa la validación.
- **404 Not Found** — el recurso no existe. Lo devuelve el GET o PATCH cuando no se encuentra la nota por su id.
- **500 Internal Server Error** — algo ha fallado en el servidor. Nunca devolvemos el error real de la base de datos al cliente.

## Bases de datos relacionales y ACID

Las bases de datos relacionales organizan los datos en tablas con filas y columnas. PostgreSQL es una de las más robustas y es la que usamos a través de Neon.

ACID son las cuatro propiedades que garantizan que las operaciones en la base de datos son fiables:

- **Atomicidad** — una operación o se completa entera o no se completa. Sin esto podrías crear una nota sin sus items asociados, dejando la base de datos en un estado inconsistente.
- **Consistencia** — los datos siempre cumplen las reglas definidas. En nuestro caso el campo `type` solo puede ser `note`, `checklist` o `idea`.
- **Aislamiento** — dos operaciones simultáneas no se interfieren entre sí.
- **Durabilidad** — una vez confirmada una operación, los datos persisten aunque el servidor se caiga.

## Primary Key y Foreign Key

La **Primary Key** es el identificador único e irrepetible de cada fila. En NoteFlow usamos UUID en lugar de enteros autoincrementales porque la app móvil puede generar el ID antes de conectarse a la red, lo que permite crear notas offline y sincronizarlas después.

La **Foreign Key** es una columna que referencia la primary key de otra tabla. En `checklist_items`, la columna `note_id` referencia `notes(id)`. El `ON DELETE CASCADE` significa que al borrar una nota, todos sus items y tags se borran automáticamente sin tener que hacer nada extra.

## DDL vs DML

**DDL** (Data Definition Language) define la estructura de la base de datos con `CREATE`, `ALTER` y `DROP`. En NoteFlow el archivo `sql/schema.sql` es puro DDL: crea las tres tablas con sus columnas, tipos y restricciones.

**DML** (Data Manipulation Language) manipula los datos con `SELECT`, `INSERT`, `UPDATE` y `DELETE`. Todo lo que hacen los handlers de la API es DML: consultar notas, insertar una nueva, actualizar un título, borrar un item.

## Diagrama entidad-relación

El esquema tiene tres tablas:

**notes** — tabla principal. Contiene `id` (UUID, PK), `title`, `content`, `type` (note/checklist/idea), `color`, `created_at` y `updated_at`.

**checklist_items** — items de una checklist. Contiene `id` (UUID, PK), `note_id` (FK → notes.id), `text` e `is_completed`. Un borrado en `notes` elimina en cascada todos sus items.

**note_tags** — etiquetas de una nota. Contiene `id` (UUID, PK), `note_id` (FK → notes.id) y `tag`. También con CASCADE.

Una nota puede tener cero o muchos checklist items. Una nota puede tener cero o muchos tags. Un item o tag siempre pertenece a exactamente una nota.

## INNER JOIN vs LEFT JOIN

El **INNER JOIN** devuelve solo las filas que tienen coincidencia en ambas tablas. Si una nota no tiene items, no aparecería en el resultado.

El **LEFT JOIN** devuelve todas las filas de la tabla izquierda y las coincidentes de la derecha. Si no hay coincidencia, devuelve NULL. En NoteFlow usamos LEFT JOIN para obtener notas con sus items porque una nota puede no tener ningún item todavía, y no queremos que desaparezca del resultado.

La query de `sql/queries.sql` usa LEFT JOIN precisamente por esto: queremos todas las notas, tengan items y tags o no.

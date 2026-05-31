# Seguridad en la API

## SQL Injection

La inyección SQL ocurre cuando la entrada del usuario se concatena directamente en una consulta. Un atacante puede manipular la consulta para acceder a datos que no debería ver o destruir la base de datos.

Un ejemplo vulnerable:

```sql
-- El atacante envía como título: '; DROP TABLE notes;--
SELECT * FROM notes WHERE title = '' + req.body.title + ''
```

La query resultante borraría toda la tabla `notes`.

## Consultas parametrizadas

Las consultas parametrizadas resuelven esto enviando la estructura de la consulta y los valores por separado. La base de datos precompila el SQL y trata los parámetros estrictamente como datos, nunca como código.

En NoteFlow usamos tagged templates de `@neondatabase/serverless`:

```typescript
// Seguro: el valor de ${id} nunca se interpreta como SQL
const [note] = await sql`SELECT * FROM notes WHERE id = ${id}`;
```

Aunque el usuario enviase `'; DROP TABLE notes;--` como id, la base de datos lo trataría como un string literal y no encontraría ninguna nota, sin ejecutar nada malicioso.

## Variables de entorno

Las variables de entorno son la forma estándar de guardar configuración sensible fuera del código. El connection string de PostgreSQL contiene el usuario, la contraseña y la dirección del servidor, por lo que nunca debe aparecer en el código ni en el repositorio.

En NoteFlow el connection string vive en `.env.local`, que está incluido en `.gitignore` y nunca se sube a GitHub. El archivo `.env.example` actúa como plantilla con las claves vacías para que cualquiera que clone el repositorio sepa qué variables necesita configurar.

En producción, las variables de entorno se configuran directamente en el panel de Vercel, sin tocar ningún archivo.
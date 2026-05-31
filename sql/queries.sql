-- Obtiene todas las notas con sus checklist items y tags agregados como JSON
SELECT
  -- Columnas base de la nota
  n.id,
  n.title,
  n.content,
  n.type,
  n.color,
  n.created_at,
  n.updated_at,

  -- Agrega todos los checklist items de la nota en un array JSON.
  -- FILTER (WHERE ci.id IS NOT NULL) evita incluir un elemento JSON nulo
  -- cuando la nota no tiene items (resultado del LEFT JOIN sin coincidencias).
  json_agg(
    json_build_object(
      'id', ci.id,
      'text', ci.text,
      'is_completed', ci.is_completed
    )
  ) FILTER (WHERE ci.id IS NOT NULL) AS checklist_items,

  -- Agrega todos los tags de la nota en un array JSON.
  -- FILTER (WHERE nt.id IS NOT NULL) por la misma razón: evita el nulo
  -- cuando la nota no tiene tags asociados.
  json_agg(
    json_build_object(
      'id', nt.id,
      'tag', nt.tag
    )
  ) FILTER (WHERE nt.id IS NOT NULL) AS tags

-- Tabla principal: cada fila es una nota
FROM notes n

-- LEFT JOIN para incluir notas aunque no tengan checklist items
LEFT JOIN checklist_items ci ON ci.note_id = n.id

-- LEFT JOIN para incluir notas aunque no tengan tags
LEFT JOIN note_tags nt ON nt.note_id = n.id

-- GROUP BY necesario porque usamos json_agg (función de agregación).
-- Agrupa todas las filas de la misma nota en una sola fila de resultado.
GROUP BY n.id, n.title, n.content, n.type, n.color, n.created_at, n.updated_at

-- Ordena el resultado de más reciente a más antiguo
ORDER BY n.created_at DESC;

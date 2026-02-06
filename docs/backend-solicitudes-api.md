# API Backend: Solicitudes de cambios en documentos

El frontend (Easy Request) envía las solicitudes al backend con la siguiente especificación.

## Base URL

- **Desarrollo:** `http://localhost:4000`
- El frontend usa Axios con `baseURL: 'http://localhost:4000'` y cabecera `Content-Type: application/json`.

---

## Endpoint: Crear solicitud

### Petición

- **Método:** `POST`
- **Ruta:** `/solicitudes`  
  (Si tu API usa prefijo, por ejemplo `/api/solicitudes`, el frontend debe usar esa ruta; avisa para ajustar.)
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**

```json
{
  "tipoAccion": "creacion",
  "tipoDocumento": "formulario",
  "otroEspecifique": null,
  "documentos": [
    {
      "codigo": "DOC-001",
      "tituloDocumento": "Título del documento",
      "descripcionCambio": "Descripción del cambio a realizar",
      "justificacion": "Justificación del cambio"
    }
  ]
}
```

### Campos del body

| Campo            | Tipo   | Obligatorio | Descripción |
|-----------------|--------|-------------|-------------|
| `tipoAccion`    | string | Sí          | Uno de: `"creacion"`, `"revision_actualizacion"`, `"eliminacion"` |
| `tipoDocumento` | string | Sí          | Uno de: `"formulario"`, `"procedimiento"`, `"instruccion_trabajo"`, `"otro"` |
| `otroEspecifique` | string \| null | Solo si `tipoDocumento === "otro"` | Texto libre cuando el tipo es "otro" (máx. 100 caracteres en frontend) |
| `documentos`    | array  | Sí          | Al menos un documento. Cada elemento: ver abajo. |

**Cada elemento de `documentos`:**

| Campo              | Tipo   | Obligatorio | Límites (frontend) |
|--------------------|--------|-------------|--------------------|
| `codigo`           | string | Sí          | 1–50 caracteres    |
| `tituloDocumento`  | string | Sí          | 1–200 caracteres   |
| `descripcionCambio`| string | Sí          | 1–2000 caracteres |
| `justificacion`    | string | Sí          | 1–2000 caracteres |

---

### Respuesta esperada (éxito)

- **Código:** `200 OK` o `201 Created`
- **Body:** Cualquier JSON (opcional). El frontend solo comprueba que la petición no falle (2xx).

Ejemplo:

```json
{
  "id": "uuid-o-id-generado",
  "mensaje": "Solicitud creada correctamente"
}
```

---

### Respuesta en caso de error

- **Código:** `4xx` o `5xx`
- **Body recomendado** (para mostrar mensaje al usuario):

```json
{
  "message": "Texto del error para el usuario"
}
```

El frontend intenta mostrar `response.data.message`; si no existe, muestra un mensaje genérico.

---

## Resumen para el backend

1. **POST** `http://localhost:4000/solicitudes` (o la ruta que acordéis).
2. **Body:** JSON con `tipoAccion`, `tipoDocumento`, `otroEspecifique` (opcional), `documentos` (array de objetos con `codigo`, `tituloDocumento`, `descripcionCambio`, `justificacion`).
3. **Éxito:** Responder con `200` o `201`.
4. **Error:** Responder con `4xx`/`5xx` y, si es posible, `{ "message": "..." }`.

Si la ruta o el nombre de algún campo cambian en el backend, hay que actualizar en el frontend la llamada en `FormularioSolicitud.tsx` (por ejemplo la ruta `api.post("/solicitudes", data)`).

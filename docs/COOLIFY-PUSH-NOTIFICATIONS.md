# Coolify: notificaciones push (VAPID + Cron)

## 1. Obtener las keys y el secret

En tu máquina local (o en el servidor), desde la raíz del proyecto:

### VAPID keys (una sola vez)

```bash
node scripts/generate-vapid-keys.js
```

Salida ejemplo:

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa-Ib27-S...
VAPID_PRIVATE_KEY=UUxTtJ...
```

### CRON_SECRET (una sola vez)

Generar un string aleatorio y usarlo como “contraseña” para que solo el cron pueda llamar a las rutas:

```bash
openssl rand -base64 32
```

Ejemplo de salida: `K7x...` → ese valor es tu `CRON_SECRET`.

---

## 2. Variables de entorno en Coolify

1. Entrá al **proyecto** en Coolify y abrí el **servicio** (la app Next.js).
2. Andá a **Environment Variables** (o **Variables** / **Env**).
3. Agregá estas variables (reemplazando por los valores que generaste):

| Variable | Valor | Notas |
|----------|--------|--------|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | (salida de `generate-vapid-keys.js`) | Clave pública, puede ser visible en el cliente. |
| `VAPID_PRIVATE_KEY` | (salida de `generate-vapid-keys.js`) | Clave privada, **nunca** exponerla. |
| `CRON_SECRET` | (salida de `openssl rand -base64 32`) | Secret para autorizar las llamadas del cron. |

4. Guardá y **redeployá** la aplicación para que tome las nuevas variables.

---

## 3. Crontab en el servidor (Coolify)

El cron debe llamar a tu app con el header `Authorization: Bearer <CRON_SECRET>`.

Reemplazá:

- `https://mitdf.com.ar` → la URL base de tu app en producción (con https).
- `TU_CRON_SECRET` → el mismo valor que pusiste en `CRON_SECRET` en Coolify.

### Opción A: crontab del usuario (servidor donde corre Coolify)

```bash
crontab -e
```

Añadí estas líneas (horarios en hora del servidor; ajustá si no está en America/Argentina/Buenos_Aires):

```cron
# Farmacia de turno — una vez al día a las 8:00 (Argentina)
0 11 * * * curl -s -H "Authorization: Bearer TU_CRON_SECRET" "https://mitdf.com.ar/api/push/send-daily/farmacias" > /dev/null 2>&1

# Estado barcaza — una vez al día a las 15:00 (Argentina)
0 18 * * * curl -s -H "Authorization: Bearer TU_CRON_SECRET" "https://mitdf.com.ar/api/push/send-daily/barcaza" > /dev/null 2>&1
```

Si el servidor ya está en zona horaria Argentina (UTC-3), podés usar:

```cron
# Farmacia: 8:00 Argentina
0 8 * * * curl -s -H "Authorization: Bearer TU_CRON_SECRET" "https://mitdf.com.ar/api/push/send-daily/farmacias" > /dev/null 2>&1

# Barcaza: 15:00 Argentina
0 15 * * * curl -s -H "Authorization: Bearer TU_CRON_SECRET" "https://mitdf.com.ar/api/push/send-daily/barcaza" > /dev/null 2>&1
```

### Opción B: Coolify “Scheduled Task” (si lo soporta)

Si Coolify permite tareas programadas por URL:

- **URL 1:** `https://mitdf.com.ar/api/push/send-daily/farmacias`  
  **Header:** `Authorization: Bearer TU_CRON_SECRET`  
  **Schedule:** todos los días a las 8:00 (o 11:00 UTC).

- **URL 2:** `https://mitdf.com.ar/api/push/send-daily/barcaza`  
  **Header:** `Authorization: Bearer TU_CRON_SECRET`  
  **Schedule:** todos los días a las 15:00 (o 18:00 UTC).

---

## 4. Probar sin esperar al cron

Desde cualquier máquina (reemplazando dominio y secret):

```bash
# Farmacias
curl -v -H "Authorization: Bearer TU_CRON_SECRET" "https://mitdf.com.ar/api/push/send-daily/farmacias"

# Barcaza
curl -v -H "Authorization: Bearer TU_CRON_SECRET" "https://mitdf.com.ar/api/push/send-daily/barcaza"
```

Si todo está bien, la respuesta será JSON con `ok: true` y algo como `sent` / `failed`.

---

## Resumen

1. Ejecutar `node scripts/generate-vapid-keys.js` y `openssl rand -base64 32`.
2. En Coolify → Environment Variables: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `CRON_SECRET`.
3. Redeploy de la app.
4. En el servidor: `crontab -e` y añadir las dos líneas de `curl` con tu URL y tu `CRON_SECRET`.

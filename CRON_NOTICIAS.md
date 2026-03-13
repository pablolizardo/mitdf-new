## Cron de scraping de noticias

Este proyecto incluye un sistema de scraping de noticias modular bajo `src/app/api/noticias`.  
El endpoint principal para disparar el procesamiento es:

- **POST** `https://www.mitdf.com.ar/api/noticias`

Ese endpoint:
- Resuelve todas las fuentes habilitadas (`getEnabledSources()`).
- Ejecuta cada adapter de `sources/*`.
- Usa `NoticiasProcessor` para normalizar y grabar en la base.
- Devuelve un resumen con totales y tiempos de procesamiento.

El timeout interno se configuró en **30 segundos** (`TIMEOUT_MS = 30000` en `route.ts`), pensado para correr en servidor propio (Hetzner + Coolify).

---

## Opción A – Cron en el servidor (Hetzner)

Editar el crontab del host:

```bash
crontab -e
```

Agregar esta línea para ejecutar cada 15 minutos:

```bash
*/15 * * * * curl -fsS -X POST https://www.mitdf.com.ar/api/noticias >/dev/null 2>&1
```

Notas:
- `-fsS` hace que `curl` falle en errores HTTP y sea silencioso salvo errores.
- La salida estándar se descarta (`>/dev/null`), los errores quedan en `syslog`/`mail` según la config del sistema.

---

## Opción B – Cron dentro de Coolify (recomendado)

Si la app está desplegada en Coolify:

1. Abrir el **proyecto** en Coolify.
2. Entrar al **servicio** donde corre la app de Next (puerto 3000).
3. Ir a la sección **Cronjobs / Scheduled Tasks**.
4. Crear un nuevo cronjob:
   - **Cron expression**:  
     ```text
     */15 * * * *    # cada 15 minutos
     ```
   - **Command** (ejecutado dentro del contenedor de la app):

     ```bash
     apk add --no-cache curl >/dev/null 2>&1 || true
     curl -fsS -X POST http://127.0.0.1:3000/api/noticias || echo "fetch noticias failed"
     ```

   Explicación:
   - Se instala `curl` si la imagen no lo trae (`apk add ... || true`).
   - Se llama al endpoint interno `http://127.0.0.1:3000/api/noticias`, más rápido y robusto que pasar por el dominio público.
   - Si la llamada falla, se imprime `fetch noticias failed` para poder verlo en los logs del cronjob.

---

## Endpoints de soporte

Para monitorear el sistema desde consola o desde un panel externo:

- **Health check general**  
  ```bash
  curl https://www.mitdf.com.ar/api/noticias?action=health
  ```

- **Estadísticas del sistema**  
  ```bash
  curl https://www.mitdf.com.ar/api/noticias?action=stats
  ```

- **Listado de fuentes configuradas**  
  ```bash
  curl https://www.mitdf.com.ar/api/noticias?action=sources
  ```

- **Logs recientes del scraper**  
  ```bash
  curl "https://www.mitdf.com.ar/api/noticias?action=logs&limit=100"
  ```

Con esto queda documentado cómo disparar y programar el scraping periódico de noticias para `www.mitdf.com.ar`.


# 🎙 Speech Analytics Platform

Plataforma de análisis de llamadas con IA. Transcribe audios `.ogg`, genera 10 reportes y exporta a PDF.

**Stack:** React · Supabase · OpenAI Whisper + GPT-4o · Vercel

---

## 🚀 Guía de instalación paso a paso

### PASO 1 — Clonar y preparar el proyecto

```bash
# En tu terminal de Windows (cmd o PowerShell)
git clone https://github.com/TU_USUARIO/speech-analytics.git
cd speech-analytics
npm install
```

---

### PASO 2 — Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) → **New project**
2. Elige nombre, contraseña de BD y región (ej: `South America (São Paulo)`)
3. Espera ~2 minutos a que arranque
4. Ve a **Settings → API** y copia:
   - `Project URL` → `REACT_APP_SUPABASE_URL`
   - `anon public key` → `REACT_APP_SUPABASE_ANON_KEY`

---

### PASO 3 — Ejecutar el schema SQL

1. En Supabase → **SQL Editor → New query**
2. Pega todo el contenido de `supabase/migrations/001_initial_schema.sql`
3. Haz clic en **Run**

---

### PASO 4 — Configurar variables de entorno

```bash
# En la raíz del proyecto
cp .env.example .env.local
```

Edita `.env.local` con tus valores reales:
```
REACT_APP_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJ...
```

> ⚠️ `.env.local` está en `.gitignore`. NUNCA lo subas a GitHub.

---

### PASO 5 — Desplegar la Edge Function

Necesitas la CLI de Supabase:

```bash
# Instalar CLI
npm install -g supabase

# Login
supabase login

# Vincular con tu proyecto (el Project ID está en Settings → General)
supabase link --project-ref TU_PROJECT_ID

# Agregar el secreto de OpenAI
supabase secrets set OPENAI_API_KEY=sk-...

# Desplegar la función
supabase functions deploy process-audio
```

---

### PASO 6 — Probar en local

```bash
npm start
# Abre http://localhost:3000
```

---

### PASO 7 — Subir a GitHub

```bash
git add .
git commit -m "feat: speech analytics platform"
git push origin main
```

---

### PASO 8 — Deploy en Vercel (deploy automático)

1. Ve a [vercel.com](https://vercel.com) → **New Project**
2. Importa tu repositorio de GitHub
3. En **Environment Variables** agrega:
   ```
   REACT_APP_SUPABASE_URL = https://xxxxxxxxxxxx.supabase.co
   REACT_APP_SUPABASE_ANON_KEY = eyJ...
   ```
4. Haz clic en **Deploy**
5. ✅ Tu app queda en `https://speech-analytics-xxx.vercel.app`

Cada vez que hagas `git push`, Vercel redespliega automáticamente.

---

## 📁 Estructura del proyecto

```
speech-analytics/
├── src/
│   ├── App.js                    ← Entrada principal
│   ├── index.js
│   ├── lib/
│   │   └── supabase.js           ← Cliente y helpers de Supabase
│   ├── hooks/
│   │   └── useRecordings.js      ← Lógica de estado y uploads
│   └── components/
│       └── AuthScreen.js         ← Login / Registro
├── supabase/
│   ├── functions/
│   │   └── process-audio/
│   │       └── index.ts          ← Edge Function (Whisper + GPT)
│   └── migrations/
│       └── 001_initial_schema.sql ← Tablas, RLS, Storage
├── public/
│   └── index.html
├── .env.example                  ← Plantilla de variables de entorno
├── .gitignore
└── package.json
```

---

## 💡 Costos estimados

| Servicio | Plan gratuito | Costo aprox. en producción |
|----------|--------------|---------------------------|
| Supabase | 500MB BD, 1GB Storage | $25/mes (Pro) |
| Vercel | Ilimitado para proyectos personales | Gratis |
| OpenAI Whisper | — | ~$0.006/minuto de audio |
| OpenAI GPT-4o | — | ~$0.005 por llamada de análisis |

---

## 🔧 Troubleshooting

**Error: "Faltan variables de entorno"**
→ Asegúrate de que `.env.local` existe y tiene los valores correctos. Reinicia `npm start`.

**La Edge Function no procesa el audio**
→ Verifica que `OPENAI_API_KEY` esté configurado: `supabase secrets list`

**El bucket de Storage no existe**
→ El SQL crea el bucket automáticamente, pero si falla, créalo manualmente en Supabase → Storage → New bucket → nombre: `recordings`, private.

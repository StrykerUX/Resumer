# 🚀 Deployment Guide - CV Resumer Backend

## 📋 Pre-requisitos

✅ PostgreSQL y Redis configurados en Coolify  
✅ Variables de entorno preparadas  
✅ Código listo para deployment  

## 🔧 Configuración de Coolify

### 1. Crear Aplicación en Coolify

```bash
1. Dashboard de Coolify → Applications → + New Application
2. Configurar:
   - Name: cv-resumer-backend
   - Git Repository: tu-repo-url
   - Branch: main
   - Build Pack: Node.js
   - Port: 3001
```

### 2. Variables de Entorno en Coolify

En la sección **Environment Variables** de tu aplicación:

```env
# Database - URLs internas de Coolify
DATABASE_URL=postgres://postgres:i%21TEg3m0Sev6ojrLO1GXqpczmciosFgc0EolJGrdqOYC9QWmnHK7NdWOVz2Y51KZ@ikoso404ckgc4sg4wws4go40:5432/postgres?sslmode=require
REDIS_URL=rediss://redisktr:zfeH5Be8fpO5M69jO84eV9yYo4zfi6YFP8Fu5cOppDVb1xWAb4TYaPlmnm8yTJH7@wcgo8socg8s84kokg484g4c0:6380/0

# JWT & Auth - GENERAR VALORES SEGUROS
JWT_SECRET=tu-jwt-secret-super-seguro-32-chars-minimo
REFRESH_TOKEN_EXPIRES_IN=7d
JWT_EXPIRES_IN=15m

# API Keys - TUS CLAVES REALES
OPENAI_API_KEY=sk-tu-clave-openai
ANTHROPIC_API_KEY=tu-clave-anthropic

# Stripe - CLAVES DE PRODUCCIÓN
STRIPE_SECRET_KEY=sk_live_tu-clave-stripe
STRIPE_WEBHOOK_SECRET=whsec_tu-webhook-secret

# App Config
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://tu-frontend-domain.com

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=tu-session-secret-super-seguro
ENCRYPTION_KEY=tu-clave-encriptacion-64-hex-chars

# Rate Limiting (Producción)
UPLOAD_RATE_LIMIT=3
GENERATE_RATE_LIMIT=2
API_RATE_LIMIT=100

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
TEMP_DIR=./temp
ALLOWED_FILE_TYPES=pdf,docx

# Monitoring
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=false
```

### 3. Build Commands

En Coolify, configurar:

```bash
# Install Command
npm ci --production=false

# Build Command  
npm run build

# Start Command
npm run start

# Health Check
GET /health
```

### 4. Ejecutar Migraciones

Una vez deployado, ejecutar desde terminal de Coolify:

```bash
npx prisma db push
npx prisma generate
```

## 🔐 Seguridad en Producción

### Generar Claves Seguras

```bash
# JWT Secret (32+ caracteres)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Session Secret (64+ caracteres)  
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Encryption Key (32 bytes = 64 hex chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Configurar HTTPS

En Coolify:
1. Applications → tu-app → Configuration → Domains
2. Agregar tu dominio
3. Habilitar "Force HTTPS"
4. Let's Encrypt automático

## 🧪 Testing del Deployment

### 1. Health Check

```bash
curl https://tu-backend-domain.com/health
```

### 2. Database Connection

```bash
curl https://tu-backend-domain.com/api/status
```

### 3. Rate Limiting

```bash
# Probar límites de API
for i in {1..150}; do curl https://tu-backend-domain.com/api/test; done
```

## 📊 Monitoreo

### Logs en Coolify

```bash
# Ver logs en tiempo real
Coolify Dashboard → tu-app → Logs

# Logs específicos
- Application logs: stderr/stdout
- Build logs: deployment process
- Error logs: crashes y errores
```

### Métricas Importantes

```
✅ Response time < 2s
✅ Memory usage < 80%
✅ CPU usage < 70%
✅ Error rate < 1%
✅ Database connections < 80% del pool
```

## 🚨 Troubleshooting

### Error: Database Connection

```bash
# Verificar URLs de conexión
echo $DATABASE_URL
echo $REDIS_URL

# Verificar conectividad desde app
npx prisma db pull
```

### Error: High Memory Usage

```bash
# Verificar procesos
ps aux | grep node

# Restart app si es necesario
pm2 restart all
```

### Error: Rate Limit

```bash
# Verificar configuración
echo $API_RATE_LIMIT
echo $UPLOAD_RATE_LIMIT
```

## 📦 Comandos Útiles

```bash
# Desarrollo Local
npm run dev                    # Servidor local
npm run docker:dev            # Bases de datos locales
npm run db:push               # Migrar DB local

# Producción
npm run dev:prod              # Test con DBs de producción
npm run db:migrate:prod       # Migrar DB producción
npm run security:check        # Audit de seguridad

# Environment Switching
npm run env:switch:local      # Cambiar a local
npm run env:switch:prod       # Cambiar a producción
```

## 🎯 Checklist de Deployment

- [ ] Bases de datos PostgreSQL y Redis funcionando
- [ ] Variables de entorno configuradas en Coolify
- [ ] Claves de JWT, Session y Encryption generadas
- [ ] APIs Keys de OpenAI/Stripe configuradas
- [ ] CORS_ORIGIN apuntando al frontend
- [ ] HTTPS habilitado
- [ ] Migraciones ejecutadas exitosamente
- [ ] Health check responde
- [ ] Rate limiting funcionando
- [ ] Logs monitoreando errores

## 🔄 Flujo de Trabajo

### Desarrollo Local
```bash
1. npm run dev              # Desarrollo con DBs locales
2. Hacer cambios
3. npm run security:check   # Verificar seguridad
4. Commit & Push
```

### Testing en Producción
```bash
1. npm run dev:prod         # Test con DBs de Coolify  
2. Verificar funcionalidad
3. Deploy a Coolify
4. npx prisma db push       # Migrar si hay cambios de schema
```

---

**Importante**: 
- ⚠️ NUNCA commitear archivos `.env*` con credenciales reales
- 🔐 Usar HTTPS siempre en producción
- 📊 Monitorear logs y métricas constantemente
- 🔄 Tener plan de rollback preparado
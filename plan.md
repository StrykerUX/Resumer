# CV Resumer SaaS Platform - Plan de Desarrollo

## 📋 Resumen Ejecutivo

Transformar el generador de CV personal actual en una **plataforma SaaS completa** donde los usuarios puedan:
- Registrarse y gestionar cuentas
- Recargar créditos para usar la aplicación
- Subir su CV actual (Word/PDF)
- Pegar descripción de vacante de trabajo
- Elegir template de CV profesional
- Generar CV optimizado automáticamente usando IA
- Descargar PDF adaptado sin que sea obvio que fue hecho para esa vacante específica

**Objetivo:** Democratizar la optimización de CVs usando IA para mejorar la probabilidad de contacto laboral.

---

## 🔍 Estado Actual del Proyecto

### Arquitectura Existente
- **Frontend:** React 18.2.0 (Create React App)
- **Generación PDF:** jsPDF + html2canvas
- **Estructura:** Aplicación estática para un solo usuario (Abraham Almazán)
- **Features actuales:**
  - Template único hardcodeado
  - Datos estáticos en `cvData.js`
  - Generación PDF con capa invisible para ATS
  - Diseño responsive y ATS-optimizado

### Limitaciones Actuales
- ❌ Sin autenticación de usuarios
- ❌ Sin base de datos
- ❌ Sin sistema de pagos
- ❌ Sin integración con IA
- ❌ Sin parser de CVs subidos
- ❌ Un solo template disponible
- ❌ Datos hardcodeados

---

## 🛠 Stack Tecnológico Propuesto

### Frontend
- **React 18+** - Mantener base actual
- **React Router** - Navegación SPA
- **Material-UI / Chakra UI** - Component library
- **React Hook Form** - Gestión de formularios
- **React Query** - State management y cache
- **Stripe Elements** - Integración de pagos

### Backend
- **Node.js + Express** - API REST
- **TypeScript** - Tipado fuerte
- **JWT + bcrypt** - Autenticación y seguridad
- **Multer** - Upload de archivos
- **PDF-parse / Mammoth** - Parser Word/PDF
- **BullMQ** - Sistema de colas de tareas
- **pm2** - Process manager y monitoreo

### Base de Datos
- **PostgreSQL** - Base de datos principal (instalado directamente en Coolify)
- **Prisma ORM** - Object-Relational Mapping para TypeScript
- **Redis** - Colas de tareas y cache (instalado directamente en Coolify)
- **Estructura de datos:**
  ```sql
  -- Users Table
  CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    credits INTEGER DEFAULT 3,
    plan VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  -- CVs Table
  CREATE TABLE cvs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    original_filename VARCHAR(255),
    file_url TEXT,
    parsed_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
  );

  -- Templates Table
  CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    preview_image_url TEXT,
    structure JSONB NOT NULL,
    styles JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
  );

  -- Generations Table
  CREATE TABLE generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    cv_id UUID REFERENCES cvs(id) ON DELETE CASCADE,
    job_description TEXT,
    optimized_data JSONB,
    result_pdf_url TEXT,
    credits_used INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
  );

  -- Jobs Queue Table (para persistencia de colas)
  CREATE TABLE job_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(100) NOT NULL, -- 'parse_cv', 'generate_pdf', 'ai_optimization'
    data JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'waiting',
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP,
    failed_at TIMESTAMP,
    error_message TEXT
  );
  ```

### IA & Processing
- **OpenAI API** (GPT-4) - Análisis y adaptación de CV
- **Claude API** (Anthropic) - Backup IA
- **PDF-lib** - Generación avanzada de PDFs
- **Sharp** - Procesamiento de imágenes

### Infraestructura
- **VPS con Coolify** - Hosting completo (Frontend + Backend + Databases)
- **PostgreSQL** - Base de datos principal (desde catálogo de Coolify)
- **Redis** - Cache y sistema de colas (desde catálogo de Coolify)
- **pm2** - Process manager para Node.js
- **Stripe** - Procesamiento de pagos
- **Desarrollo Local:** PostgreSQL local + Redis local

---

## 📐 Arquitectura de la Aplicación

### Arquitectura General (VPS Optimizada)
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Node.js API    │    │   PostgreSQL    │
│                 │    │                 │    │   (Coolify)     │
│ • Landing Page  │◄──►│ • Auth Routes   │◄──►│ • Users         │
│ • Dashboard     │    │ • File Upload   │    │ • CVs           │
│ • CV Wizard     │    │ • Queue Manager │    │ • Templates     │
│ • Payment UI    │    │ • WebSocket     │    │ • Generations   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │     Redis       │              │
         └──────────────►│                 │◄─────────────┘
                        │ • Task Queues   │
                        │ • Cache         │
                        │ • Sessions      │
                        └─────────────────┘
                                 │
                        ┌─────────────────┐
                        │  Worker Process │
                        │                 │
                        │ • CV Parsing    │
                        │ • AI Processing │
                        │ • PDF Generation│
                        │ • File Cleanup  │
                        └─────────────────┘
                                 │
                        ┌─────────────────┐
                        │  External APIs  │
                        │                 │
                        │ • OpenAI/Claude │
                        │ • Stripe        │
                        │ • Supabase      │
                        └─────────────────┘
```

### Flujo de Procesamiento de Tareas
```
User Action → API Endpoint → Add to Queue → Worker Processing → Notify User

1. Usuario sube CV     → /api/cv/upload    → Queue: "parse_cv"     → Worker: Extract text    → WebSocket: "cv_parsed"
2. Usuario pega job    → /api/job/analyze  → Queue: "ai_analyze"   → Worker: AI processing   → WebSocket: "job_analyzed"
3. Usuario genera CV   → /api/cv/generate  → Queue: "generate_pdf" → Worker: PDF creation    → WebSocket: "pdf_ready"
```

---

## ⚙️ Sistema de Colas de Tareas (Crítico para VPS)

### ¿Por qué es Esencial?
Con recursos limitados (1 CPU, 1GB RAM), las operaciones intensivas como:
- **Parsing de archivos Word/PDF** (CPU intensivo)
- **Llamadas a IA** (latencia alta, memoria)
- **Generación de PDF** (CPU y memoria intensivo)

**No pueden ejecutarse sincrónicamente** o el servidor se bloqueará con múltiples usuarios.

### Arquitectura de Colas
```javascript
// Queue Types
const QUEUE_TYPES = {
  CV_PARSING: 'parse_cv',      // Prioridad: Alta
  AI_ANALYSIS: 'ai_analyze',   // Prioridad: Media
  PDF_GENERATION: 'generate_pdf', // Prioridad: Alta
  FILE_CLEANUP: 'cleanup_files'   // Prioridad: Baja
};

// Queue Configuration
const queueConfig = {
  defaultJobOptions: {
    removeOnComplete: 10,  // Mantener solo 10 jobs completados
    removeOnFail: 5,       // Mantener solo 5 jobs fallidos
    attempts: 3,           // Reintentar 3 veces si falla
    backoff: {
      type: 'exponential',
      delay: 2000,         // Esperar 2s, 4s, 8s entre reintentos
    },
  },
  settings: {
    stalledInterval: 30 * 1000,    // 30s
    maxStalledCount: 1,            // Solo 1 job bloqueado permitido
  }
};
```

### Worker Process Optimizado
```javascript
// worker.js - Proceso separado para tareas pesadas
const Queue = require('bullmq').Queue;
const Worker = require('bullmq').Worker;

// Configuración de workers con concurrencia limitada
const workers = {
  cvParser: new Worker('parse_cv', processCVParsing, {
    concurrency: 1,        // Solo 1 CV a la vez (CPU limitado)
    limiter: {
      max: 5,              // Máximo 5 jobs por minuto
      duration: 60000,
    }
  }),
  
  aiAnalyzer: new Worker('ai_analyze', processAIAnalysis, {
    concurrency: 1,        // Solo 1 llamada IA a la vez
    limiter: {
      max: 10,             // Máximo 10 llamadas IA por minuto
      duration: 60000,
    }
  }),
  
  pdfGenerator: new Worker('generate_pdf', processPDFGeneration, {
    concurrency: 1,        // Solo 1 PDF a la vez (memoria intensivo)
    limiter: {
      max: 8,              // Máximo 8 PDFs por minuto
      duration: 60000,
    }
  })
};
```

### Estado de Jobs en Tiempo Real
```javascript
// Real-time job status updates
const io = require('socket.io')(server);

// Notify user when job starts
worker.on('active', (job) => {
  io.to(job.data.userId).emit('job_started', {
    jobId: job.id,
    type: job.name,
    message: 'Procesando tu solicitud...'
  });
});

// Notify user when job completes
worker.on('completed', (job, result) => {
  io.to(job.data.userId).emit('job_completed', {
    jobId: job.id,
    type: job.name,
    result: result,
    message: '¡Listo! Tu archivo está disponible.'
  });
});

// Notify user if job fails
worker.on('failed', (job, error) => {
  io.to(job.data.userId).emit('job_failed', {
    jobId: job.id,
    type: job.name,
    error: error.message,
    message: 'Hubo un error. Reintentando automáticamente...'
  });
});
```

### Monitoreo de Recursos
```javascript
// Resource monitoring per job
const os = require('os');

function monitorResources() {
  const memUsage = process.memoryUsage();
  const cpuUsage = os.loadavg()[0]; // 1-minute load average
  
  console.log(`Memory: ${Math.round(memUsage.rss / 1024 / 1024)}MB`);
  console.log(`CPU Load: ${cpuUsage.toFixed(2)}`);
  
  // Alert if resources are high
  if (memUsage.rss > 800 * 1024 * 1024) { // 800MB
    console.warn('⚠️ HIGH MEMORY USAGE');
  }
  
  if (cpuUsage > 0.8) { // 80% CPU
    console.warn('⚠️ HIGH CPU USAGE');
  }
}

setInterval(monitorResources, 10000); // Check every 10 seconds
```

---

## 🚀 Plan de Implementación

### Fase 1: Backend Foundation (Semana 1-2)
**Objetivo:** Crear la infraestructura base del servidor

#### 1.1 Setup Inicial (VPS Optimizado)
- [ ] Inicializar proyecto Node.js + TypeScript
- [ ] Configurar Express server con middlewares básicos
- [ ] Setup PostgreSQL local + Supabase connection
- [ ] Configurar Redis local para desarrollo
- [ ] Setup BullMQ para sistema de colas
- [ ] Configurar variables de entorno
- [ ] Configurar pm2 para development

#### 1.2 Autenticación & Usuarios
- [ ] Crear tablas PostgreSQL (users, sessions)
- [ ] Implementar registro/login con JWT
- [ ] Middleware de autenticación
- [ ] Validaciones con Joi/Yup
- [ ] Pool de conexiones optimizado (5-10 conexiones)

#### 1.3 Database Schema & Optimizaciones VPS
```javascript
// Users Collection
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  credits: Number (default: 3),
  plan: String (free/premium),
  created_at: Date,
  updated_at: Date
}

// CVs Collection
{
  _id: ObjectId,
  user_id: ObjectId,
  original_filename: String,
  file_url: String,
  parsed_data: Object,
  created_at: Date
}

// Templates Collection
{
  _id: ObjectId,
  name: String,
  description: String,
  preview_image: String,
  structure: Object,
  styles: Object,
  is_active: Boolean
}

// Generations Collection
{
  _id: ObjectId,
  user_id: ObjectId,
  cv_id: ObjectId,
  job_description: String,
  optimized_data: Object,
  result_pdf_url: String,
  credits_used: Number,
  created_at: Date
}
```

### Fase 2: File Processing & IA (Semana 2-3)
**Objetivo:** Implementar el core de procesamiento de CVs

#### 2.1 Upload & Parsing
- [ ] Configurar Multer para uploads
- [ ] Parser para archivos PDF (pdf-parse)
- [ ] Parser para archivos Word (mammoth)
- [ ] Extractor de datos estructurados del CV

#### 2.2 IA Integration
- [ ] Setup OpenAI API client
- [ ] Prompt engineering para análisis de CV
- [ ] Prompt engineering para análisis de vacante
- [ ] Sistema de adaptación inteligente de CV
- [ ] Rate limiting y error handling

#### 2.3 Ejemplo de Prompts
```javascript
const CV_ANALYSIS_PROMPT = `
Analiza este CV y extrae:
1. Información personal (nombre, contacto, ubicación)
2. Resumen profesional
3. Experiencia laboral (empresa, puesto, fechas, logros)
4. Habilidades técnicas
5. Educación y certificaciones
6. Proyectos destacados

CV: {cv_text}
`;

const JOB_ADAPTATION_PROMPT = `
Adapta este CV para la siguiente vacante sin que sea obvio:
1. Ajusta el resumen profesional
2. Reorganiza habilidades relevantes
3. Resalta experiencia pertinente
4. Mantén autenticidad

CV Original: {cv_data}
Vacante: {job_description}
`;
```

### Fase 3: Sistema de Pagos (Semana 3-4)
**Objetivo:** Implementar monetización con créditos

#### 3.1 Stripe Integration
- [ ] Setup Stripe account y webhooks
- [ ] Crear productos y precios en Stripe
- [ ] Implementar checkout sessions
- [ ] Manejar webhooks de pagos exitosos

#### 3.2 Sistema de Créditos
- [ ] Lógica de deducción de créditos
- [ ] Paquetes de créditos disponibles
- [ ] Historial de transacciones
- [ ] Notificaciones de créditos bajos

#### 3.3 Paquetes Propuestos
```javascript
const CREDIT_PACKAGES = [
  { name: "Starter", credits: 5, price: 9.99 },
  { name: "Professional", credits: 15, price: 24.99 },
  { name: "Enterprise", credits: 50, price: 79.99 }
];
```

### Fase 4: Frontend UX/UI (Semana 4-6)
**Objetivo:** Crear interfaz de usuario completa

#### 4.1 Landing Page
- [ ] Hero section con value proposition
- [ ] Features y beneficios
- [ ] Pricing table
- [ ] Testimonials/Social proof
- [ ] Call-to-action para registro

#### 4.2 Dashboard de Usuario
- [ ] Overview de créditos y uso
- [ ] Historial de CVs generados
- [ ] Gestión de archivos subidos
- [ ] Configuración de cuenta

#### 4.3 CV Generation Wizard
```javascript
// Flujo paso a paso
const WIZARD_STEPS = [
  { id: 1, title: "Datos Personales", component: "PersonalInfoForm" },
  { id: 2, title: "Subir CV", component: "CVUploadForm" },
  { id: 3, title: "Descripción de Vacante", component: "JobDescriptionForm" },
  { id: 4, title: "Seleccionar Template", component: "TemplateSelector" },
  { id: 5, title: "Preview y Descarga", component: "PreviewAndDownload" }
];
```

#### 4.4 Template System
- [ ] Gallery de templates disponibles
- [ ] Preview en tiempo real
- [ ] Customización básica (colores, fuentes)
- [ ] Responsive design para todos los templates

### Fase 5: Templates Engine (Semana 6-7)
**Objetivo:** Sistema dinámico de templates

#### 5.1 Template Structure
```javascript
// Template Schema
{
  id: "modern-minimal",
  name: "Modern Minimal",
  description: "Clean and professional design",
  structure: {
    header: ["name", "title", "contact"],
    sections: ["summary", "experience", "skills", "education"],
    layout: "single-column"
  },
  styles: {
    fonts: { primary: "Inter", secondary: "Inter" },
    colors: { primary: "#1a1a1a", secondary: "#4a4a4a" },
    spacing: { section: "24px", item: "16px" }
  }
}
```

#### 5.2 Dynamic PDF Generation
- [ ] Template renderer engine
- [ ] Adaptador de datos a structure
- [ ] Sistema de estilos dinámicos
- [ ] Optimización para ATS

### Fase 6: Testing & Deployment (Semana 7-8)
**Objetivo:** Preparar para producción

#### 6.1 Testing
- [ ] Unit tests para funciones críticas
- [ ] Integration tests para APIs
- [ ] E2E tests para flujo completo
- [ ] Load testing para escalabilidad

#### 6.2 Production Setup
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Environment configurations
- [ ] Database migrations
- [ ] Monitoring y logging
- [ ] Error tracking (Sentry)

#### 6.3 Security
- [ ] Rate limiting
- [ ] Input validation
- [ ] File upload security
- [ ] CORS configuration
- [ ] Security headers

---

## 🔧 Optimizaciones Específicas para VPS (1 CPU, 1GB RAM)

### Gestión de Memoria
```javascript
// memory-management.js
const memwatch = require('@airbnb/node-memwatch');

// Monitor memory leaks
memwatch.on('leak', (info) => {
  console.error('⚠️ Memory leak detected:', info);
  // Alert to monitoring system
});

// Force garbage collection when memory is high
function forceGCIfNeeded() {
  const memUsage = process.memoryUsage();
  if (memUsage.rss > 800 * 1024 * 1024) { // 800MB threshold
    if (global.gc) {
      global.gc();
      console.log('🗑️ Forced garbage collection');
    }
  }
}

setInterval(forceGCIfNeeded, 30000); // Check every 30 seconds
```

### Configuración de Pool de Conexiones
```javascript
// database-config.js
const poolConfig = {
  // PostgreSQL connection pool
  max: 8,           // Máximo 8 conexiones (limitado por RAM)
  min: 2,           // Mínimo 2 conexiones siempre activas
  idle: 10000,      // Cerrar conexiones inactivas después de 10s
  acquire: 60000,   // Timeout para obtener conexión: 60s
  evict: 30000,     // Revisar conexiones inactivas cada 30s
};

// Redis connection pool
const redisConfig = {
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: null,
  keepAlive: 30000,
  family: 4,
  // Limitar memoria de Redis
  maxmemory: '200mb',
  'maxmemory-policy': 'allkeys-lru'
};
```

### Límites de Rate Limiting
```javascript
// rate-limiting.js - Protección contra abuse
const rateLimit = require('express-rate-limit');

const limiters = {
  // Upload de archivos: muy restrictivo
  fileUpload: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 3,                   // Máximo 3 uploads por IP cada 15 min
    message: 'Demasiados archivos subidos. Intenta en 15 minutos.',
  }),
  
  // Generación de CV: moderado
  generateCV: rateLimit({
    windowMs: 5 * 60 * 1000,  // 5 minutos
    max: 2,                   // Máximo 2 generaciones por IP cada 5 min
    message: 'Límite alcanzado. Espera 5 minutos.',
  }),
  
  // API general: permisivo
  general: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100,                 // 100 requests por IP cada 15 min
  }),
};
```

### Cleanup Automático de Archivos
```javascript
// file-cleanup.js
const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');

// Limpiar archivos temporales cada hora
cron.schedule('0 * * * *', async () => {
  try {
    const tempDir = path.join(__dirname, 'temp');
    const files = await fs.readdir(tempDir);
    const now = Date.now();
    
    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const stats = await fs.stat(filePath);
      
      // Borrar archivos mayores a 1 hora
      if (now - stats.mtime.getTime() > 60 * 60 * 1000) {
        await fs.unlink(filePath);
        console.log(`🗑️ Deleted temp file: ${file}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning temp files:', error);
  }
});

// Limpiar archivos subidos mayores a 24 horas
cron.schedule('0 2 * * *', async () => { // 2 AM daily
  // Similar cleanup for uploaded files
});
```

### Configuración pm2 para VPS
```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'cv-resumer-api',
      script: './dist/server.js',
      instances: 1,                    // Solo 1 instancia (CPU limitado)
      exec_mode: 'fork',              // Fork mode (no cluster)
      max_memory_restart: '700MB',    // Restart si usa más de 700MB
      node_args: '--max-old-space-size=768', // Límite heap de Node.js
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      // Monitoreo y restart automático
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },
    {
      name: 'cv-resumer-worker',
      script: './dist/worker.js',
      instances: 1,                    // Solo 1 worker
      exec_mode: 'fork',
      max_memory_restart: '300MB',    // Worker usa menos memoria
      node_args: '--max-old-space-size=256',
      env: {
        NODE_ENV: 'production',
        WORKER_TYPE: 'queue_processor',
      },
    }
  ]
};
```

### Monitoreo de Recursos en Tiempo Real
```javascript
// resource-monitor.js
const os = require('os');
const fs = require('fs');

class ResourceMonitor {
  constructor() {
    this.alerts = {
      memory: false,
      cpu: false,
      disk: false
    };
  }

  async monitor() {
    const memUsage = process.memoryUsage();
    const cpuUsage = os.loadavg()[0];
    const diskUsage = await this.getDiskUsage();

    // Memory monitoring (alert at 80% = 800MB)
    if (memUsage.rss > 800 * 1024 * 1024 && !this.alerts.memory) {
      console.error('🚨 HIGH MEMORY USAGE:', Math.round(memUsage.rss / 1024 / 1024) + 'MB');
      this.alerts.memory = true;
      // Send alert to monitoring service
    } else if (memUsage.rss < 600 * 1024 * 1024) {
      this.alerts.memory = false;
    }

    // CPU monitoring (alert at 80%)
    if (cpuUsage > 0.8 && !this.alerts.cpu) {
      console.error('🚨 HIGH CPU USAGE:', (cpuUsage * 100).toFixed(2) + '%');
      this.alerts.cpu = true;
    } else if (cpuUsage < 0.6) {
      this.alerts.cpu = false;
    }

    // Log current status
    console.log(`📊 Resources - Memory: ${Math.round(memUsage.rss / 1024 / 1024)}MB, CPU: ${(cpuUsage * 100).toFixed(1)}%`);
  }

  async getDiskUsage() {
    try {
      const stats = await fs.promises.stat('/');
      return stats;
    } catch (error) {
      return null;
    }
  }

  start() {
    setInterval(() => this.monitor(), 10000); // Every 10 seconds
  }
}

module.exports = ResourceMonitor;
```

---

## 💰 Modelo de Negocio

### Sistema de Créditos
- **Registro gratuito:** 3 créditos iniciales
- **1 crédito = 1 CV generado**
- **Paquetes de recarga:**
  - Starter: 5 créditos por $9.99
  - Professional: 15 créditos por $24.99 (16% descuento)
  - Enterprise: 50 créditos por $79.99 (20% descuento)

### Features Premium (Futuro)
- **Templates exclusivos**
- **Análisis avanzado de compatibilidad**
- **Cover letter generator**
- **LinkedIn optimization**
- **Interview prep suggestions**

---

## 📈 Métricas y KPIs

### Métricas de Producto
- **Conversion rate:** Visitantes → Registros
- **Activation rate:** Registros → Primer CV generado
- **Retention rate:** Usuarios que regresan en 30 días
- **Credits per user:** Promedio de créditos consumidos

### Métricas de Negocio
- **MRR (Monthly Recurring Revenue)**
- **LTV (Customer Lifetime Value)**
- **CAC (Customer Acquisition Cost)**
- **Churn rate:** Usuarios que no regresan

---

## 🔮 Roadmap Futuro

### Versión 2.0
- [ ] Cover letter generator
- [ ] LinkedIn profile optimization
- [ ] ATS score analyzer
- [ ] Interview preparation AI
- [ ] Salary negotiation tips

### Versión 3.0
- [ ] Mobile app (React Native)
- [ ] API para desarrolladores
- [ ] White-label solutions
- [ ] Enterprise dashboard
- [ ] Advanced analytics

---

## 🚨 Riesgos y Mitigaciones

### Riesgos Técnicos
- **IA costs:** Optimizar prompts y caching
- **File processing errors:** Robust error handling
- **Scalability:** Horizontal scaling desde el inicio

### Riesgos de Negocio
- **Competencia:** Diferenciación en calidad de IA
- **Adoption:** Marketing content y SEO
- **Churn:** Onboarding optimization

### Riesgos VPS Específicos
- **Recursos limitados:** Implementar colas y monitoreo desde el inicio
- **Saturación del servidor:** Rate limiting agresivo
- **Downtime:** pm2 con auto-restart y health checks
- **Almacenamiento:** Cleanup automático de archivos temporales

---

## 📊 Monitoreo Intensivo (Crítico para VPS)

### Stack de Monitoreo
```javascript
// package.json dependencies para monitoreo
{
  "dependencies": {
    "@sentry/node": "^7.0.0",           // Error tracking
    "@airbnb/node-memwatch": "^2.0.0",  // Memory leak detection
    "pm2": "^5.0.0",                    // Process management
    "express-rate-limit": "^6.0.0",     // Rate limiting
    "helmet": "^6.0.0",                 // Security headers
    "compression": "^1.7.4",            // Response compression
    "morgan": "^1.10.0",                // HTTP request logging
    "winston": "^3.8.0",                // Advanced logging
    "node-cron": "^3.0.2",             // Scheduled tasks
    "systeminformation": "^5.0.0"       // System metrics
  }
}
```

### Sentry Integration para Errores
```javascript
// sentry-config.js
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  // Configuración específica para VPS
  beforeSend(event) {
    // Filtrar errores de memoria si son frecuentes
    if (event.exception?.values?.[0]?.type === 'OutOfMemoryError') {
      console.error('🚨 OUT OF MEMORY ERROR');
      // Trigger restart signal
      process.emit('SIGTERM');
    }
    return event;
  },
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
  ],
  tracesSampleRate: 0.1, // Reducir para ahorrar recursos
});

module.exports = Sentry;
```

### Sistema de Logging Avanzado
```javascript
// logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'cv-resumer' },
  transports: [
    // Logs de errores
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Logs generales
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 3,
    }),
    
    // Console en desarrollo
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ],
});

// Custom log levels para VPS
logger.add(new winston.transports.File({
  filename: 'logs/resource-usage.log',
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      if (meta.type === 'resource_usage') {
        return `${timestamp} [${level.toUpperCase()}]: ${message} | Memory: ${meta.memory}MB | CPU: ${meta.cpu}%`;
      }
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  )
}));

module.exports = logger;
```

### Health Checks Automatizados
```javascript
// health-check.js
const express = require('express');
const si = require('systeminformation');

const healthRouter = express.Router();

healthRouter.get('/health', async (req, res) => {
  try {
    const [memory, cpu, disk] = await Promise.all([
      si.mem(),
      si.currentLoad(),
      si.fsSize()
    ]);

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(memory.used / 1024 / 1024),
        total: Math.round(memory.total / 1024 / 1024),
        percentage: Math.round((memory.used / memory.total) * 100)
      },
      cpu: {
        usage: Math.round(cpu.currentLoad),
        loadAvg: cpu.avgLoad
      },
      disk: disk[0] ? {
        used: Math.round(disk[0].used / 1024 / 1024 / 1024),
        size: Math.round(disk[0].size / 1024 / 1024 / 1024),
        percentage: Math.round(disk[0].use)
      } : null
    };

    // Determinar estado de salud
    if (health.memory.percentage > 85 || health.cpu.usage > 90) {
      health.status = 'critical';
      res.status(503);
    } else if (health.memory.percentage > 75 || health.cpu.usage > 80) {
      health.status = 'warning';
    }

    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = healthRouter;
```

### Alertas Automáticas
```javascript
// alerts.js
const nodemailer = require('nodemailer');

class AlertSystem {
  constructor() {
    this.lastAlert = {};
    this.cooldown = 5 * 60 * 1000; // 5 minutos entre alertas del mismo tipo
  }

  async sendAlert(type, message, data = {}) {
    const now = Date.now();
    
    // Evitar spam de alertas
    if (this.lastAlert[type] && now - this.lastAlert[type] < this.cooldown) {
      return;
    }

    console.error(`🚨 ALERT [${type}]: ${message}`, data);
    
    // Log to file
    require('./logger').error(`ALERT [${type}]: ${message}`, data);
    
    // Send to monitoring service (si está configurado)
    if (process.env.WEBHOOK_URL) {
      try {
        await fetch(process.env.WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚨 CV Resumer Alert: ${message}`,
            type,
            data,
            timestamp: new Date().toISOString()
          })
        });
      } catch (error) {
        console.error('Failed to send webhook alert:', error);
      }
    }

    this.lastAlert[type] = now;
  }

  // Alertas específicas
  highMemoryUsage(memoryMB) {
    this.sendAlert('HIGH_MEMORY', `Memory usage at ${memoryMB}MB`, { memory: memoryMB });
  }

  highCPUUsage(cpuPercent) {
    this.sendAlert('HIGH_CPU', `CPU usage at ${cpuPercent}%`, { cpu: cpuPercent });
  }

  queueBacklog(queueName, jobCount) {
    this.sendAlert('QUEUE_BACKLOG', `Queue ${queueName} has ${jobCount} pending jobs`, { 
      queue: queueName, 
      jobs: jobCount 
    });
  }

  processRestart(reason) {
    this.sendAlert('PROCESS_RESTART', `Process restarted: ${reason}`, { reason });
  }
}

module.exports = new AlertSystem();
```

---

## 💡 Innovaciones Clave

1. **IA Invisible:** Adaptación sin que sea obvia
2. **ATS Hybrid:** Imagen + texto invisible perfecto
3. **Template Engine:** Sistema dinámico y escalable
4. **Credit System:** Monetización flexible
5. **Upload Intelligence:** Parser avanzado de CVs
6. **VPS Optimization:** Arquitectura optimizada para recursos limitados
7. **Queue System:** Procesamiento asíncrono sin bloqueos
8. **Real-time Monitoring:** Monitoreo intensivo de recursos

---

## ✅ Success Criteria

**MVP (8 semanas):**
- [ ] 1000+ usuarios registrados
- [ ] 500+ CVs generados
- [ ] $1000+ MRR
- [ ] 4.5+ stars user rating

**Scale (6 meses):**
- [ ] 10,000+ usuarios activos
- [ ] $10,000+ MRR
- [ ] 5+ templates disponibles
- [ ] Expansion a otros mercados

---

## 📦 Stack Tecnológico Completo Actualizado

### Dependencies Principales
```json
{
  "name": "cv-resumer-saas",
  "version": "1.0.0",
  "dependencies": {
    // Frontend
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "react-hook-form": "^7.43.0",
    "react-query": "^3.39.0",
    "@chakra-ui/react": "^2.5.0",
    "socket.io-client": "^4.6.0",
    
    // Backend Core
    "express": "^4.18.0",
    "typescript": "^4.9.0",
    "cors": "^2.8.5",
    "helmet": "^6.0.0",
    "compression": "^1.7.4",
    
    // Database & ORM
    "pg": "^8.9.0",
    "@supabase/supabase-js": "^2.8.0",
    "prisma": "^4.10.0",
    "@prisma/client": "^4.10.0",
    
    // Queue System
    "bullmq": "^3.6.0",
    "redis": "^4.5.0",
    "ioredis": "^5.3.0",
    
    // File Processing
    "multer": "^1.4.5",
    "pdf-parse": "^1.1.1",
    "mammoth": "^1.5.1",
    "sharp": "^0.32.0",
    "jspdf": "^2.5.1",
    "html2canvas": "^1.4.1",
    
    // AI Integration
    "openai": "^3.2.1",
    "anthropic": "^0.15.0",
    
    // Authentication & Security
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "express-rate-limit": "^6.7.0",
    "express-validator": "^6.15.0",
    
    // Payments
    "stripe": "^11.16.0",
    
    // Monitoring & Logging
    "@sentry/node": "^7.37.0",
    "winston": "^3.8.2",
    "morgan": "^1.10.0",
    "@airbnb/node-memwatch": "^2.0.0",
    "systeminformation": "^5.17.0",
    
    // Utils
    "dotenv": "^16.0.3",
    "node-cron": "^3.0.2",
    "socket.io": "^4.6.0",
    "nodemailer": "^6.9.0"
  },
  "devDependencies": {
    "@types/node": "^18.14.0",
    "@types/express": "^4.17.17",
    "@types/multer": "^1.4.7",
    "@types/bcryptjs": "^2.4.2",
    "@types/jsonwebtoken": "^9.0.1",
    "nodemon": "^2.0.20",
    "ts-node": "^10.9.0",
    "jest": "^29.4.0",
    "supertest": "^6.3.0"
  },
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "worker": "node dist/worker.js",
    "test": "jest",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "pm2:start": "pm2 start ecosystem.config.js",
    "pm2:stop": "pm2 stop ecosystem.config.js",
    "pm2:restart": "pm2 restart ecosystem.config.js",
    "pm2:monitor": "pm2 monit"
  }
}
```

### Comandos de Setup Local
```bash
# 1. Clonar proyecto y dependencias
npm install

# 2. Setup PostgreSQL local
brew install postgresql  # macOS
sudo apt install postgresql postgresql-contrib  # Ubuntu

# 3. Setup Redis local
brew install redis  # macOS
sudo apt install redis-server  # Ubuntu

# 4. Setup base de datos (Desarrollo local)
npm run db:migrate
npm run db:generate

# 5. Variables de entorno
cp .env.example .env
# Configurar DATABASE_URL, REDIS_URL, etc.

# 7. Ejecutar en desarrollo
npm run dev          # API server
npm run worker       # Worker process
npm start           # Frontend (React)
```

---

---

## 🔧 Configuración de Bases de Datos en Coolify

### Step-by-Step: PostgreSQL Setup

**1. Acceder al Dashboard de Coolify**
```
- Ve a tu panel de Coolify (ej: https://coolify.tu-dominio.com)
- Inicia sesión con tu cuenta
```

**2. Crear Base de Datos PostgreSQL**
```
1. Click en "Resources" en el menú lateral
2. Click en "+ New Resource"
3. Seleccionar "Database" → "PostgreSQL"
4. Configurar:
   - Name: cv-resumer-postgres
   - Version: 15 (recomendado)
   - Database Name: cv_resumer_db
   - Username: postgres
   - Password: [genera password seguro]
   - Port: 5432 (default)
5. Click "Deploy"
6. Esperar a que el status sea "Running"
```

**3. Obtener Credenciales de PostgreSQL**
```
1. Click en tu base de datos PostgreSQL creada
2. Ve a la pestaña "Configuration"
3. Copiar valores:
   - Host: [internal-hostname] (ej: cv-resumer-postgres)
   - Port: 5432
   - Database: cv_resumer_db
   - Username: postgres
   - Password: [tu-password]
```

**4. Crear tu DATABASE_URL**
```
DATABASE_URL="postgresql://postgres:[password]@[hostname]:5432/cv_resumer_db"

# Ejemplo:
DATABASE_URL="postgresql://postgres:mi-password-seguro@cv-resumer-postgres:5432/cv_resumer_db"
```

### Step-by-Step: Redis Setup

**1. Crear Base de Datos Redis**
```
1. En "Resources" → "+ New Resource"
2. Seleccionar "Database" → "Redis"
3. Configurar:
   - Name: cv-resumer-redis
   - Version: 7 (recomendado)
   - Password: [genera password seguro] (opcional pero recomendado)
   - Port: 6379 (default)
4. Click "Deploy"
5. Esperar a que el status sea "Running"
```

**2. Obtener Credenciales de Redis**
```
1. Click en tu Redis creado
2. Ve a la pestaña "Configuration"
3. Copiar valores:
   - Host: [internal-hostname] (ej: cv-resumer-redis)
   - Port: 6379
   - Password: [tu-password] (si configuraste uno)
```

**3. Crear tu REDIS_URL**
```
# Sin password:
REDIS_URL="redis://cv-resumer-redis:6379"

# Con password:
REDIS_URL="redis://:mi-password-redis@cv-resumer-redis:6379"
```

### Configuración Final del Backend

**1. Archivo .env del Backend**
```env
# PostgreSQL (Coolify)
DATABASE_URL="postgresql://postgres:tu-password@cv-resumer-postgres:5432/cv_resumer_db"

# Redis (Coolify)
REDIS_URL="redis://:tu-password-redis@cv-resumer-redis:6379"

# Resto de configuración...
JWT_SECRET="tu-jwt-secret-muy-seguro"
OPENAI_API_KEY="tu-openai-key"
PORT=3001
NODE_ENV="production"
```

**2. Verificar Conexión**
```bash
# En tu aplicación backend, test de conexión:
npm run db:test-connection
```

### Troubleshooting Común

**Error: "Connection refused"**
```
- Verificar que las bases estén en status "Running"
- Usar hostnames internos (no localhost)
- Verificar que las apps estén en la misma red de Coolify
```

**Error: "Authentication failed"**
```
- Verificar username/password correctos
- Revisar que DATABASE_URL tenga formato correcto
- Verificar que no haya caracteres especiales sin escapar en password
```

**Optimización para VPS**
```
- PostgreSQL: max_connections = 20 (para conservar memoria)
- Redis: maxmemory = 100mb (ajustar según RAM disponible)
- Configurar logs rotativos para evitar llenar disco
```

---

*Última actualización: 2025-01-27*
*Versión: 3.0 - Coolify Native*
*Estado: Plan actualizado con PostgreSQL + Redis directo en Coolify*
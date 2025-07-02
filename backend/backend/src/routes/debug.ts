import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import bcrypt from 'bcryptjs';

const router = Router();
const prisma = new PrismaClient();

// Middleware de seguridad - solo en development o con key especial
const debugAuth = (req: Request, res: Response, next: any) => {
  const debugKey = req.headers['x-debug-key'] || req.query.key;
  const expectedKey = process.env.DEBUG_KEY || 'debug-resumer-2024';
  
  if (debugKey !== expectedKey) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  next();
};

// Aplicar middleware a todas las rutas
router.use(debugAuth);

// 🏥 PÁGINA PRINCIPAL DE DEBUG
router.get('/', async (req: Request, res: Response) => {
  try {
    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🔧 Debug Panel - CV Resumer</title>
        <style>
            body { 
                font-family: 'Segoe UI', system-ui, sans-serif; 
                margin: 0; 
                padding: 20px; 
                background: #0f172a; 
                color: #e2e8f0; 
                line-height: 1.6;
            }
            .container { max-width: 1200px; margin: 0 auto; }
            .header { 
                text-align: center; 
                margin-bottom: 40px; 
                padding: 20px; 
                background: #1e293b; 
                border-radius: 10px;
                border: 1px solid #334155;
            }
            .grid { 
                display: grid; 
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
                gap: 20px; 
                margin-bottom: 30px;
            }
            .card { 
                background: #1e293b; 
                padding: 20px; 
                border-radius: 10px; 
                border: 1px solid #334155;
                box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            }
            .card h3 { 
                margin-top: 0; 
                color: #60a5fa; 
                border-bottom: 2px solid #334155; 
                padding-bottom: 10px;
            }
            .status { 
                padding: 5px 10px; 
                border-radius: 20px; 
                font-size: 12px; 
                font-weight: bold;
                display: inline-block;
                margin: 5px 5px 5px 0;
            }
            .success { background: #10b981; color: white; }
            .error { background: #ef4444; color: white; }
            .warning { background: #f59e0b; color: white; }
            .info { background: #3b82f6; color: white; }
            .button { 
                background: #3b82f6; 
                color: white; 
                padding: 10px 20px; 
                border: none; 
                border-radius: 5px; 
                cursor: pointer; 
                text-decoration: none;
                display: inline-block;
                margin: 5px;
                transition: background 0.2s;
            }
            .button:hover { background: #2563eb; }
            .log { 
                background: #111827; 
                padding: 15px; 
                border-radius: 5px; 
                font-family: 'Courier New', monospace; 
                font-size: 12px;
                border: 1px solid #374151;
                margin: 10px 0;
                max-height: 200px;
                overflow-y: auto;
            }
            .key-value { margin: 8px 0; }
            .key { color: #fbbf24; font-weight: bold; }
            .value { color: #34d399; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔧 CV Resumer - Debug Panel</h1>
                <p>Panel de diagnóstico para verificar el estado del sistema</p>
                <span class="status info">Environment: ${process.env.NODE_ENV || 'development'}</span>
                <span class="status info">Timestamp: ${new Date().toISOString()}</span>
            </div>

            <div class="grid">
                <div class="card">
                    <h3>🌐 Acciones Rápidas</h3>
                    <a href="/api/debug/database" class="button">🗄️ Test Database</a>
                    <a href="/api/debug/redis" class="button">🔴 Test Redis</a>
                    <a href="/api/debug/auth" class="button">🔐 Test Auth</a>
                    <a href="/api/debug/env" class="button">⚙️ Environment</a>
                    <a href="/api/debug/logs" class="button">📊 Recent Logs</a>
                    <a href="/api/debug/performance" class="button">⚡ Performance</a>
                </div>

                <div class="card">
                    <h3>📊 Estado del Sistema</h3>
                    <div class="key-value">
                        <span class="key">Uptime:</span> 
                        <span class="value">${Math.round(process.uptime())} segundos</span>
                    </div>
                    <div class="key-value">
                        <span class="key">Memory:</span> 
                        <span class="value">${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB</span>
                    </div>
                    <div class="key-value">
                        <span class="key">Node Version:</span> 
                        <span class="value">${process.version}</span>
                    </div>
                    <div class="key-value">
                        <span class="key">Platform:</span> 
                        <span class="value">${process.platform}</span>
                    </div>
                </div>

                <div class="card">
                    <h3>🔧 Tools</h3>
                    <a href="/api/debug/create-user" class="button">👤 Crear Usuario Test</a>
                    <a href="/api/debug/clear-cache" class="button">🧹 Limpiar Cache</a>
                    <a href="/api/debug/simulate-load" class="button">⚡ Simular Carga</a>
                    <a href="/api/debug/export-data" class="button">💾 Exportar Datos</a>
                </div>
            </div>

            <div class="card">
                <h3>📝 Instrucciones</h3>
                <p><strong>Para acceder a este panel:</strong></p>
                <p>• URL: <code>https://tu-dominio.com/api/debug?key=debug-resumer-2024</code></p>
                <p>• Header: <code>X-Debug-Key: debug-resumer-2024</code></p>
                <p><strong>URLs de prueba:</strong></p>
                <div class="log">
GET /api/debug/database - Prueba conexión y queries de base de datos
GET /api/debug/redis - Prueba conexión y operaciones Redis  
GET /api/debug/auth - Prueba flujo completo de autenticación
GET /api/debug/env - Muestra variables de entorno (censuradas)
POST /api/debug/create-user - Crea usuario de prueba rápido
                </div>
            </div>
        </div>

        <script>
            // Auto-refresh cada 30 segundos
            setTimeout(() => window.location.reload(), 30000);
        </script>
    </body>
    </html>
    `;
    
    res.send(html);
  } catch (error) {
    res.status(500).json({ error: 'Error generating debug page', details: error });
  }
});

// 🗄️ TEST DATABASE
router.get('/database', async (req: Request, res: Response) => {
  try {
    const results: any = {
      connection: false,
      query: false,
      tables: [],
      counts: {},
      sample_data: {},
      error: null
    };

    // Test 1: Conexión básica
    try {
      await prisma.$connect();
      results.connection = true;
    } catch (error: any) {
      results.error = `Connection failed: ${error.message}`;
      return res.json(results);
    }

    // Test 2: Query básico
    try {
      await prisma.$queryRaw`SELECT 1 as test`;
      results.query = true;
    } catch (error: any) {
      results.error = `Query failed: ${error.message}`;
    }

    // Test 3: Listar tablas
    try {
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      ` as any[];
      results.tables = tables.map(t => t.table_name);
    } catch (error: any) {
      results.error = `Tables query failed: ${error.message}`;
    }

    // Test 4: Contar registros
    try {
      if (results.tables.includes('User')) {
        results.counts.users = await prisma.user.count();
        results.sample_data.users = await prisma.user.findMany({ 
          take: 3, 
          select: { id: true, email: true, name: true, plan: true, createdAt: true }
        });
      }
      
      if (results.tables.includes('Template')) {
        results.counts.templates = await prisma.template.count();
        results.sample_data.templates = await prisma.template.findMany({ 
          take: 3, 
          select: { id: true, name: true, description: true }
        });
      }

      if (results.tables.includes('security_logs')) {
        results.counts.security_logs = await prisma.securityLog.count();
        results.sample_data.recent_logs = await prisma.securityLog.findMany({ 
          take: 5, 
          orderBy: { createdAt: 'desc' },
          select: { event: true, email: true, ip: true, severity: true, createdAt: true }
        });
      }
    } catch (error: any) {
      results.error = `Count queries failed: ${error.message}`;
    }

    await prisma.$disconnect();
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: 'Database test failed', details: error.message });
  }
});

// 🔴 TEST REDIS
router.get('/redis', async (req: Request, res: Response) => {
  try {
    const results: any = {
      connection: false,
      ping: false,
      set_get: false,
      info: {},
      error: null
    };

    if (!process.env.REDIS_URL) {
      results.error = 'REDIS_URL not configured';
      return res.json(results);
    }

    const redis = new Redis(process.env.REDIS_URL);

    // Test 1: Conexión
    try {
      const pong = await redis.ping();
      results.connection = true;
      results.ping = pong === 'PONG';
    } catch (error: any) {
      results.error = `Redis ping failed: ${error.message}`;
      return res.json(results);
    }

    // Test 2: Set/Get
    try {
      const testKey = `debug-test-${Date.now()}`;
      await redis.set(testKey, 'test-value', 'EX', 60);
      const value = await redis.get(testKey);
      results.set_get = value === 'test-value';
      await redis.del(testKey);
    } catch (error: any) {
      results.error = `Redis set/get failed: ${error.message}`;
    }

    // Test 3: Info básica
    try {
      const info = await redis.info('server');
      const lines = info.split('\r\n');
      lines.forEach(line => {
        if (line.includes(':') && !line.startsWith('#')) {
          const [key, value] = line.split(':');
          results.info[key] = value;
        }
      });
    } catch (error: any) {
      results.error = `Redis info failed: ${error.message}`;
    }

    redis.disconnect();
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: 'Redis test failed', details: error.message });
  }
});

// 🔐 TEST AUTH
router.get('/auth', async (req: Request, res: Response) => {
  try {
    const results: any = {
      test_user_exists: false,
      password_hash_works: false,
      jwt_secret_configured: !!process.env.JWT_SECRET,
      registration_flow: false,
      login_flow: false,
      error: null
    };

    // Test 1: Verificar usuario de prueba
    try {
      const testUser = await prisma.user.findUnique({
        where: { email: 'test@staging.resumer.app' }
      });
      results.test_user_exists = !!testUser;
      
      if (testUser) {
        // Test 2: Verificar password hash
        const isValidPassword = await bcrypt.compare('TestPass123!', testUser.password);
        results.password_hash_works = isValidPassword;
      }
    } catch (error: any) {
      results.error = `User lookup failed: ${error.message}`;
    }

    // Test 3: Simular registro (sin guardar)
    try {
      const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
      results.registration_flow = hashedPassword.startsWith('$2a$');
    } catch (error: any) {
      results.error = `Password hashing failed: ${error.message}`;
    }

    // Test 4: JWT
    if (process.env.JWT_SECRET) {
      try {
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ userId: 'test', type: 'access' }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        results.login_flow = !!decoded;
      } catch (error: any) {
        results.error = `JWT test failed: ${error.message}`;
      }
    }

    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: 'Auth test failed', details: error.message });
  }
});

// ⚙️ ENVIRONMENT VARIABLES
router.get('/env', async (req: Request, res: Response) => {
  try {
    const env = {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      DATABASE_URL: process.env.DATABASE_URL ? 'SET (hidden)' : 'NOT SET',
      REDIS_URL: process.env.REDIS_URL ? 'SET (hidden)' : 'NOT SET',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET (hidden)' : 'NOT SET',
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ? 'SET (hidden)' : 'NOT SET',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'SET (hidden)' : 'NOT SET',
      CORS_ORIGIN: process.env.CORS_ORIGIN,
      // Sistema
      NODE_VERSION: process.version,
      PLATFORM: process.platform,
      UPTIME: `${Math.round(process.uptime())} seconds`,
      MEMORY_USAGE: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`
    };

    res.json(env);
  } catch (error: any) {
    res.status(500).json({ error: 'Environment check failed', details: error.message });
  }
});

// 👤 CREAR USUARIO DE PRUEBA
router.post('/create-user', async (req: Request, res: Response) => {
  try {
    const timestamp = Date.now();
    const testUser = {
      id: `debug-user-${timestamp}`,
      name: `Debug User ${timestamp}`,
      email: `debug${timestamp}@test.local`,
      password: await bcrypt.hash('Debug123!', 10),
      plan: 'free',
      credits: 5
    };

    const user = await prisma.user.create({
      data: testUser,
      select: { id: true, name: true, email: true, plan: true, credits: true, createdAt: true }
    });

    res.json({ 
      success: true, 
      message: 'Usuario de prueba creado',
      user,
      login_credentials: {
        email: testUser.email,
        password: 'Debug123!'
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create test user', details: error.message });
  }
});

export default router;
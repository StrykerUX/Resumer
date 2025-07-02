-- =====================================================
-- CV RESUMER - CONFIGURACIÓN COMPLETA DE BASE DE DATOS
-- Para ejecutar manualmente en Outerbase o PostgreSQL
-- =====================================================

-- 1. CREAR TABLA DE USUARIOS
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT UNIQUE NOT NULL,
    "password" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "credits" INTEGER NOT NULL DEFAULT 3,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. CREAR TABLA DE TEMPLATES
CREATE TABLE IF NOT EXISTS "Template" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "structure" JSONB NOT NULL,
    "styles" JSONB NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. CREAR TABLA DE LOGS DE SEGURIDAD
CREATE TABLE IF NOT EXISTS "security_logs" (
    "id" TEXT PRIMARY KEY,
    "event" TEXT NOT NULL,
    "user_id" TEXT,
    "email" TEXT,
    "ip" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "details" JSONB,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. CREAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_plan_idx" ON "User"("plan");
CREATE INDEX IF NOT EXISTS "security_logs_event_idx" ON "security_logs"("event");
CREATE INDEX IF NOT EXISTS "security_logs_user_id_idx" ON "security_logs"("user_id");
CREATE INDEX IF NOT EXISTS "security_logs_severity_idx" ON "security_logs"("severity");
CREATE INDEX IF NOT EXISTS "security_logs_created_at_idx" ON "security_logs"("created_at");

-- 5. INSERTAR TEMPLATES INICIALES
INSERT INTO "Template" ("id", "name", "description", "structure", "styles") VALUES 
(
    'template-modern-professional',
    'Modern Professional',
    'Clean and modern CV template perfect for tech professionals',
    '{"sections": ["header", "summary", "experience", "skills", "education"]}',
    '{"theme": "modern", "colors": {"primary": "#2563eb", "secondary": "#64748b"}}'
),
(
    'template-classic-executive',
    'Classic Executive', 
    'Traditional professional template for executive positions',
    '{"sections": ["header", "summary", "experience", "education", "skills"]}',
    '{"theme": "classic", "colors": {"primary": "#1f2937", "secondary": "#6b7280"}}'
),
(
    'template-creative-designer',
    'Creative Designer',
    'Modern and creative template for designers and creative professionals',
    '{"sections": ["header", "summary", "portfolio", "experience", "skills", "education"]}',
    '{"theme": "creative", "colors": {"primary": "#7c3aed", "secondary": "#a855f7"}}'
)
ON CONFLICT ("id") DO NOTHING;

-- 6. CREAR USUARIO DE PRUEBA (OPCIONAL - SOLO PARA TESTING)
INSERT INTO "User" ("id", "name", "email", "password", "plan", "credits") VALUES 
(
    'user-test-staging',
    'Usuario de Prueba',
    'test@staging.resumer.app',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: 'TestPass123!'
    'premium',
    10
)
ON CONFLICT ("email") DO NOTHING;

-- 7. INSERTAR LOG DE INICIALIZACIÓN
INSERT INTO "security_logs" ("id", "event", "email", "ip", "user_agent", "severity", "details") VALUES 
(
    'log-' || extract(epoch from now())::text,
    'DATABASE_INITIALIZED',
    'system@resumer.app',
    '127.0.0.1',
    'Manual Setup via Outerbase',
    'low',
    '{"message": "Base de datos inicializada manualmente", "timestamp": "' || now()::text || '"}'
);

-- 8. VERIFICAR INSTALACIÓN
SELECT 
    'VERIFICACIÓN DE INSTALACIÓN' as status,
    (SELECT COUNT(*) FROM "User") as usuarios,
    (SELECT COUNT(*) FROM "Template") as templates,
    (SELECT COUNT(*) FROM "security_logs") as logs_seguridad;

-- 9. MOSTRAR TEMPLATES DISPONIBLES
SELECT "id", "name", "description" FROM "Template" ORDER BY "name";

-- =====================================================
-- COMANDOS DE VERIFICACIÓN ADICIONALES
-- =====================================================

-- Ver todas las tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Ver estructura de tabla User
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'User' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar que el usuario de prueba se puede usar para login
SELECT "id", "name", "email", "plan", "credits", "created_at"
FROM "User" 
WHERE "email" = 'test@staging.resumer.app';

-- =====================================================
-- NOTAS IMPORTANTES:
-- =====================================================
-- 1. El password del usuario de prueba es: TestPass123!
-- 2. Ejecuta este script completo en Outerbase
-- 3. Si hay errores, ejecuta tabla por tabla
-- 4. Verifica que todas las tablas se crearon correctamente
-- 5. El usuario de prueba tiene plan premium con 10 créditos
-- =====================================================
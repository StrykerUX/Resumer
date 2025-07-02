#!/usr/bin/env node

/**
 * Script de prueba para verificar conexiones en staging
 * Ejecutar: node scripts/test-staging.js
 */

const { PrismaClient } = require('@prisma/client');
const Redis = require('ioredis');
const axios = require('axios');

// Configuración desde variables de entorno
const config = {
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  stagingUrl: process.env.CORS_ORIGIN || 'https://staging.resumer.novalabss.app',
  jwtSecret: process.env.JWT_SECRET,
  openaiKey: process.env.OPENAI_API_KEY
};

console.log('🧪 INICIANDO PRUEBAS DE STAGING');
console.log('================================');
console.log(`🌐 URL de staging: ${config.stagingUrl}`);
console.log(`🗄️ Base de datos configurada: ${!!config.databaseUrl}`);
console.log(`🔴 Redis configurado: ${!!config.redisUrl}`);
console.log(`🔑 JWT Secret configurado: ${!!config.jwtSecret}`);
console.log(`🤖 OpenAI Key configurado: ${!!config.openaiKey}`);
console.log('');

let allTestsPassed = true;

// 1. PRUEBA DE BASE DE DATOS
async function testDatabase() {
  console.log('1️⃣ PROBANDO CONEXIÓN A BASE DE DATOS...');
  console.log('----------------------------------------');
  
  try {
    const prisma = new PrismaClient();
    
    // Conectar
    await prisma.$connect();
    console.log('✅ Conexión a PostgreSQL exitosa');
    
    // Probar query básico
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('✅ Query de prueba exitoso');
    console.log(`   📊 Versión PostgreSQL: ${Array.isArray(result) ? result[0].version : result.version}`);
    
    // Verificar tablas
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log(`✅ Tablas encontradas: ${tables.length}`);
    tables.forEach(table => console.log(`   📋 ${table.table_name}`));
    
    // Contar registros
    const userCount = await prisma.user.count();
    const templateCount = await prisma.template.count();
    console.log(`✅ Registros: ${userCount} usuarios, ${templateCount} templates`);
    
    await prisma.$disconnect();
    console.log('✅ Desconexión exitosa');
    
  } catch (error) {
    console.error('❌ Error en base de datos:', error.message);
    allTestsPassed = false;
  }
  console.log('');
}

// 2. PRUEBA DE REDIS
async function testRedis() {
  console.log('2️⃣ PROBANDO CONEXIÓN A REDIS...');
  console.log('-------------------------------');
  
  try {
    const redis = new Redis(config.redisUrl);
    
    // Probar conexión
    const pong = await redis.ping();
    console.log(`✅ Redis respondió: ${pong}`);
    
    // Probar set/get
    await redis.set('test-key', 'test-value', 'EX', 60);
    const value = await redis.get('test-key');
    console.log(`✅ Test set/get: ${value}`);
    
    // Limpiar
    await redis.del('test-key');
    console.log('✅ Limpieza exitosa');
    
    redis.disconnect();
    
  } catch (error) {
    console.error('❌ Error en Redis:', error.message);
    allTestsPassed = false;
  }
  console.log('');
}

// 3. PRUEBA DE API ENDPOINTS
async function testAPI() {
  console.log('3️⃣ PROBANDO ENDPOINTS DE API...');
  console.log('--------------------------------');
  
  try {
    // Health check
    const healthResponse = await axios.get(`${config.stagingUrl}/health`, {
      timeout: 10000
    });
    console.log(`✅ Health check: ${healthResponse.data.status}`);
    console.log(`   🕐 Uptime: ${Math.round(healthResponse.data.uptime)}s`);
    
    // API Status
    const statusResponse = await axios.get(`${config.stagingUrl}/api/status`, {
      timeout: 10000
    });
    console.log(`✅ API Status: ${statusResponse.data.status}`);
    console.log(`   🗄️ Database: ${statusResponse.data.database.status}`);
    
    // Test endpoint
    const testResponse = await axios.get(`${config.stagingUrl}/api/test`, {
      timeout: 10000
    });
    console.log(`✅ Test endpoint funcionando`);
    console.log(`   🔧 Environment: ${testResponse.data.environment}`);
    console.log(`   🗄️ DB URL set: ${testResponse.data.database_url_set}`);
    console.log(`   🔴 Redis URL set: ${testResponse.data.redis_url_set}`);
    
  } catch (error) {
    console.error('❌ Error en API:', error.message);
    if (error.response) {
      console.error(`   📊 Status: ${error.response.status}`);
      console.error(`   📝 Data:`, error.response.data);
    }
    allTestsPassed = false;
  }
  console.log('');
}

// 4. PRUEBA DE REGISTRO Y LOGIN
async function testAuth() {
  console.log('4️⃣ PROBANDO REGISTRO Y LOGIN...');
  console.log('--------------------------------');
  
  const testUser = {
    name: `Test User ${Date.now()}`,
    email: `test${Date.now()}@staging.test`,
    password: 'TestPass123!'
  };
  
  try {
    // Registro
    console.log(`📝 Probando registro con: ${testUser.email}`);
    const registerResponse = await axios.post(`${config.stagingUrl}/api/auth/register`, testUser, {
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' }
    });
    console.log(`✅ Registro exitoso: ${registerResponse.data.message}`);
    
    // Login
    console.log('🔐 Probando login...');
    const loginResponse = await axios.post(`${config.stagingUrl}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password
    }, {
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' }
    });
    console.log(`✅ Login exitoso: ${loginResponse.data.user.email}`);
    console.log(`✅ Token recibido: ${!!loginResponse.data.accessToken}`);
    
    // Verificar token
    const token = loginResponse.data.accessToken;
    const meResponse = await axios.get(`${config.stagingUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000
    });
    console.log(`✅ Verificación de token: ${meResponse.data.user.email}`);
    
  } catch (error) {
    console.error('❌ Error en autenticación:', error.message);
    if (error.response) {
      console.error(`   📊 Status: ${error.response.status}`);
      console.error(`   📝 Data:`, error.response.data);
    }
    allTestsPassed = false;
  }
  console.log('');
}

// EJECUTAR TODAS LAS PRUEBAS
async function runAllTests() {
  console.log(`🚀 Ejecutando en: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  
  await testDatabase();
  await testRedis();
  await testAPI();
  await testAuth();
  
  console.log('📊 RESUMEN DE PRUEBAS');
  console.log('====================');
  if (allTestsPassed) {
    console.log('🎉 ¡TODAS LAS PRUEBAS PASARON! El staging está funcionando correctamente.');
  } else {
    console.log('❌ ALGUNAS PRUEBAS FALLARON. Revisa los errores arriba.');
    process.exit(1);
  }
}

// Manejar errores no capturados
process.on('unhandledRejection', (error) => {
  console.error('❌ Error no manejado:', error);
  process.exit(1);
});

// Ejecutar
runAllTests();
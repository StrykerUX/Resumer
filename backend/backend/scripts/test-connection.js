#!/usr/bin/env node

/**
 * Script simple para probar conexión a staging
 * Ejecutar: node scripts/test-connection.js
 */

console.log('🔍 PROBANDO CONEXIÓN A STAGING...\n');

// Test 1: Variables de entorno
console.log('1️⃣ VARIABLES DE ENTORNO:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'no configurado');
console.log('PORT:', process.env.PORT || 'no configurado');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ configurado' : '❌ no configurado');
console.log('REDIS_URL:', process.env.REDIS_URL ? '✅ configurado' : '❌ no configurado');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ configurado' : '❌ no configurado');
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN || 'no configurado');
console.log('');

// Test 2: Conexión a base de datos
async function testDatabase() {
  console.log('2️⃣ PROBANDO BASE DE DATOS...');
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    await prisma.$connect();
    console.log('✅ Conexión a PostgreSQL exitosa');
    
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query básico funciona');
    
    // Verificar si hay tablas
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ Tabla User existe - ${userCount} registros`);
    } catch (error) {
      console.log('❌ Tabla User no existe o está vacía');
    }
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.log('❌ Error de base de datos:', error.message);
  }
}

// Test 3: Ping a la app
async function testApp() {
  console.log('\n3️⃣ PROBANDO APLICACIÓN...');
  const stagingUrl = process.env.CORS_ORIGIN || 'https://staging.resumer.novalabss.app';
  
  try {
    const https = require('https');
    const url = require('url');
    
    const options = {
      ...url.parse(`${stagingUrl}/health`),
      timeout: 5000,
      rejectUnauthorized: false // Para certificados self-signed
    };
    
    const req = https.get(options, (res) => {
      console.log(`✅ App responde - Status: ${res.statusCode}`);
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`✅ Health check: ${response.status}`);
        } catch (e) {
          console.log('✅ App responde pero no es JSON válido');
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Error conectando a app:', error.message);
    });
    
    req.on('timeout', () => {
      console.log('❌ Timeout conectando a app');
      req.destroy();
    });
    
  } catch (error) {
    console.log('❌ Error probando app:', error.message);
  }
}

// Ejecutar pruebas
async function runTests() {
  await testDatabase();
  await testApp();
  console.log('\n🏁 Pruebas completadas');
}

runTests();
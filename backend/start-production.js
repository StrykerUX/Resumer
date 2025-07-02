#!/usr/bin/env node

/**
 * Script de inicio para producción
 * Se asegura de que se ejecute el backend, no el frontend
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 INICIANDO CV RESUMER BACKEND - PRODUCCIÓN');
console.log('==============================================');
console.log(`📂 Working Directory: ${process.cwd()}`);
console.log(`🌐 Environment: ${process.env.NODE_ENV || 'production'}`);
console.log(`🔌 Port: ${process.env.PORT || 3001}`);
console.log('');

// Verificar que el archivo del backend existe
const backendPath = path.join(__dirname, 'backend', 'dist', 'index.js');
const fs = require('fs');

if (!fs.existsSync(backendPath)) {
  console.error('❌ ERROR: Backend compilado no encontrado en:', backendPath);
  console.log('🔨 Intentando compilar backend...');
  
  // Intentar compilar
  const buildProcess = spawn('npm', ['run', 'build-backend'], { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  buildProcess.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Backend compilado exitosamente');
      startBackend();
    } else {
      console.error('❌ Error compilando backend');
      process.exit(1);
    }
  });
} else {
  console.log('✅ Backend compilado encontrado');
  startBackend();
}

function startBackend() {
  console.log('🚀 Iniciando servidor backend...');
  console.log(`📍 Ejecutando: node ${backendPath}`);
  console.log('');
  
  // Ejecutar backend
  const backend = spawn('node', [backendPath], {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_ENV: process.env.NODE_ENV || 'production',
      PORT: process.env.PORT || '3001'
    }
  });
  
  backend.on('error', (error) => {
    console.error('❌ Error ejecutando backend:', error);
    process.exit(1);
  });
  
  backend.on('close', (code) => {
    console.log(`🛑 Backend terminó con código: ${code}`);
    process.exit(code);
  });
  
  // Manejar señales de terminación
  process.on('SIGINT', () => {
    console.log('\n🛑 Recibida señal SIGINT, terminando...');
    backend.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Recibida señal SIGTERM, terminando...');
    backend.kill('SIGTERM');
  });
}
# 🧪 Testing Instructions - CV Resumer SaaS

## 📋 Overview
Esta guía te ayudará a probar la nueva versión SaaS del CV Resumer que incluye:
- ✅ Sistema de autenticación completo (login/registro)
- ✅ Dashboard de usuario con navegación
- ✅ Integración con backend en producción
- ✅ Sistema de créditos y planes de pago
- ✅ Flujo de creación de CV paso a paso

---

## 🚀 Setup Inicial

### 1. Navegar al directorio del frontend
```bash
cd /home/stryker/projects/resumer
```

### 2. Instalar dependencias (si es necesario)
```bash
npm install
```

### 3. Verificar configuración
```bash
cat .env
```
**Debe mostrar:**
```
REACT_APP_API_URL=https://resumer.novalabss.com
```

### 4. Iniciar el servidor de desarrollo
```bash
npm start
```

**El servidor debería iniciarse en `http://localhost:3000`**

---

## 🧪 Pruebas de Funcionalidad

### 📝 Test 1: Registro de Usuario

1. **Abrir la aplicación:**
   - Ve a `http://localhost:3000`
   - Deberías ser redirigido automáticamente a `/login`

2. **Ir a registro:**
   - Haz clic en "Sign up" en la parte inferior de la página de login
   - Deberías ver el formulario de registro

3. **Llenar el formulario:**
   ```
   Full Name: Test User
   Email: test.user@example.com
   Password: password123
   Confirm Password: password123
   ```

4. **Abrir DevTools:**
   - Presiona `F12` para abrir las herramientas de desarrollador
   - Ve a la pestaña "Console"

5. **Enviar formulario:**
   - Haz clic en "Create Account"
   - Observa los logs en la consola

**✅ Resultado esperado:**
- Usuario creado exitosamente
- Redirección automática al dashboard
- 3 créditos gratuitos asignados
- Token JWT almacenado

---

### 🏠 Test 2: Dashboard y Navegación

1. **Dashboard principal:**
   - Verifica que aparezca "Welcome back!"
   - Confirma que se muestren 3 créditos disponibles
   - Revisa las estadísticas (CVs Generated: 0, Last Activity: No activity yet)

2. **Quick Actions:**
   - Hover sobre cada tarjeta de acción
   - Verifica animaciones y efectos visuales
   - Prueba hacer clic en "Upload Existing CV"

3. **Navegación superior:**
   - Dashboard ✓
   - Create CV ✓
   - History ✓
   - Credits ✓
   - Logout ✓

**✅ Resultado esperado:**
- Todas las páginas cargan correctamente
- No hay errores en consola
- Navegación fluida entre secciones

---

### 🔐 Test 3: Sistema de Autenticación

1. **Logout:**
   - Haz clic en "Logout" en la esquina superior derecha
   - Deberías ser redirigido a `/login`

2. **Login:**
   - Usa las credenciales del usuario que registraste
   - Verifica que funcione el "Show/Hide password"
   - Haz clic en "Sign In"

**✅ Resultado esperado:**
- Login exitoso
- Redirección al dashboard
- Usuario mantenido en sesión

---

### 📄 Test 4: Flujo de Creación de CV

1. **Acceder a Create CV:**
   - Desde el dashboard, haz clic en "Create Your First CV"
   - O usa el menú superior "Create CV"

2. **Step Indicator:**
   - Verifica que se muestre el indicador de pasos
   - Confirma que "Choose Method" esté activo

3. **Seleccionar método:**
   - Prueba hover sobre las 3 opciones
   - Haz clic en "Upload Existing CV"
   - Verifica que avance al siguiente paso

4. **Navegación entre pasos:**
   - Usa los botones "Back" y "Continue"
   - Verifica que el indicador se actualice correctamente

**✅ Resultado esperado:**
- Flujo de pasos funcional
- Navegación fluida
- UI responsive y atractiva

---

### 💳 Test 5: Sistema de Créditos

1. **Página de Credits:**
   - Ve a "Credits" en el menú superior
   - Verifica que se muestren 3 créditos disponibles
   - Revisa los planes de pago disponibles

2. **Planes de pago:**
   - Confirma que "Professional" tenga la etiqueta "POPULAR"
   - Verifica hover effects en las tarjetas
   - Los botones "Purchase Credits" deben estar visibles

**✅ Resultado esperado:**
- Información de créditos correcta
- Planes bien presentados
- UI profesional y clara

---

## 🔍 Debugging y Troubleshooting

### 📊 Logs importantes a revisar:

1. **En la consola del navegador:**
   ```javascript
   // Registro exitoso
   Attempting registration with: {name: "...", email: "...", passwordLength: ...}
   Registration result: {success: true, user: {...}}
   
   // Error de API
   API Error: {url: "...", method: "...", status: ..., message: "..."}
   ```

2. **Network tab (F12 → Network):**
   - Requests a `https://resumer.novalabss.com/api/auth/*`
   - Status 200 para requests exitosos
   - Headers CORS correctos

### ⚠️ Posibles errores y soluciones:

**CORS Error:**
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solución:** El backend ya fue actualizado, espera unos minutos para el deploy

**Network Error:**
```
Network error. Please check your connection
```
**Solución:** Verifica que `https://resumer.novalabss.com` esté accesible

**Port already in use:**
```bash
sudo lsof -ti:3000 | xargs kill -9
npm start
```

---

## 📝 Reportar Resultados

### ✅ Para cada test, reporta:

1. **Estado:** ✅ Pasó / ❌ Falló
2. **Logs de consola** (si hay errores)
3. **Screenshots** de errores visuales
4. **Pasos específicos** donde ocurrió el problema

### 📧 Formato de reporte:
```
Test 1 - Registro: ✅ Pasó
Test 2 - Dashboard: ✅ Pasó  
Test 3 - Auth: ❌ Falló - Error en login
  - Error: "Invalid credentials"
  - Paso: Intentando hacer login con credenciales correctas
  - Console log: [pegar logs aquí]
```

---

## 🎯 Próximos Desarrollos

Una vez que las pruebas básicas pasen, los próximos features a implementar son:

1. **File Upload real** - Subida y parsing de PDFs/Word
2. **AI Integration** - Conexión completa con OpenAI para optimización
3. **PDF Generation** - Descarga de CVs optimizados
4. **Stripe Integration** - Sistema de pagos real
5. **Email System** - Notificaciones y confirmaciones

---

## 🚀 Quick Commands

```bash
# Setup completo
cd /home/stryker/projects/resumer
npm install
npm start

# Restart si hay problemas
sudo lsof -ti:3000 | xargs kill -9
npm start

# Ver logs del backend
curl -I https://resumer.novalabss.com/health
```

---

**🎉 ¡Happy Testing!**

*Última actualización: $(date)*
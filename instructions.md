# Instrucciones de Instalación y Uso

## Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- **Node.js** (versión 14 o superior)
- **npm** (incluido con Node.js)

### Verificar Instalación:
```bash
node --version
npm --version
```

## Instalación del Proyecto

### 1. Instalar Dependencias
Ejecuta en la terminal desde la carpeta del proyecto:

```bash
npm install
```

Este comando instalará todas las dependencias necesarias:
- React y React-DOM
- jsPDF (para generar PDFs)
- html2canvas (para convertir HTML a imagen)
- react-scripts (herramientas de desarrollo)

### 2. Iniciar el Servidor de Desarrollo
```bash
npm start
```

Esto abrirá automáticamente tu navegador en `http://localhost:3000`

## Uso del Sistema

### Visualizar el CV
1. Al ejecutar `npm start`, verás el CV optimizado para Web Designer
2. El CV aparece en formato web con todos los datos
3. Revisa que toda la información se vea correctamente

### Generar PDF
1. Haz clic en el botón "Download CV as PDF"
2. El sistema generará automáticamente un archivo PDF
3. El archivo se descargará con el nombre: `Abraham_Almazan_CV_Web_Designer_WordPress_Elementor.pdf`

### Personalizar para Tu Información

#### Editar Datos Personales:
1. Abre `src/data/cvData.js`
2. Modifica la sección `personalInfo`:
   ```javascript
   personalInfo: {
     name: "Tu Nombre Completo",
     email: "tu.email@gmail.com",
     phone: "+52 XXX XXX XXXX",
     // ... resto de información
   }
   ```

#### Actualizar Experiencia Laboral:
1. En `src/data/cvData.js`, edita la sección `experience`
2. Agrega tus empleos reales:
   ```javascript
   experience: [
     {
       title: "Tu Título Real",
       company: "Nombre de la Empresa",
       period: "2020 - 2024",
       achievements: [
         "Tus logros específicos",
         "Con números y métricas reales"
       ]
     }
   ]
   ```

#### Modificar Skills:
1. Actualiza las secciones en `coreSkills`
2. Agrega o quita habilidades según tu experiencia real

### Adaptar para Otras Vacantes

#### Para Nueva Posición:
1. **Analiza la vacante**: Identifica keywords importantes
2. **Edita cvData.js**: 
   - Actualiza `professionalSummary` con keywords de la nueva vacante
   - Reorganiza `coreSkills` priorizando skills relevantes
   - Ajusta `experience` destacando logros relacionados
3. **Cambia el filename**: En `App.js`, modifica:
   ```javascript
   filename="Abraham_Almazan_CV_[Nueva_Posicion]"
   ```

## Comandos Disponibles

```bash
# Iniciar desarrollo
npm start

# Crear build de producción
npm run build

# Ejecutar tests
npm test

# Extraer configuración (avanzado)
npm run eject
```

## Estructura de Archivos Importantes

### `src/data/cvData.js`
**EL ARCHIVO MÁS IMPORTANTE** - Contiene todos tus datos:
- Información personal
- Resumen profesional
- Skills técnicos y soft
- Experiencia laboral
- Idiomas y certificaciones
- Proyectos destacados

### `src/components/CVTemplate.js`
- Template visual del CV
- Estructura y organización de secciones
- Raramente necesitas modificarlo

### `src/styles/cv.css`
- Estilos optimizados para ATS
- Formato sin colores
- Responsive design

## Solución de Problemas

### Error: "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### PDF no se genera correctamente
1. Verifica que no haya errores en consola del navegador
2. Asegúrate de que el contenido no sea demasiado largo
3. Prueba en navegador diferente

### Estilos no se ven bien
1. Verifica que `cv.css` esté importado en `App.js`
2. Limpia caché del navegador (Ctrl+Shift+R)

## Tips de Optimización

### Para ATS:
- Mantén formato simple sin colores
- Usa keywords de la vacante naturalmente
- Evita imágenes o gráficos complejos
- Mantén estructura clara con títulos descriptivos

### Para Diferentes Vacantes:
- Siempre prioriza skills relevantes al puesto
- Ajusta el resumen profesional con keywords específicas
- Reorganiza experiencia destacando logros relacionados
- Cambia el nombre del archivo PDF para identificar la posición

## Contacto y Soporte

Si tienes problemas técnicos:
1. Verifica que Node.js esté instalado correctamente
2. Asegúrate de estar en la carpeta correcta del proyecto
3. Revisa que todas las dependencias se hayan instalado

**¡Tu CV está listo para destacar en la vacante de Web Designer!**
# CV Resumer - ATS-Compatible CV Generator

## Objetivo del Proyecto

Este proyecto React permite generar CVs optimizados para sistemas ATS (Applicant Tracking Systems) y alineados específicamente a vacantes de trabajo. El objetivo principal es crear un CV dinámico y modificable que se adapte a diferentes posiciones laborales manteniendo toda la información original del candidato.

## Características Principales

- **ATS-Optimizado**: Formato sin colores, estructura limpia y keywords relevantes
- **Modular**: Fácil modificación de datos para diferentes vacantes
- **Generación PDF**: Descarga directa del CV en formato PDF
- **Responsive**: Adaptable a diferentes tamaños de pantalla
- **Reutilizable**: Template base para múltiples aplicaciones laborales

## Estructura del Proyecto

```
/
├── package.json                 # Dependencias del proyecto
├── public/
│   └── index.html              # HTML base
├── src/
│   ├── App.js                  # Componente principal
│   ├── index.js                # Punto de entrada React
│   ├── components/
│   │   ├── CVTemplate.js       # Template del CV
│   │   └── PDFGenerator.js     # Generador de PDF
│   ├── data/
│   │   └── cvData.js          # Datos del CV (EDITABLE)
│   └── styles/
│       └── cv.css             # Estilos ATS-friendly
├── README.md                   # Este archivo
├── cv.md                      # Información original del CV
└── instructions.md            # Guía de instalación y uso
```

## Tecnologías Utilizadas

- **React 18**: Framework principal
- **jsPDF**: Generación de archivos PDF
- **html2canvas**: Conversión HTML a imagen para PDF
- **CSS3**: Estilos optimizados para ATS

## Optimizaciones para Web Designer

El CV actual está específicamente optimizado para la posición de **Web Designer con WordPress & Elementor**:

### Skills Destacados:
- WordPress Development (5+ años)
- Elementor Pro (Nivel experto)
- HTML5, CSS3, JavaScript
- Diseño Responsive
- Gestión de Proyectos (ClickUp)

### Alineación ATS:
- Keywords de la vacante incorporadas naturalmente
- Formato sin colores
- Estructura clara y legible por sistemas automatizados
- Certificación C1 English prominentemente mostrada

## Uso Futuro

Para adaptar este CV a otras vacantes:

1. **Editar `src/data/cvData.js`**: Modificar skills, experiencia y summary según la nueva posición
2. **Ajustar keywords**: Incluir términos específicos de la nueva vacante
3. **Reorganizar secciones**: Priorizar información relevante para el rol
4. **Generar nuevo PDF**: Descargar versión actualizada

## Ventajas del Sistema

- ✅ **Consistencia**: Mismo formato profesional para todas las aplicaciones
- ✅ **Eficiencia**: Rápida adaptación a nuevas vacantes
- ✅ **ATS-Friendly**: Optimizado para sistemas de filtrado automático
- ✅ **Profesional**: Diseño limpio y empresarial
- ✅ **Mantenible**: Código organizado y documentado
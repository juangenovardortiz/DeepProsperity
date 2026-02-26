# GameToDo - Gamifica tus Hábitos

Una aplicación web de frontend para gamificar hábitos diarios usando un radar chart de 6 "stats vitales".

## Características

- **6 Categorías de Vida**: Cuerpo, Energía, Mente, Trabajo, Relaciones, Dinero
- **Sistema de XP con Límites Diarios**: 40 XP por categoría, 120 XP total
- **Visualización Radar**: Muestra tu progreso balanceado en tiempo real
- **Balance Score**: Algoritmo que premia el equilibrio entre todas las áreas
- **Dos Modos de Entrada**:
  - **Modo Rápido**: Acceso rápido a hábitos más usados
  - **Modo Preciso**: Catálogo completo organizado por categorías
- **30 Hábitos Predefinidos**: Listos para usar desde el primer día
- **Hábitos Personalizados**: Crea tus propios hábitos con XP personalizado
- **Racha de Días**: Sigue tu consistencia a lo largo del tiempo
- **Historial**: Revisa tu progreso de días anteriores
- **Persistencia de Datos**:
  - **Firebase Firestore**: Sincronización en la nube (opcional)
  - **localStorage**: Fallback local cuando Firebase no está configurado

## Stack Tecnológico

- React 18
- TypeScript
- Vite
- Chart.js + react-chartjs-2
- React Router v6
- Firebase Firestore (opcional)
- CSS puro (mobile-first)

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/GameToDo.git
cd GameToDo

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Preview del build de producción
npm run preview
```

## Configuración de Firebase (Opcional pero Recomendado)

La aplicación funciona sin configuración adicional usando localStorage, **pero tus datos se perderán al limpiar el caché del navegador**. Para tener persistencia permanente en la nube, configura Firebase Firestore:

### ¿Por qué Firebase?

- ✅ **Gratis**: Hasta 50,000 lecturas/día (más que suficiente para uso personal)
- ✅ **Funciona con GitHub Pages**: No necesitas backend propio
- ✅ **Sincronización**: Accede a tus datos desde cualquier dispositivo/navegador
- ✅ **Backup automático**: Nunca perderás tus datos
- ✅ **Tiempo real**: Los cambios se sincronizan instantáneamente

### Pasos de Configuración

#### 1. Crear proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Agregar proyecto" (o "Add project")
3. Dale un nombre (ej: "GameToDo")
4. Desactiva Google Analytics (no es necesario)
5. Haz clic en "Crear proyecto"

#### 2. Crear app web en Firebase

1. En la página de inicio de tu proyecto, haz clic en el ícono **</>** (Web)
2. Dale un nombre a tu app (ej: "GameToDo Web")
3. **NO** marques "Firebase Hosting"
4. Haz clic en "Registrar app"
5. **Copia** las credenciales que aparecen (las necesitarás en el siguiente paso)

#### 3. Habilitar Firebase Authentication con Google

1. En el menú lateral, ve a **"Build" > "Authentication"**
2. Haz clic en "Get started" (Comenzar)
3. En la pestaña **"Sign-in method"**:
   - Haz clic en **"Google"**
   - Activa el toggle para **"Enable"**
   - Selecciona un correo de soporte para el proyecto
   - Haz clic en **"Save"**

#### 4. Habilitar Firestore Database

1. En el menú lateral, ve a **"Build" > "Firestore Database"**
2. Haz clic en "Crear base de datos"
3. Selecciona la ubicación más cercana a ti (ej: `us-central`)
4. Selecciona **"Iniciar en modo de producción"** (ya tendremos reglas de seguridad)
5. Haz clic en "Habilitar"

#### 5. Configurar reglas de seguridad de Firestore

1. En Firestore Database, ve a la pestaña **"Reglas"**
2. Reemplaza las reglas con las siguientes:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo usuarios autenticados pueden acceder a sus propios datos
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Haz clic en "Publicar"

> **✅ Seguridad**: Estas reglas aseguran que cada usuario solo puede acceder a sus propios datos. Solo los usuarios autenticados con Google pueden usar la aplicación.

#### 6. Configurar variables de entorno

1. En la raíz del proyecto, crea un archivo `.env`:

```bash
cp .env.example .env
```

2. Abre el archivo `.env` y pega tus credenciales de Firebase:

```env
VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

3. Guarda el archivo

#### 7. Reiniciar el servidor de desarrollo

```bash
# Detén el servidor (Ctrl+C) y vuelve a iniciarlo
npm run dev
```

### Migración Automática

Cuando configures Firebase por primera vez:

1. La app detectará automáticamente que Firebase está configurado
2. Migrará todos los datos existentes de localStorage a Firestore
3. A partir de ese momento, todos los datos se guardarán en la nube

### Fallback Automático

Si Firebase falla o no está configurado:
- La app automáticamente usará localStorage
- Todo seguirá funcionando normalmente
- Verás un mensaje en la consola indicando que está usando localStorage

## Uso

1. **Inicio**: Visualiza tu radar del día y añade hábitos completados
2. **Modo Rápido**: Selecciona una categoría y elige de tus hábitos más usados
3. **Modo Preciso**: Explora el catálogo completo por categorías
4. **Crear Hábito**: Añade hábitos personalizados con nombre, categoría, XP (5/10/20)
5. **Hoy**: Revisa tus entradas del día con opción de eliminar
6. **Hábitos**: Gestiona tus hábitos personalizados
7. **Historial**: Navega por días anteriores y observa tu progreso

## Sistema de Puntuación

### XP Permitido
- **Hábitos predefinidos**: 0, 5, 10, 20 XP
- **Hábitos personalizados**: 5, 10, 20 XP (30 reservado para logros futuros)

### Límites Diarios
- **Por categoría**: 40 XP máximo
- **Total diario**: 120 XP máximo

### Cálculo de Balance
El "Balance Score" se calcula usando la desviación estándar de los porcentajes de las 6 categorías:
```
balanceScore = 100 - (stddev × 1.5)
```
Un score alto indica que estás cuidando todas las áreas de tu vida de forma equilibrada.

### Porcentajes del Radar
Cada categoría muestra un porcentaje (0-100%) basado en:
```
porcentaje = (XP_categoria / 40) × 100
```

## Estructura del Proyecto

```
src/
├── types/              # Definiciones TypeScript
├── utils/              # Funciones puras de cálculo
├── services/           # Abstracción de localStorage
├── hooks/              # Custom React hooks
├── components/         # Componentes React
│   ├── layout/
│   ├── radar/
│   ├── input/
│   ├── habits/
│   ├── entries/
│   ├── history/
│   └── common/
└── pages/              # Componentes de página
```

## Deployment en GitHub Pages

El proyecto está configurado para deployar en GitHub Pages:

1. Ajusta el `base` en [vite.config.ts](vite.config.ts:6) a tu nombre de repositorio
2. Haz commit y push a tu repositorio
3. Ve a Settings > Pages en GitHub
4. Selecciona la rama y carpeta `/dist`
5. Guarda y espera unos minutos

O usa GitHub Actions para deploy automático (añade workflow si lo deseas).

## Características Técnicas

- **Mobile-first**: Diseñado primero para móvil, responsive hasta desktop
- **Backend opcional**: Funciona con Firebase Firestore o solo localStorage
- **Persistencia híbrida**:
  - Firestore como almacenamiento principal (si está configurado)
  - localStorage como fallback y caché local
  - Migración automática de datos
- **TypeScript estricto**: Type-safety completo
- **React Hooks**: Estado moderno sin Redux
- **HashRouter**: Compatible con GitHub Pages

## Catálogo de Hábitos Predefinidos

### Cuerpo (5)
- Caminar 30 min (10 XP)
- Entrenar fuerza (20 XP)
- Cardio (20 XP)
- Estirar 10 min (10 XP)
- Pasos 8k+ (10 XP)

### Energía (5)
- Dormir 7h+ (20 XP)
- Rutina sin pantallas (10 XP)
- Siesta corta (5 XP)
- Meditación (10 XP)
- Paseo al sol (10 XP)

### Mente (5)
- Leer 20 min (10 XP)
- Estudiar 45-60 min (20 XP)
- Diario/reflexión (10 XP)
- Aprender algo nuevo (10 XP)
- Plan del día (10 XP)

### Trabajo (5)
- 1 MIT completada (20 XP)
- Deep Work 50 min (20 XP)
- Inbox a cero (10 XP)
- Planificación del día (10 XP)
- Revisión semanal (20 XP)

### Relaciones (5)
- Tiempo con pareja (20 XP)
- Juego con hijos (20 XP)
- Llamar a alguien (10 XP)
- Mensaje a un amigo (5 XP)
- Acto de ayuda (10 XP)

### Dinero (5)
- Registrar gastos (10 XP)
- Revisar presupuesto (10 XP)
- Ahorro/transferencia (10 XP)
- Revisar inversiones (10 XP)
- Optimizar suscripciones (20 XP)

## Licencia

MIT

## Contribuciones

Las contribuciones son bienvenidas. Por favor abre un issue primero para discutir cambios mayores.

## Autor

Desarrollado con Claude Code

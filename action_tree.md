# DeepProsperity — Árbol de Funcionalidades

```
DeepProsperity (GameToDo)
│
├── 🔐 Autenticación
│   ├── Inicio de sesión con Google (botón "Continuar con Google")
│   │   └── Spinner de carga mientras se autentica
│   ├── Redirección automática a Inicio si ya autenticado
│   ├── Aviso si Firebase no está configurado (modo localStorage)
│   └── Ruta protegida (ProtectedRoute) — redirige a /login si no autenticado
│
├── 📐 Layout General
│   ├── Barra de navegación inferior (AppLayout → Navigation)
│   │   ├── 🏠 Inicio (/)
│   │   ├── 📈 Resumen (/summary)
│   │   └── 📊 Historial (/history)
│   └── Menú de usuario (esquina superior, avatar/foto + email debajo)
│       ├── Desplegable con nombre y email del usuario
│       ├── 🚪 Cerrar sesión
│       └── (Solo Admin)
│           ├── 🔄 Restaurar hábitos predeterminados (diálogo de confirmación)
│           └── 🗑️ Limpiar todos los datos (diálogo de confirmación)
│
├── 🏠 Página de Inicio (HomePage)
│   ├── Navegación de fecha (< Hoy >)
│   │   ├── Botón anterior (retrocede un día)
│   │   ├── Seleccionar fecha (Click en etiqueta → Abre Date Picker nativo)
│   │   ├── Botón siguiente (avanza un día)
│   │   └── Botón "Volver a Hoy" (visible cuando la fecha no es hoy)
│   │
│   ├── Radar Chart interactivo (Chart.js)
│   │   ├── 6 ejes: Cuerpo, Energía, Mente, Trabajo, Relaciones, Dinero
│   │   ├── Porcentaje por categoría (0-100%, basado en XP/40)
│   │   └── Click en categoría → filtra tareas de esa categoría
│   │
│   ├── Resumen de estadísticas (RadarSummary)
│   │   ├── Prosperidad (Balance Score 0-100)
│   │   ├── Nivel (calculado del total de entries)
│   │   └── Tareas completadas (entryCount / totalCount)
│   │
│   └── Entrada rápida de tareas (QuickInput)
│       ├── Input de texto "Nueva tarea o hábito..."
│       │   └── Botón "+" a la derecha
│       │       ├── Si está vacío: abre modal completo de nueva tarea
│       │       └── Si tiene texto escrito: expande formulario rápido inline (Categoría, Confirmar)
│       ├── Lista de tareas del día (filtradas por periodicidad y día)
│       │   ├── Sección "Tareas regulares"
│       │   ├── Sección "Antes de dormir"
│       │   └── Sección "Completadas"
│       ├── Chip de tarea (HabitChip)
│       │   ├── Click → marcar/desmarcar tarea (toggle entry)
│       │   ├── Long-press / click derecho → abrir edición
│       │   ├── Indicador visual de completado (tachado/opaco)
│       │   └── Efecto de confeti al completar (CompletionEffect)
│       ├── Filtro por categoría (click en radar o selector)
│       │   └── Botón limpiar filtro
│       ├── Drag & Drop de tareas
│       │   ├── Reordenar dentro de la misma sección
│       │   └── Mover entre secciones (regular ↔ antes de dormir ↔ completadas)
│       └── Botones de mover arriba/abajo por tarea
│
├── 📋 Modal de Gestión de Tareas (HabitModal)
│   ├── Botón "+ Crear Habito/Tarea" → formulario de creación
│   ├── Lista de tareas agrupadas por categoría
│   │   └── Por cada tarea:
│   │       ├── ☆/★ Toggle favorito (pin)
│   │       ├── ✏️ Editar → abre formulario con datos precargados
│   │       └── 🗑️ Eliminar tarea
│   ├── Formulario de tarea (HabitForm)
│   │   ├── Nombre (input texto)
│   │   ├── Descripción (input texto, opcional)
│   │   ├── Categoría (selector de 6 categorías)
│   │   ├── XP (selector: 5, 10, 20)
│   │   ├── Periodicidad (diario / una vez)
│   │   ├── Días de la semana (checkboxes L-D, visible si diario)
│   │   ├── Fecha objetivo (date picker, visible si "una vez")
│   │   ├── Sección "antes de dormir" (toggle)
│   │   └── Botones: Guardar / Cancelar
│   └── Cerrar modal (botón × o tecla Escape)
│
├── 📅 Página Hoy (TodayPage)
│   ├── Fecha de hoy (formateada)
│   ├── Resumen de estadísticas (RadarSummary)
│   └── Lista de entradas del día (TodayEntryList)
│       └── Por cada entrada (EntryItem):
│           ├── Nombre del hábito y categoría (badge de color)
│           ├── XP ganado
│           ├── Editar valor (si tiene unidad: minutos/conteo)
│           └── Eliminar entrada
│
├── 📋 Página Mis Tareas (HabitsPage)
│   ├── Botón "+ Crear Tarea" → formulario de creación
│   ├── Filtro por categoría (CategorySelector, multi-select)
│   ├── Lista de tareas (HabitList)
│   │   └── Por cada tarea:
│   │       ├── Nombre, categoría, XP
│   │       ├── Editar → abre formulario inline
│   │       └── Eliminar tarea
│   └── Estado vacío si no hay tareas
│
├── 📈 Página Resumen (SummaryPage)
│   ├── Radar Chart con promedios de todos los días
│   ├── Prosperidad Media (balance score promedio / 100)
│   │   └── Barra de progreso visual
│   ├── Nivel del usuario
│   ├── Días Activos (total)
│   ├── Media Tareas/Día
│   └── Estado vacío si no hay datos
│
├── 📊 Página Historial (HistoryPage)
│   ├── Lista de días con actividad (HistoricalDaysList)
│   │   └── Por cada día:
│   │       ├── Fecha
│   │       ├── Mini radar (HistoricalRadar)
│   │       └── Click → navega a Inicio con esa fecha cargada
│   └── Selector de fecha (DateSelector)
│
├── 🎮 Sistema de Gamificación
│   ├── XP por tarea (5, 10, 20 puntos)
│   ├── Límite diario por categoría: 40 XP
│   ├── Límite diario total: 120 XP
│   ├── Balance Score: 100 - (stddev × 1.5)
│   ├── Sistema de niveles (basado en entradas acumuladas)
│   ├── Efecto de confeti al completar tarea (canvas-confetti)
│   └── 30 hábitos predefinidos (5 por categoría)
│
├── 💾 Persistencia de Datos
│   ├── Firebase Firestore (almacenamiento principal si configurado)
│   │   ├── Sincronización en la nube
│   │   └── Reglas de seguridad por usuario
│   ├── localStorage (fallback automático)
│   ├── Migración automática localStorage → Firestore
│   └── Inicialización (FirebaseInit)
│
└── ⚙️ Comportamientos Automáticos
    ├── Carga inicial con spinner "Cargando..."
    ├── Redirección a /login si no autenticado
    ├── Redirección a / si URL no reconocida (catch-all)
    ├── Filtro de tareas por día de la semana actual
    ├── Tareas "una vez" se muestran en su fecha objetivo o carry-over a hoy
    ├── Click fuera del menú de usuario → cierra el menú
    └── HashRouter para compatibilidad con GitHub Pages
```

# Plan: JuegoTetris

## Resumen
Juego de Tetris implementado en HTML5/CSS3/JavaScript, empaquetado como aplicación de escritorio usando Electron y configurado con Webpack.

## Objetivos
- [x] Desarrollar un juego de Tetris jugable en el navegador y escritorio.
- [x] Empaquetarlo como aplicación de escritorio con Electron.
- [x] Usar Webpack para la gestión de módulos y build.
- [x] Mostrar puntuación, previsualización de la siguiente pieza y pantalla de Game Over.
- [x] Implementar tests unitarios para la lógica del juego.

## 🏗️ Arquitectura

- **Patrón**: Aplicación de escritorio empaquetada (Electron + Webpack) con renderizado Canvas 2D.

```text
JuegoTetris/
├── index.html                  # Canvas del juego y pantalla de Game Over
├── main.js                     # Proceso principal de Electron
├── preload.js                  # Bridge de seguridad Electron
├── script.js                   # Lógica del Tetris (piezas, colisiones, puntuación)
├── style.css                   # Estilos del juego
├── test/
│   └── tetris.test.js          # Tests unitarios del motor (matrices, rotación, colisiones)
├── webpack.main.config.js      # Webpack para proceso principal
├── webpack.renderer.config.js  # Webpack para renderer
├── tsconfig.json               # Configuración TypeScript
├── package.json
└── plan.md
```

## 🧠 Paradigma de Programación

- **Imperativo/Procedimental + Event-Driven**
- El game loop (bucle de juego) es **imperativo**: actualiza estado de piezas, detecta colisiones y redibuja el canvas en cada tick con `requestAnimationFrame`.
- Los controles del jugador (flechas, rotación) se manejan de forma **event-driven** con `keydown` listeners.
- Electron introduce un modelo **event-driven** entre procesos (IPC main—renderer).

---

## 🌐 Propósito de Visibilidad y Destino Remoto

- **Visibilidad**: `Público (Open Source / Portafolio)`.
- **Plataforma Remota Asignada**: `GitHub`.
- **Plataforma de Despliegue CI/CD**: `GitHub Pages` / `GitHub Actions`.
- **Justificación**: Implementación clásica de Tetris Canvas 2D + Electron con pruebas unitarias, código limpio y abierto para el portafolio público en GitHub.

---

> ⚠️ **Auditoría de UI / DESIGN.md:** La interfaz actual no cumple con las directrices visuales de [DESIGN.md](../DESIGN.md) (requiere paleta HSL, Google Fonts modernas y profundidad/glassmorphism). Pendiente refactor visual.
## Estado actual
- Estado: ✅ **Completado**
- Lógica de Tetris completa con matriz 10x20, 7 tetrominós oficiales (I, J, L, O, S, T, Z) y detección de colisiones *Wall-Kick*.
- Suite de pruebas unitarias implementada en `test/tetris.test.js`.

## Tareas realizadas
- [x] Implementar la lógica completa del Tetris: generación de piezas, movimientos, rotaciones, detección de líneas, puntuación.
- [x] Configurar el bucle de juego y la detección de colisiones.
- [x] Desarrollar la interfaz de usuario para mostrar la siguiente pieza, puntuación y nivel.
- [x] Asegurar que Electron y Webpack estén correctamente configurados para el build.
- [x] Documentar comandos de `npm run start` o similar para iniciar.
- [x] Añadir tests unitarios para la lógica del juego (`test/tetris.test.js`).

## Stack / Tecnologías
- HTML5 (canvas), CSS3
- Vanilla JavaScript (ES6+)
- Electron, Webpack
- npm

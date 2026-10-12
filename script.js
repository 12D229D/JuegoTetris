// --- CONFIGURACIÓN Y CONSTANTES ---
const BOARD_COLS = 10;
const BOARD_ROWS = 20;
const BLOCK_SIZE = 30; // Tamaño de cada bloque en píxeles (para el tablero principal)

// Colores de los tetrominos estilo Arcade/Neón
// El índice 0 es transparente/vacío. Los índices 1-7 corresponden a las piezas.
const COLORS = [
    null,
    '#00f0ff', // 1: I (Cian)
    '#ffea00', // 2: O (Amarillo)
    '#bd00ff', // 3: T (Morado)
    '#00e676', // 4: S (Verde)
    '#ff0055', // 5: Z (Rojo)
    '#2979ff', // 6: J (Azul)
    '#ff9100'  // 7: L (Naranja)
];

// Definición de las piezas (matrices de forma)
const SHAPES = [
    null,
    // I
    [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    // O
    [
        [2, 2],
        [2, 2]
    ],
    // T
    [
        [0, 3, 0],
        [3, 3, 3],
        [0, 0, 0]
    ],
    // S
    [
        [0, 4, 4],
        [4, 4, 0],
        [0, 0, 0]
    ],
    // Z
    [
        [5, 5, 0],
        [0, 5, 5],
        [0, 0, 0]
    ],
    // J
    [
        [6, 0, 0],
        [6, 6, 6],
        [0, 0, 0]
    ],
    // L
    [
        [0, 0, 7],
        [7, 7, 7],
        [0, 0, 0]
    ]
];

// --- ELEMENTOS DEL DOM ---
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-piece');
const nextCtx = nextCanvas.getContext('2d');

const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const linesElement = document.getElementById('lines');
const finalScoreElement = document.getElementById('final-score');

const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtnOverlay = document.getElementById('restart-btn-overlay');

const gameOverScreen = document.getElementById('game-over-screen');
const pauseScreen = document.getElementById('pause-screen');

// --- ESCALADO DE LIENZOS ---
ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
// El lienzo de la siguiente pieza es de 120x120. Dibujaremos en una cuadrícula de 4x4.
// Por lo tanto, el block size para el preview es 120 / 4 = 30 píxeles.
nextCtx.scale(30, 30);

// --- ESTADO DEL JUEGO ---
let arena = createMatrix(BOARD_COLS, BOARD_ROWS);
let player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    colorId: 0,
    nextMatrix: null,
    nextColorId: 0
};

let score = 0;
let level = 1;
let lines = 0;

let dropCounter = 0;
let dropInterval = 1000; // 1 segundo inicial
let lastTime = 0;

let gameRunning = false;
let gamePaused = false;
let animationFrameId = null;

// --- FUNCIONES DE MATRICES ---

// Crea una matriz bidimensional llena de ceros
function createMatrix(width, height) {
    const matrix = [];
    while (height--) {
        matrix.push(new Array(width).fill(0));
    }
    return matrix;
}

// Copia los valores de la pieza del jugador a la arena (fijación)
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

// Detecta colisiones de la pieza del jugador con los límites o con bloques ya fijados
function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (arena[y + o.y] === undefined ||
                arena[y + o.y][x + o.x] === undefined ||
                arena[y + o.y][x + o.x] !== 0)) {
                return true;
            }
        }
    }
    return false;
}

// Rota una matriz (sentido horario)
function rotate(matrix) {
    const n = matrix.length;
    const rotated = Array.from({ length: n }, () => Array(n).fill(0));
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            rotated[c][n - 1 - r] = matrix[r][c];
        }
    }
    return rotated;
}

// --- DIBUJADO ---

// Dibuja un solo bloque con estilo 3D/Neón
function drawBlock(context, x, y, colorId, isPreview = false) {
    const color = COLORS[colorId];
    context.fillStyle = color;
    context.fillRect(x, y, 1, 1);

    // Bordes oscuros sutiles alrededor del bloque
    context.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    context.lineWidth = 0.06;
    context.strokeRect(x, y, 1, 1);

    // Brillo en la esquina superior izquierda (efecto 3D)
    context.fillStyle = 'rgba(255, 255, 255, 0.25)';
    context.fillRect(x + 0.06, y + 0.06, 0.88, 0.12); // Superior
    context.fillRect(x + 0.06, y + 0.18, 0.12, 0.76); // Izquierdo

    // Sombra en la esquina inferior derecha (efecto 3D)
    context.fillStyle = 'rgba(0, 0, 0, 0.35)';
    context.fillRect(x + 0.06, y + 0.82, 0.88, 0.12); // Inferior
    context.fillRect(x + 0.82, y + 0.06, 0.12, 0.76); // Derecho
}

// Dibuja la cuadrícula sutil de fondo
function drawGrid() {
    ctx.strokeStyle = '#1c2030';
    ctx.lineWidth = 0.03;
    
    // Líneas verticales
    for (let x = 0; x <= BOARD_COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, BOARD_ROWS);
        ctx.stroke();
    }
    
    // Líneas horizontales
    for (let y = 0; y <= BOARD_ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(BOARD_COLS, y);
        ctx.stroke();
    }
}

// Dibuja todo el juego en el canvas
function draw() {
    // Limpiar tablero principal
    ctx.fillStyle = '#0c0e14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar cuadrícula
    drawGrid();

    // Dibujar la arena (bloques fijos)
    arena.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                drawBlock(ctx, x, y, value);
            }
        });
    });

    // Dibujar la pieza activa del jugador
    if (player.matrix) {
        // Opcional: Dibujar la sombra de proyección (Ghost Piece)
        drawGhostPiece();

        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    drawBlock(ctx, player.pos.x + x, player.pos.y + y, player.colorId);
                }
            });
        });
    }

    // Dibujar la siguiente pieza en el canvas de vista previa
    drawNextPiece();
}

// Dibuja la sombra de proyección de la pieza activa (dónde va a caer)
function drawGhostPiece() {
    const ghostPos = { x: player.pos.x, y: player.pos.y };
    
    // Encontrar la posición más baja sin colisionar
    while (!collide(arena, { pos: ghostPos, matrix: player.matrix })) {
        ghostPos.y++;
    }
    ghostPos.y--; // Subir un paso hacia atrás (la última posición segura)

    // Solo dibujar si está más abajo que la pieza actual para evitar solapamientos extraños
    if (ghostPos.y > player.pos.y) {
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    // Dibujar una silueta o bloque semitransparente
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
                    ctx.fillRect(ghostPos.x + x, ghostPos.y + y, 1, 1);
                    
                    ctx.strokeStyle = COLORS[player.colorId];
                    ctx.lineWidth = 0.05;
                    ctx.strokeRect(ghostPos.x + x + 0.05, ghostPos.y + y + 0.05, 0.9, 0.9);
                }
            });
        });
    }
}

// Dibuja la siguiente pieza en su panel correspondiente
function drawNextPiece() {
    nextCtx.fillStyle = '#0c0e14';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

    if (!player.nextMatrix) return;

    // Calcular compensaciones para centrar la pieza en el panel de 4x4
    const size = player.nextMatrix.length;
    let minX = size, maxX = 0, minY = size, maxY = 0;
    
    // Encontrar límites reales de la pieza
    player.nextMatrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        });
    });

    const pieceWidth = maxX - minX + 1;
    const pieceHeight = maxY - minY + 1;

    // Centrar en la cuadrícula de 4x4
    const offsetX = (4 - pieceWidth) / 2 - minX;
    const offsetY = (4 - pieceHeight) / 2 - minY;

    player.nextMatrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                drawBlock(nextCtx, x + offsetX, y + offsetY, player.nextColorId, true);
            }
        });
    });
}

// --- LÓGICA DEL JUEGO ---

// Inicializa las piezas del jugador
function playerReset() {
    if (player.nextMatrix === null) {
        // Primera ejecución: generar pieza actual y siguiente pieza
        const currentId = Math.floor(Math.random() * (SHAPES.length - 1)) + 1;
        player.matrix = SHAPES[currentId];
        player.colorId = currentId;

        const nextId = Math.floor(Math.random() * (SHAPES.length - 1)) + 1;
        player.nextMatrix = SHAPES[nextId];
        player.nextColorId = nextId;
    } else {
        // Traspasar siguiente pieza a actual y generar nueva siguiente
        player.matrix = player.nextMatrix;
        player.colorId = player.nextColorId;

        const nextId = Math.floor(Math.random() * (SHAPES.length - 1)) + 1;
        player.nextMatrix = SHAPES[nextId];
        player.nextColorId = nextId;
    }

    // Posicionar en la parte superior central
    player.pos.y = 0;
    player.pos.x = Math.floor((arena[0].length - player.matrix[0].length) / 2);

    // Si al reaparecer colisiona instantáneamente, es Fin del Juego (Game Over)
    if (collide(arena, player)) {
        gameOver();
    }
}

// Mueve la pieza a la izquierda o derecha
function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir; // Revertir movimiento en caso de colisión
    }
}

// Baja la pieza un nivel
function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--; // Revertir
        merge(arena, player); // Fijar pieza
        playerReset(); // Nueva pieza
        arenaSweep(); // Comprobar y limpiar líneas completas
        updateScore();
        return false;
    }
    dropCounter = 0;
    return true;
}

// Caída rápida instantánea (Hard Drop)
function playerHardDrop() {
    let count = 0;
    while (!collide(arena, player)) {
        player.pos.y++;
        count++;
    }
    player.pos.y--; // Posición segura anterior
    merge(arena, player);
    playerReset();
    arenaSweep();
    // Sumar puntos adicionales por la caída libre (2 puntos por fila)
    score += (count - 1) * 2;
    updateScore();
    dropCounter = 0;
}

// Rotación del jugador gestionando colisiones con paredes (Wall Kick simplificado)
function playerRotate() {
    const pos = player.pos.x;
    let offset = 1;
    player.matrix = rotate(player.matrix);
    
    // Si colisiona al rotar, intentamos moverlo a los lados para encajarlo (Wall kick)
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            // Si el desplazamiento es mayor que el ancho de la pieza, no rota (revierte)
            player.matrix = rotate(rotate(rotate(player.matrix))); // Rotar 3 veces = sentido inverso
            player.pos.x = pos;
            return;
        }
    }
}

// Comprueba y elimina las líneas completas
function arenaSweep() {
    let rowCount = 1;
    let linesCleared = 0;

    outer: for (let y = arena.length - 1; y >= 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        // Si la línea está completa, la removemos y agregamos una vacía al inicio
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y; // Ajustar índice para revisar de nuevo la fila en esa posición

        linesCleared++;
    }

    if (linesCleared > 0) {
        // Sistema de puntuación clásico de Tetris
        let points = 0;
        if (linesCleared === 1) points = 100;
        else if (linesCleared === 2) points = 300;
        else if (linesCleared === 3) points = 500;
        else if (linesCleared === 4) points = 800;

        score += points * level;
        lines += linesCleared;

        // Subir nivel cada 10 líneas
        const newLevel = Math.floor(lines / 10) + 1;
        if (newLevel > level) {
            level = newLevel;
            // Incrementar velocidad (reducir intervalo de caída)
            dropInterval = Math.max(100, 1000 - (level - 1) * 100);
        }
    }
}

// Actualiza los textos de puntuación en el HTML
function updateScore() {
    scoreElement.innerText = score;
    levelElement.innerText = level;
    linesElement.innerText = lines;
}

// --- CONTROLES DE FLUJO DEL JUEGO ---

// Bucle principal del juego (Game Loop)
function update(time = 0) {
    if (!gameRunning || gamePaused) return;

    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    animationFrameId = requestAnimationFrame(update);
}

// Inicia un nuevo juego
function startGame() {
    // Resetear variables del estado
    arena = createMatrix(BOARD_COLS, BOARD_ROWS);
    score = 0;
    level = 1;
    lines = 0;
    dropInterval = 1000;
    dropCounter = 0;
    lastTime = 0;
    gameRunning = true;
    gamePaused = false;

    player.nextMatrix = null; // Fuerza reinicio completo de piezas
    playerReset();
    updateScore();

    // Actualizar IU
    gameOverScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    startBtn.innerText = 'Reiniciar';
    pauseBtn.innerText = 'Pausar';
    pauseBtn.disabled = false;

    // Iniciar bucle
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    update();
}

// Pausa / Reanuda el juego
function togglePause() {
    if (!gameRunning) return;

    gamePaused = !gamePaused;
    if (gamePaused) {
        pauseScreen.classList.remove('hidden');
        pauseBtn.innerText = 'Reanudar';
        cancelAnimationFrame(animationFrameId);
    } else {
        pauseScreen.classList.add('hidden');
        pauseBtn.innerText = 'Pausar';
        lastTime = performance.now();
        update(lastTime);
    }
}

// Termina el juego
function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(animationFrameId);
    finalScoreElement.innerText = score;
    gameOverScreen.classList.remove('hidden');
    pauseBtn.disabled = true;
    startBtn.innerText = 'Jugar';
}

// --- EVENTOS / LISTENERS ---

// Controles del teclado
document.addEventListener('keydown', event => {
    if (!gameRunning) return;

    if (event.key === 'p' || event.key === 'P') {
        togglePause();
        return;
    }

    if (gamePaused) return;

    switch (event.key) {
        case 'ArrowLeft':
            playerMove(-1);
            draw();
            break;
        case 'ArrowRight':
            playerMove(1);
            draw();
            break;
        case 'ArrowDown':
            playerDrop();
            // Otorgar 1 punto por caída manual suave (Soft Drop)
            score += 1;
            updateScore();
            draw();
            break;
        case 'ArrowUp':
        case 'x':
        case 'X':
            playerRotate();
            draw();
            break;
        case ' ': // Espacio
            playerHardDrop();
            draw();
            break;
    }
});

// Botones de la interfaz
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
restartBtnOverlay.addEventListener('click', startGame);

// Dibujar pantalla negra inicial con cuadrícula vacía al cargar la página
draw();

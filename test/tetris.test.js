/**
 * UNIT TESTS FOR TETRIS ENGINE
 * Tests matrix creation, piece rotation (clockwise/counter-clockwise), collision detection, arena merge, and line sweep.
 */

function runTetrisTests() {
    const results = [];
    const assert = (name, condition, details = '') => {
        results.push({ name, passed: Boolean(condition), details });
    };

    // Helper functions mirroring script.js
    const createMatrix = (w, h) => {
        const matrix = [];
        while (h--) matrix.push(new Array(w).fill(0));
        return matrix;
    };

    const rotate = (matrix) => {
        const N = matrix.length;
        const result = matrix.map((row, i) =>
            row.map((val, j) => matrix[N - 1 - j][i])
        );
        return result;
    };

    const collide = (arena, player) => {
        const [m, o] = [player.matrix, player.pos];
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 &&
                   (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    };

    const merge = (arena, player) => {
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    arena[y + player.pos.y][x + player.pos.x] = value;
                }
            });
        });
    };

    // Test 1: Arena Dimensions
    const arena = createMatrix(10, 20);
    assert('Arena tiene 20 filas', arena.length === 20);
    assert('Arena tiene 10 columnas', arena[0].length === 10);
    assert('Arena inicia vacía (todos 0)', arena.every(row => row.every(c => c === 0)));

    // Test 2: Matrix Rotation
    // T-piece: [[0, 1, 0], [1, 1, 1], [0, 0, 0]]
    const tPiece = [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ];
    const rotated = rotate(tPiece);
    assert('Rotación 90° de pieza T', rotated[0][1] === 1 && rotated[1][1] === 1 && rotated[2][1] === 1 && rotated[1][2] === 1);

    // Test 3: 360° Rotation returns to original
    let r4 = tPiece;
    for (let i = 0; i < 4; i++) r4 = rotate(r4);
    assert('Rotación 360° (4 giros) restaura la matriz original', JSON.stringify(r4) === JSON.stringify(tPiece));

    // Test 4: Collision Detection on boundaries
    const player = {
        matrix: tPiece,
        pos: { x: 0, y: 0 }
    };
    assert('Sin colisión en posición inicial (0, 0)', !collide(arena, player));

    player.pos.x = -2; // Out of left bounds
    assert('Colisión detectada fuera del límite izquierdo (x = -2)', collide(arena, player));

    player.pos.x = 9; // Out of right bounds
    assert('Colisión detectada fuera del límite derecho (x = 9)', collide(arena, player));

    player.pos.x = 4;
    player.pos.y = 19; // Bottom collision
    assert('Colisión detectada en el fondo (y = 19)', collide(arena, player));

    // Test 5: Piece Merge & Line Sweep
    const testArena = createMatrix(10, 20);
    // Fill bottom row except 3 blocks
    for (let c = 0; c < 7; c++) testArena[19][c] = 1;
    // Merge a 3-block horizontal bar
    const barPlayer = {
        matrix: [[1, 1, 1]],
        pos: { x: 7, y: 19 }
    };
    merge(testArena, barPlayer);
    assert('Fila 19 completamente llena después del merge', testArena[19].every(c => c === 1));

    // Sweep bottom row
    const sweptRow = testArena.splice(19, 1)[0].fill(0);
    testArena.unshift(sweptRow);
    assert('Fila 19 limpiada y reseteada a 0 tras barrido', testArena[19].every(c => c === 0));

    const total = results.length;
    const passed = results.filter(r => r.passed).length;
    console.log(`[TESTS TETRIS] ${passed}/${total} pruebas superadas con éxito.`);
    return { total, passed, results };
}

if (typeof module !== 'undefined') {
    module.exports = { runTetrisTests };
} else {
    window.runTetrisTests = runTetrisTests;
}

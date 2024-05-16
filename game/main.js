import { Tetris } from './tetris.js';
import {
  convertPositionToIndex,
  PLAYFIELD_COLUMNS,
  PLAYFIELD_ROWS,
  SAD,
} from './utilities.js';

const MOVE_DOWN_DELAY = 700;
const GAME_OVER_ANIMATION_DELAY = 1000;
const CELL_HIDE_DELAY = 10;
const CELL_REMOVE_CLASS_DELAY = 500;

let requestId;
let timeoutId;
let isPaused = false;

const tetris = new Tetris();
const cells = document.querySelectorAll('.grid>div');

const keyActions = new Map([
  ['ArrowUp', rotate],
  ['ArrowDown', moveDown],
  ['ArrowLeft', moveLeft],
  ['ArrowRight', moveRight],
  [' ', dropDown],
]);

initKeydown();

moveDown();

function initKeydown() {
  document.addEventListener('keydown', keyActions);
}

function moveDown() {
  tetris.moveTetrominoDown();
  draw();
  stopLoop();
  startLoop();

  if (tetris.isGameOver) {
    gameOver();
  }
}

function moveLeft() {
  tetris.moveTetrominoLeft();
  draw();
}

function moveRight() {
  tetris.moveTetrominoRight();
  draw();
}

function rotate() {
  tetris.rotateTetromino();
  draw();
}

function dropDown() {
  tetris.dropTetrominoDown();
  draw();
  stopLoop();
  startLoop();

  if (tetris.isGameOver) {
    gameOver();
  }
}

function startLoop() {
  timeoutId = setTimeout(
    () => (requestId = requestAnimationFrame(moveDown)),
    MOVE_DOWN_DELAY,
  );
}

function stopLoop() {
  cancelAnimationFrame(requestId);
  clearTimeout(timeoutId);
}

function draw() {
  cells.forEach((cell) => cell.removeAttribute('class'));
  drawPlayfield();
  drawTetromino();
  drawGhostTetromino();
  document.getElementById(
    'cleared-lines-counter',
  ).textContent = `Cleared Lines: ${tetris.clearedLines}`;
}

function drawPlayfield() {
  for (let row = 0; row < PLAYFIELD_ROWS; row++) {
    for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
      if (!tetris.playField[row][column]) continue;
      const name = tetris.playField[row][column];
      const cellIndex = convertPositionToIndex(row, column);
      cells[cellIndex].classList.add(name);
    }
  }
}

function drawTetromino() {
  const name = tetris.tetromino.name;
  const tetrominoMatrixSize = tetris.tetromino.matrix.length;
  for (let row = 0; row < tetrominoMatrixSize; row++) {
    for (let column = 0; column < tetrominoMatrixSize; column++) {
      if (!tetris.tetromino.matrix[row][column]) continue;
      if (tetris.tetromino.row + row < 0) continue;
      const cellIndex = convertPositionToIndex(
        tetris.tetromino.row + row,
        tetris.tetromino.column + column,
      );
      cells[cellIndex].classList.add(name);
    }
  }
}

function drawGhostTetromino() {
  const tetrominoMatrixSize = tetris.tetromino.matrix.length;
  for (let row = 0; row < tetrominoMatrixSize; row++) {
    for (let column = 0; column < tetrominoMatrixSize; column++) {
      if (!tetris.tetromino.matrix[row][column]) continue;
      if (tetris.tetromino.ghostRow + row < 0) continue;
      const cellRow = tetris.tetromino.ghostRow + row;
      const cellColumn = tetris.tetromino.ghostColumn + column;
      const cellIndex = convertPositionToIndex(cellRow, cellColumn);
      cells[cellIndex].classList.add('ghost');
    }
  }
}

function gameOver() {
  stopLoop();
  document.removeEventListener('keydown', keyActions);
  gameOverAnimation();
}

function gameOverAnimation() {
  const filledCells = [...cells].filter((cell) => cell.classList.length > 0);
  for (const [i, cell] of filledCells.entries()) {
    setTimeout(() => cell.classList.add('hide'), i * CELL_HIDE_DELAY);
    setTimeout(
      () => cell.removeAttribute('class'),
      i * CELL_HIDE_DELAY + CELL_REMOVE_CLASS_DELAY,
    );
  }

  setTimeout(
    drawSad,
    filledCells.length * CELL_HIDE_DELAY + GAME_OVER_ANIMATION_DELAY,
  );
}

function drawSad() {
  const TOP_OFFSET = 5;
  for (let row = 0; row < SAD.length; row++) {
    for (let column = 0; column < SAD[0].length; column++) {
      if (!SAD[row][column]) continue;
      const cellIndex = convertPositionToIndex(TOP_OFFSET + row, column);
      cells[cellIndex].classList.add('sad');
    }
  }
}

function pause() {
  isPaused = !isPaused;
  if (isPaused) {
    stopLoop();
  } else {
    startLoop();
  }
}

document.addEventListener('keydown', (event) => {
  if (event.code === 'Escape') {
    pause();
  }
});

document.addEventListener('keydown', (event) => {
  if (!isPaused) {
    const action = keyActions.get(event.key);
    if (action) {
      action();
    }
  }
});

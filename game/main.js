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
let isPaused = true;
let tetris;
let isGameStarted = false;

const player = {
  name: '',
  record: 0,
};

const restartButton = document.getElementById('restartButton');
const cells = document.querySelectorAll('.grid>div');

const startBtn = document.querySelector('.start');
const background = document.querySelector('.background');
const name = document.querySelector("input[type='text']");
const profileButton = document.getElementById('profileButton');
const profileModal = document.getElementById('profileModal');
const playerNameSpan = document.getElementById('playerName');
const playerRecordSpan = document.getElementById('playerRecord');

const keyActions = new Map([
  ['ArrowUp', rotate],
  ['ArrowDown', moveDown],
  ['ArrowLeft', moveLeft],
  ['ArrowRight', moveRight],
  [' ', dropDown],
]);

initKeydown();
initEventListeners();

function initKeydown() {
  document.addEventListener('keydown', (event) => {
    if (document.activeElement !== name && isGameStarted) {
      if (event.code === 'Escape') {
        pause();
      } else if (!isPaused) {
        const action = keyActions.get(event.key);
        if (action) {
          action();
        }
      }
    }
  });
}

function initEventListeners() {
  startBtn.addEventListener('click', (event) => {
    event.preventDefault();
    if (player.name.trim() !== '') {
      startGame();
      background.classList.add('close');
      isPaused = false;
      isGameStarted = true;
      startLoop();
    } else {
      alert('Please enter your name to start the game.');
    }
  });
}

function startGame() {
  tetris = new Tetris();
  isPaused = false;
  draw();
  startLoop();
}

function moveDown() {
  if (isPaused) return;
  tetris.moveTetrominoDown();
  draw();
  stopLoop();
  startLoop();

  if (tetris.isGameOver) {
    gameOver();
  }
}

function moveLeft() {
  if (isPaused) return;
  tetris.moveTetrominoLeft();
  draw();
}

function moveRight() {
  if (isPaused) return;
  tetris.moveTetrominoRight();
  draw();
}

function rotate() {
  if (isPaused) return;
  tetris.rotateTetromino();
  draw();
}

function dropDown() {
  if (isPaused) return;
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
    'score-counter',
  ).textContent = `Score: ${tetris.clearedLines}`;
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
  updateRecord();
  gameOverAnimation();
}

function updateRecord() {
  if (tetris.clearedLines > player.record) {
    player.record = tetris.clearedLines;
    alert('New record!');
  }
  playerRecordSpan.textContent = player.record;
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

  setTimeout(() => {
    drawSad();
    showRestartButton();
  }, filledCells.length * CELL_HIDE_DELAY + GAME_OVER_ANIMATION_DELAY);
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

function showRestartButton() {
  restartButton.style.display = 'block';
}

function resetGame() {
  restartButton.style.display = 'none';
  tetris = new Tetris();
  cells.forEach((cell) => cell.removeAttribute('class'));
  isPaused = false;
  isGameStarted = true;
  startGame();
}

restartButton.addEventListener('click', resetGame);

function pause() {
  isPaused = !isPaused;
  if (isPaused) {
    stopLoop();
  } else {
    startLoop();
  }
}

startBtn.addEventListener('click', (event) => {
  event.preventDefault();
  background.classList.add('close');
  isPaused = false;
  startLoop();
});

name.addEventListener('input', (event) => {
  player.name = event.target.value;
});

function openProfile() {
  if (!isPaused) {
    pause();
  }
  profileModal.style.display = 'block';
  playerNameSpan.textContent = player.name || 'Unknown';
  playerRecordSpan.textContent = player.record || '0';
}

profileButton.addEventListener('click', () => {
  if (!isPaused) {
    pause();
  }
  profileModal.style.display = 'block';
  playerNameSpan.textContent = player.name || 'Unknown';
  playerRecordSpan.textContent = player.record || '0';
});

window.addEventListener('keydown', (event) => {
  if (event.code === 'Escape') {
    if (profileModal.style.display === 'block') {
      profileModal.style.display = 'none';
    } else {
      openProfile();
    }
  }
});

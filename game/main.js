import { Tetris } from './tetris.js';
import {
  convertPositionToIndex,
  PLAYFIELD_COLUMNS,
  PLAYFIELD_ROWS,
  SAD,
  GAME_OVER_ANIMATION_DELAY,
  CELL_HIDE_DELAY,
  CELL_REMOVE_CLASS_DELAY,
  player,
  restartButton,
  cells,
  startBtn,
  background,
  name,
  profileButton,
  profileModal,
  playerNameSpan,
  playerRecordSpan,
} from './utilities.js';

const gameState = {
  requestId: null,
  timeoutId: null,
  isPaused: true,
  tetris: null,
  isGameStarted: false,
  moveDownDelay: 700,
  level: 0,
};

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
    if (document.activeElement !== name && gameState.isGameStarted) {
      if (event.code === 'Escape') {
        pause();
      } else if (!gameState.isPaused) {
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
      gameState.isPaused = false;
      gameState.isGameStarted = true;
      startLoop();
    } else {
      alert('Please enter your name to start the game.');
    }
  });
}

function startGame() {
  gameState.tetris = new Tetris();
  gameState.isPaused = false;
  gameState.level = 0;
  gameState.moveDownDelay = 700;
  draw();
  startLoop();
}

function moveDown() {
  if (gameState.isPaused) return;
  gameState.tetris.moveTetrominoDown();
  draw();
  stopLoop();
  startLoop();

  if (gameState.tetris.isGameOver) {
    gameOver();
  }
}

function moveLeft() {
  if (gameState.isPaused) return;
  gameState.tetris.moveTetrominoLeft();
  draw();
}

function moveRight() {
  if (gameState.isPaused) return;
  gameState.tetris.moveTetrominoRight();
  draw();
}

function rotate() {
  if (gameState.isPaused) return;
  gameState.tetris.rotateTetromino();
  draw();
}

function dropDown() {
  if (gameState.isPaused) return;
  gameState.tetris.dropTetrominoDown();
  draw();
  stopLoop();
  startLoop();

  if (gameState.tetris.isGameOver) {
    gameOver();
  }
}

function startLoop() {
  if (levelUp()) {
    clearTimeout(gameState.timeoutId);
  }
  gameState.timeoutId = setTimeout(() => {
    gameState.requestId = requestAnimationFrame(moveDown);
  }, gameState.moveDownDelay);
  console.log(gameState.moveDownDelay);
}

function stopLoop() {
  cancelAnimationFrame(gameState.requestId);
  clearTimeout(gameState.timeoutId);
}

function draw() {
  cells.forEach((cell) => cell.removeAttribute('class'));
  drawPlayfield();
  drawTetromino();
  drawGhostTetromino();
  document.getElementById(
    'score-counter',
  ).textContent = `Score: ${gameState.tetris.clearedLines}`;
}

function drawPlayfield() {
  for (let row = 0; row < PLAYFIELD_ROWS; row++) {
    for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
      if (!gameState.tetris.playField[row][column]) continue;
      const name = gameState.tetris.playField[row][column];
      const cellIndex = convertPositionToIndex(row, column);
      cells[cellIndex].classList.add(name);
    }
  }
}

function drawTetromino() {
  const name = gameState.tetris.tetromino.name;
  const tetrominoMatrixSize = gameState.tetris.tetromino.matrix.length;
  for (let row = 0; row < tetrominoMatrixSize; row++) {
    for (let column = 0; column < tetrominoMatrixSize; column++) {
      if (!gameState.tetris.tetromino.matrix[row][column]) continue;
      if (gameState.tetris.tetromino.row + row < 0) continue;
      const cellIndex = convertPositionToIndex(
        gameState.tetris.tetromino.row + row,
        gameState.tetris.tetromino.column + column,
      );
      cells[cellIndex].classList.add(name);
    }
  }
}

function drawGhostTetromino() {
  const tetrominoMatrixSize = gameState.tetris.tetromino.matrix.length;
  for (let row = 0; row < tetrominoMatrixSize; row++) {
    for (let column = 0; column < tetrominoMatrixSize; column++) {
      if (!gameState.tetris.tetromino.matrix[row][column]) continue;
      if (gameState.tetris.tetromino.ghostRow + row < 0) continue;
      const cellRow = gameState.tetris.tetromino.ghostRow + row;
      const cellColumn = gameState.tetris.tetromino.ghostColumn + column;
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
  if (gameState.tetris.clearedLines > player.record) {
    player.record = gameState.tetris.clearedLines;
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
  gameState.tetris = new Tetris();
  cells.forEach((cell) => cell.removeAttribute('class'));
  gameState.isPaused = false;
  gameState.isGameStarted = true;
  startGame();
}

restartButton.addEventListener('click', resetGame);

function pause() {
  gameState.isPaused = !gameState.isPaused;
  if (gameState.isPaused) {
    stopLoop();
  } else {
    startLoop();
  }
}

function levelUp() {
  const newLevel = Math.floor(gameState.tetris.clearedLines / 10);
  if (newLevel > gameState.level) {
    gameState.level = newLevel;
    gameState.moveDownDelay = Math.max(400, gameState.moveDownDelay - 30);
    return true;
  }
  return false;
}

name.addEventListener('input', (event) => {
  player.name = event.target.value;
});

function openProfile() {
  if (!gameState.isPaused) {
    pause();
  }
  profileModal.style.display = 'block';
  playerNameSpan.textContent = player.name || 'Unknown';
  playerRecordSpan.textContent = player.record || '0';
}

profileButton.addEventListener('click', openProfile);

window.addEventListener('keydown', (event) => {
  if (event.code === 'Escape') {
    if (profileModal.style.display === 'block') {
      profileModal.style.display = 'none';
    } else {
      openProfile();
    }
  }
});

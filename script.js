const grid = document.getElementById("grid");
const scoreDisplay = document.getElementById("score");
const bestScoreDisplay = document.getElementById("best-score");
const gameOverEl = document.getElementById("game-over");

let squares = [];
let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;

// Oyunu başlat
function startGame() {
  grid.innerHTML = "";
  squares = [];
  score = 0;
  scoreDisplay.innerText = "Score: " + score;
  bestScoreDisplay.innerText = "Best Score: " + bestScore;
  gameOverEl.style.display = "none";

  for (let i = 0; i < 16; i++) {
    let square = document.createElement("div");
    square.classList.add("cell");
    square.innerText = "";
    square.setAttribute("data-value", 0);
    grid.appendChild(square);
    squares.push(square);
  }
  generate();
  generate();
  updateBoard();
}

// Yeni rəqəm yarat
function generate() {
  let emptySquares = squares.filter(sq => sq.getAttribute("data-value") == 0);
  if (emptySquares.length === 0) return;
  let randomSquare = emptySquares[Math.floor(Math.random() * emptySquares.length)];
  randomSquare.setAttribute("data-value", Math.random() > 0.1 ? 2 : 4);
}

// Lövhəni yenilə
function updateBoard() {
  squares.forEach(square => {
    let val = square.getAttribute("data-value");
    square.innerText = val == 0 ? "" : val;
    square.className = "cell";
    square.setAttribute("data-value", val);
  });
}

// Hərəkət funksiyaları (moveRight, moveLeft, moveUp, moveDown)
function moveRight() {
  for (let i = 0; i < 16; i += 4) {
    let row = squares.slice(i, i + 4).map(sq => parseInt(sq.getAttribute("data-value")));
    let filteredRow = row.filter(num => num);
    let missing = 4 - filteredRow.length;
    let newRow = Array(missing).fill(0).concat(filteredRow);
    for (let j = 0; j < 4; j++) {
      squares[i + j].setAttribute("data-value", newRow[j]);
    }
  }
}
function moveLeft() {
  for (let i = 0; i < 16; i += 4) {
    let row = squares.slice(i, i + 4).map(sq => parseInt(sq.getAttribute("data-value")));
    let filteredRow = row.filter(num => num);
    let missing = 4 - filteredRow.length;
    let newRow = filteredRow.concat(Array(missing).fill(0));
    for (let j = 0; j < 4; j++) {
      squares[i + j].setAttribute("data-value", newRow[j]);
    }
  }
}
function moveUp() {
  for (let i = 0; i < 4; i++) {
    let column = [0, 1, 2, 3].map(x => parseInt(squares[i + x * 4].getAttribute("data-value")));
    let filteredCol = column.filter(num => num);
    let missing = 4 - filteredCol.length;
    let newCol = filteredCol.concat(Array(missing).fill(0));
    for (let j = 0; j < 4; j++) {
      squares[i + j * 4].setAttribute("data-value", newCol[j]);
    }
  }
}
function moveDown() {
  for (let i = 0; i < 4; i++) {
    let column = [0, 1, 2, 3].map(x => parseInt(squares[i + x * 4].getAttribute("data-value")));
    let filteredCol = column.filter(num => num);
    let missing = 4 - filteredCol.length;
    let newCol = Array(missing).fill(0).concat(filteredCol);
    for (let j = 0; j < 4; j++) {
      squares[i + j * 4].setAttribute("data-value", newCol[j]);
    }
  }
}

// Birləşmə funksiyaları
function combineRow() {
  for (let i = 0; i < 16; i++) {
    if (i % 4 !== 3) {
      let current = parseInt(squares[i].getAttribute("data-value"));
      let next = parseInt(squares[i + 1].getAttribute("data-value"));
      if (current !== 0 && current === next) {
        let newVal = current + next;
        squares[i].setAttribute("data-value", newVal);
        squares[i + 1].setAttribute("data-value", 0);
        score += newVal;
        updateScore();
      }
    }
  }
}
function combineColumn() {
  for (let i = 0; i < 12; i++) {
    let current = parseInt(squares[i].getAttribute("data-value"));
    let next = parseInt(squares[i + 4].getAttribute("data-value"));
    if (current !== 0 && current === next) {
      let newVal = current + next;
      squares[i].setAttribute("data-value", newVal);
      squares[i + 4].setAttribute("data-value", 0);
      score += newVal;
      updateScore();
    }
  }
}

// Score-u yenilə
function updateScore() {
  scoreDisplay.innerText = "Score: " + score;
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("bestScore", bestScore);
    bestScoreDisplay.innerText = "Best Score: " + bestScore;
  }
}

// Klaviatura
function control(e) {
  let moved = false;
  if (e.keyCode === 39) { moveRight(); combineRow(); moveRight(); moved = true; }
  else if (e.keyCode === 37) { moveLeft(); combineRow(); moveLeft(); moved = true; }
  else if (e.keyCode === 38) { moveUp(); combineColumn(); moveUp(); moved = true; }
  else if (e.keyCode === 40) { moveDown(); combineColumn(); moveDown(); moved = true; }

  if (moved) {
    generate();
    updateBoard();
    checkGameOver();
  }
}
document.addEventListener("keyup", control);

// Mobil swipe
let touchStartX = 0, touchStartY = 0;
document.addEventListener("touchstart", e => {
  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;
});
document.addEventListener("touchend", e => {
  let dx = e.changedTouches[0].screenX - touchStartX;
  let dy = e.changedTouches[0].screenY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 50) control({keyCode: 39});
    else if (dx < -50) control({keyCode: 37});
  } else {
    if (dy > 50) control({keyCode: 40});
    else if (dy < -50) control({keyCode: 38});
  }
});

// Game Over yoxlama
function checkGameOver() {
  let emptySquares = squares.filter(sq => sq.getAttribute("data-value") == 0);
  if (emptySquares.length > 0) return;

  for (let i = 0; i < 16; i++) {
    let val = parseInt(squares[i].getAttribute("data-value"));
    if ((i % 4 !== 3 && val === parseInt(squares[i + 1].getAttribute("data-value"))) ||
        (i < 12 && val === parseInt(squares[i + 4].getAttribute("data-value")))) {
      return; // hərəkət mümkündür
    }
  }
  gameOverEl.style.display = "block";
}

startGame();

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas size
canvas.width = 800;
canvas.height = 500;

// Game objects
const paddleWidth = 100;
const paddleHeight = 10;
const ballSize = 8;

let playerPaddle = {
  x: canvas.width / 2 - paddleWidth / 2,
  y: canvas.height - paddleHeight - 10,
  speed: 8,
  score: 0,
};

let computerPaddle = {
  x: canvas.width / 2 - paddleWidth / 2,
  y: 10,
  speed: 7, // Increased from 5 to 7
  score: 0,
  difficulty: 0.8, // New property to control AI perfection (0 to 1)
};

let ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  speedX: 5,
  speedY: 5,
  baseSpeed: 5,
  maxSpeed: 15,
  speedIncrease: 0.5,
};

// Input handling
let rightPressed = false;
let leftPressed = false;

document.addEventListener("keydown", (e) => {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
  if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
});

document.addEventListener("keyup", (e) => {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
  if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
});

canvas.addEventListener("mousemove", (e) => {
  const relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    playerPaddle.x = relativeX - paddleWidth / 2;
  }
});

// Game functions
function drawPaddle(x, y) {
  ctx.fillStyle = "#0ff";
  ctx.fillRect(x, y, paddleWidth, paddleHeight);
  ctx.strokeStyle = "#fff";
  ctx.strokeRect(x, y, paddleWidth, paddleHeight);
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ballSize, 0, Math.PI * 2);
  ctx.fillStyle = "#0ff";
  ctx.fill();
  ctx.closePath();
}

function updateScore() {
  document.getElementById("computer-score").textContent = computerPaddle.score;
  document.getElementById("player-score").textContent = playerPaddle.score;
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.speedX = ball.baseSpeed * (Math.random() > 0.5 ? 1 : -1);
  ball.speedY = ball.baseSpeed;
}

function handlePaddleCollision(paddle, paddleY) {
  if (
    ball.y >= paddleY - ballSize &&
    ball.y <= paddleY + paddleHeight + ballSize &&
    ball.x >= paddle.x &&
    ball.x <= paddle.x + paddleWidth
  ) {
    ball.speedY = -ball.speedY;

    // Increase speed with each paddle hit
    const currentSpeed = Math.sqrt(
      ball.speedX * ball.speedX + ball.speedY * ball.speedY,
    );
    if (currentSpeed < ball.maxSpeed) {
      const multiplier = (currentSpeed + ball.speedIncrease) / currentSpeed;
      ball.speedX *= multiplier;
      ball.speedY *= multiplier;
    }

    // Add some randomness to the x direction
    ball.speedX += (Math.random() - 0.5) * 2;

    return true;
  }
  return false;
}

function update() {
  // Move player paddle
  if (rightPressed && playerPaddle.x < canvas.width - paddleWidth) {
    playerPaddle.x += playerPaddle.speed;
  }
  if (leftPressed && playerPaddle.x > 0) {
    playerPaddle.x -= playerPaddle.speed;
  }

  // Move computer paddle
  const paddleCenter = computerPaddle.x + paddleWidth / 2;
  const predictedX =
    ball.x + (ball.y - computerPaddle.y) * (ball.speedX / ball.speedY);

  // Add randomness to prediction based on difficulty
  const randomError =
    (1 - computerPaddle.difficulty) * (Math.random() * 100 - 50);
  const targetX =
    ball.speedY < 0 ? predictedX + randomError : ball.x + randomError;

  // Adjust speed based on distance to make it more responsive
  const distance = Math.abs(paddleCenter - targetX);
  const adjustedSpeed = Math.min(
    computerPaddle.speed * (distance / 100),
    computerPaddle.speed,
  );

  if (paddleCenter < targetX - 5) {
    computerPaddle.x += adjustedSpeed;
  }
  if (paddleCenter > targetX + 5) {
    computerPaddle.x -= adjustedSpeed;
  }

  // Keep paddles within bounds
  computerPaddle.x = Math.max(
    0,
    Math.min(canvas.width - paddleWidth, computerPaddle.x),
  );

  // Move ball
  ball.x += ball.speedX;
  ball.y += ball.speedY;

  // Wall collision
  if (ball.x >= canvas.width - ballSize || ball.x <= ballSize) {
    ball.speedX = -ball.speedX;
  }

  // Paddle collision
  handlePaddleCollision(playerPaddle, playerPaddle.y);
  handlePaddleCollision(computerPaddle, computerPaddle.y);

  // Score points
  if (ball.y <= 0) {
    playerPaddle.score++;
    updateScore();
    resetBall();
  } else if (ball.y >= canvas.height) {
    computerPaddle.score++;
    updateScore();
    resetBall();
  }
}

function draw() {
  // Clear canvas
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw center line
  ctx.setLineDash([5, 15]);
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.strokeStyle = "#333";
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw game objects
  drawPaddle(playerPaddle.x, playerPaddle.y);
  drawPaddle(computerPaddle.x, computerPaddle.y);
  drawBall();
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Start the game
resetBall();
gameLoop();

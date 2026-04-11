const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const box = 20;
let snake = [{ x: 9 * box, y: 10 * box }];
let direction = "RIGHT";
let score = 0;

// Food (safe data)
let food = spawnItem();

// Threat (cyber attack)
let threat = spawnItem();

document.addEventListener("keydown", event => {
  if (event.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  else if (event.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  else if (event.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
  else if (event.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
});

function spawnItem() {
  return {
    x: Math.floor(Math.random() * (canvas.width / box)) * box,
    y: Math.floor(Math.random() * (canvas.height / box)) * box
  };
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw snake
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? "#4CAF50" : "#8BC34A";
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }

  // Draw food
  ctx.fillStyle = "green";
  ctx.fillRect(food.x, food.y, box, box);

  // Draw threat
  ctx.fillStyle = "red";
  ctx.fillRect(threat.x, threat.y, box, box);

  // Snake movement
  let snakeX = snake[0].x;
  let snakeY = snake[0].y;

  if (direction === "LEFT") snakeX -= box;
  if (direction === "UP") snakeY -= box;
  if (direction === "RIGHT") snakeX += box;
  if (direction === "DOWN") snakeY += box;

  // If snake eats food
  if (snakeX === food.x && snakeY === food.y) {
    score++;
    food = spawnItem();
  } else {
    snake.pop();
  }

  // If snake hits threat
  if (snakeX === threat.x && snakeY === threat.y) {
    alert("Game Over! You hit a cybersecurity threat!");
    document.location.reload();
  }

  // Add new head
  let newHead = { x: snakeX, y: snakeY };

  // Game over conditions
  if (
    snakeX < 0 || snakeY < 0 ||
    snakeX >= canvas.width || snakeY >= canvas.height ||
    collision(newHead, snake)
  ) {
    alert("Game Over! Your data was compromised.");
    document.location.reload();
  }

  snake.unshift(newHead);

  // Score
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, box, box);
}

function collision(head, array) {
  for (let i = 0; i < array.length; i++) {
    if (head.x === array[i].x && head.y === array[i].y) {
      return true;
    }
  }
  return false;
}

setInterval(draw, 100);

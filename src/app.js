function initGame() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 40; // Adjust height to account for header

    const cellSize = 40; // Größe der Zellen (Wände, Spieler, Fallen)
    const maze = generateMaze(canvas.width, canvas.height, cellSize);
    const traps = placeTraps(maze);
    let player = { x: 1, y: 1 };
    let exit = { x: Math.floor(canvas.width / cellSize) - 2, y: Math.floor(canvas.height / cellSize) - 2 };
    let timeLimit = 60; // 60 seconds
    let score = 0;
    let gameInterval;

    const scoreElement = document.getElementById('score');
    const timeElement = document.getElementById('time');

    function startTimer() {
        gameInterval = setInterval(() => {
            timeLimit--;
            timeElement.textContent = `Time left: ${timeLimit}`;
            if (timeLimit <= 0) {
                clearInterval(gameInterval);
                alert('Time is up! Game Over!');
                resetGame();
            }
        }, 1000);
    }

    function resetGame() {
        player = { x: 1, y: 1 };
        timeLimit = 60;
        score = 0;
        scoreElement.textContent = `Score: ${score}`;
        timeElement.textContent = `Time left: ${timeLimit}`;
        initGame();
    }

    function drawMaze() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw maze
        for (let y = 0; y < maze.length; y++) {
            for (let x = 0; x < maze[y].length; x++) {
                if (maze[y][x] === 1) {
                    ctx.fillStyle = 'black';
                    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize); // Draw walls
                }
            }
        }
        // Draw player
        ctx.fillStyle = 'green';
        ctx.font = `${cellSize}px Arial`;
        ctx.fillText('🐍', player.x * cellSize, player.y * cellSize + cellSize);
        // Draw traps
        ctx.fillStyle = 'red';
        traps.forEach(trap => {
            ctx.fillRect(trap.x * cellSize, trap.y * cellSize, cellSize, cellSize);
        });
        // Draw exit
        ctx.fillStyle = 'blue';
        ctx.fillRect(exit.x * cellSize, exit.y * cellSize, cellSize, cellSize);
    }

    function placeTraps(maze) {
        const traps = [];
        const rows = maze.length;
        const cols = maze[0].length;

        for (let i = 0; i < 10; i++) { // Place 10 traps
            let x, y;
            do {
                x = Math.floor(Math.random() * cols);
                y = Math.floor(Math.random() * rows);
            } while (maze[y][x] !== 0 || (x === 1 && y === 1)); // Ensure trap is placed on a path and not at the start

            traps.push({ x, y });
        }

        return traps;
    }

    function generateMaze(width, height, cellSize) {
        const rows = Math.floor(height / cellSize);
        const cols = Math.floor(width / cellSize);
        const maze = Array.from({ length: rows }, () => Array(cols).fill(1));

        function carvePassagesFrom(cx, cy) {
            const directions = [
                [0, -1], // up
                [1, 0],  // right
                [0, 1],  // down
                [-1, 0]  // left
            ];
            directions.sort(() => Math.random() - 0.5);

            directions.forEach(([dx, dy]) => {
                const nx = cx + dx * 2;
                const ny = cy + dy * 2;

                if (ny >= 0 && ny < rows && nx >= 0 && nx < cols && maze[ny][nx] === 1) {
                    maze[ny][nx] = 0;
                    maze[cy + dy][cx + dx] = 0;
                    carvePassagesFrom(nx, ny);
                }
            });
        }

        maze[1][1] = 0;
        carvePassagesFrom(1, 1);
        maze[rows - 2][cols - 2] = 0;

        // Ensure there are at least 3 possible solutions
        for (let i = 0; i < 3; i++) {
            let x = 1, y = 1;
            while (x < cols - 2 && y < rows - 2) {
                maze[y][x] = 0;
                if (Math.random() > 0.5) {
                    x++;
                } else {
                    y++;
                }
            }
        }

        return maze;
    }

    function checkCollision() {
        // Check for collisions with walls
        if (maze[player.y][player.x] === 1) {
            alert('You hit a wall! Game Over!');
            resetGame();
        }

        // Check for collisions with traps
        traps.forEach(trap => {
            if (player.x === trap.x && player.y === trap.y) {
                alert('You hit a trap! Game Over!');
                resetGame();
            }
        });

        // Check if player reached the exit
        if (player.x === exit.x && player.y === exit.y) {
            alert('You reached the exit! You win!');
            score += 100; // Increase score
            scoreElement.textContent = `Score: ${score}`;
            resetGame();
        }
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp' && player.y > 0 && maze[player.y - 1][player.x] === 0) player.y--;
        if (e.key === 'ArrowDown' && player.y < maze.length - 1 && maze[player.y + 1][player.x] === 0) player.y++;
        if (e.key === 'ArrowLeft' && player.x > 0 && maze[player.y][player.x - 1] === 0) player.x--;
        if (e.key === 'ArrowRight' && player.x < maze[0].length - 1 && maze[player.y][player.x + 1] === 0) player.x++;
        checkCollision();
        drawMaze();
    });

    startTimer();
    drawMaze();
}

window.onload = initGame;
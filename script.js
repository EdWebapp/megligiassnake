// --- ELEMENTOS DO DOM ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const startScreen = document.getElementById('start-screen');
const screenTitle = document.getElementById('screen-title');
const modeButtons = document.querySelectorAll('.mode-btn');

// --- EFEITOS SONOROS ---
const eatSound = document.getElementById('eat-sound');
const gameOverSound = document.getElementById('gameover-sound');

// --- CONFIGURAÇÕES E VARIÁVEIS DO JOGO ---
const gridSize = 40;
const tileCount = canvas.width / gridSize;
let snake, food, velocity, score, highScore = 0, gameOver, gameInterval, gameStarted = false, gameMode;

// --- VARIÁVEIS PARA CONTROLE DE GESTOS ---
let touchStartX = 0, touchStartY = 0, touchEndX = 0, touchEndY = 0;

// --- FUNÇÕES DE SOM (para garantir que o som toque do início) ---
function playSound(sound) {
    sound.currentTime = 0;
    sound.play();
}

// --- FUNÇÕES DO JOGO ---

function loadHighScore() {
    const savedHighScore = localStorage.getItem('snakeHighScore');
    if (savedHighScore) {
        highScore = parseInt(savedHighScore);
    }
    highScoreElement.innerText = `Recorde: ${highScore}`;
}

function saveHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreElement.innerText = `Recorde: ${highScore}`;
    }
}

function resetGame() {
    snake = [{ x: 7, y: 7 }];
    food = { x: 12, y: 12 };
    velocity = { x: 0, y: 0 };
    score = 0;
    gameOver = false;
    gameStarted = true;
    scoreElement.innerText = "Pontuação: 0";
    generateFood();
}

function startGame(selectedMode) {
    gameMode = selectedMode;
    resetGame();
    startScreen.style.display = 'none';
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 150);
}

function gameLoop() {
    if (gameOver) {
        playSound(gameOverSound);
        saveHighScore();
        clearInterval(gameInterval);
        showEndScreen();
        return;
    }
    update();
    draw();
}

function showEndScreen() {
    gameStarted = false;
    startScreen.style.display = 'flex';
    screenTitle.innerText = "Perdeu mané!";
}

function update() {
    let head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };

    // --- LÓGICA DE MODOS DE JOGO ---
    if (gameMode === 'noWalls') { // Modo Sem Paredes
        if (head.x < 0) head.x = tileCount - 1;
        if (head.x >= tileCount) head.x = 0;
        if (head.y < 0) head.y = tileCount - 1;
        if (head.y >= tileCount) head.y = 0;
    } else { // Modo Clássico (padrão)
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            gameOver = true;
            return;
        }
    }

    // Colisão com o próprio corpo (igual para ambos os modos)
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver = true;
            return;
        }
    }

    snake.unshift(head);

    // Colisão com a comida
    if (head.x === food.x && head.y === food.y) {
        playSound(eatSound);
        score++;
        scoreElement.innerText = "Pontuação: " + score;
        generateFood();
    } else {
        snake.pop();
    }
}

function draw() {
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < snake.length; i++) {
        const segment = snake[i];
        const img = (i === 0) ? snakeHeadImg : snakeBodyImg;
        ctx.drawImage(img, segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    }
    ctx.drawImage(foodImg, food.x * gridSize, food.y * gridSize, gridSize, gridSize);
}

function generateFood() {
    let validPosition = false;
    while (!validPosition) {
        food.x = Math.floor(Math.random() * tileCount);
        food.y = Math.floor(Math.random() * tileCount);
        let collision = snake.some(seg => seg.x === food.x && seg.y === food.y);
        if (!collision) validPosition = true;
    }
}

// --- CONTROLES (Teclado e Gestos) ---
function setupControls() {
    document.addEventListener('keydown', e => {
        if (!gameStarted) return;
        switch (e.key) {
            case 'ArrowUp': case 'w': if (velocity.y === 0) velocity = { x: 0, y: -1 }; break;
            case 'ArrowDown': case 's': if (velocity.y === 0) velocity = { x: 0, y: 1 }; break;
            case 'ArrowLeft': case 'a': if (velocity.x === 0) velocity = { x: -1, y: 0 }; break;
            case 'ArrowRight': case 'd': if (velocity.x === 0) velocity = { x: 1, y: 0 }; break;
        }
    });

    canvas.addEventListener('touchstart', e => { e.preventDefault(); touchStartX = e.changedTouches[0].screenX; touchStartY = e.changedTouches[0].screenY; }, { passive: false });
    canvas.addEventListener('touchend', e => { e.preventDefault(); touchEndX = e.changedTouches[0].screenX; touchEndY = e.changedTouches[0].screenY; handleSwipe(); }, { passive: false });
}

// --- FUNÇÃO CORRIGIDA ---
function handleSwipe() {
    if (!gameStarted) return;
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    const threshold = 50;

    // Movimento horizontal: só se move se a cobra estiver se movendo na vertical
    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > threshold && velocity.y !== 0) {
            velocity = { x: diffX > 0 ? 1 : -1, y: 0 };
        }
    } 
    // Movimento vertical: só se move se a cobra estiver se movendo na horizontal
    else {
        if (Math.abs(diffY) > threshold && velocity.x !== 0) {
            velocity = { x: 0, y: diffY > 0 ? 1 : -1 };
        }
    }
}

// --- INICIALIZAÇÃO DO JOGO ---
function loadAssets() {
    const assets = [
        { img: snakeHeadImg, src: 'IMG_0031.jpeg' },
        { img: snakeBodyImg, src: 'IMG_0032.jpeg' },
        { img: foodImg, src: 'IMG_0032.jpeg' }
    ];
    let assetsLoaded = 0;
    
    // Nenhuma imagem é declarada aqui, então precisamos declará-las antes
    const snakeHeadImg = new Image();
    const snakeBodyImg = new Image();
    const foodImg = new Image();

    assets.forEach(asset => {
        asset.img.src = asset.src;
        asset.img.onload = () => {
            assetsLoaded++;
            if (assetsLoaded === assets.length) {
                // Habilita os botões do menu quando as imagens carregam
                modeButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        const selectedMode = button.dataset.mode;
                        startGame(selectedMode);
                    });
                });
                setupControls();
                loadHighScore();
            }
        };
        asset.img.onerror = () => { alert('Erro ao carregar imagens!'); };
    });
}

loadAssets();


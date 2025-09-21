// --- ELEMENTOS DO DOM ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-btn');
const screenTitle = document.getElementById('screen-title');

// --- CONFIGURAÇÕES E VARIÁVEIS DO JOGO ---
const gridSize = 40; // <-- AUMENTADO PARA IMAGENS MAIORES
const tileCount = canvas.width / gridSize;

let snake, food, velocity, score, gameOver, gameInterval, gameStarted = false;

// --- VARIÁVEIS PARA CONTROLE DE GESTOS ---
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

// --- CARREGAMENTO DE IMAGENS ---
const snakeHeadImg = new Image();
const snakeBodyImg = new Image();
const foodImg = new Image();

// --- FUNÇÕES DO JOGO ---

function resetGame() {
    snake = [{ x: 7, y: 7 }]; // Posição inicial ajustada para o novo grid
    food = { x: 12, y: 12 }; // Posição inicial ajustada
    velocity = { x: 0, y: 0 };
    score = 0;
    gameOver = false;
    gameStarted = true;
    scoreElement.innerText = "Pontuação: 0";
    generateFood();
}

function startGame() {
    resetGame();
    startScreen.style.display = 'none';
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 150);
}

function gameLoop() {
    if (gameOver) {
        clearInterval(gameInterval);
        showGameOverScreen();
        return;
    }
    update();
    draw();
}

function showGameOverScreen() {
    gameStarted = false;
    startScreen.style.display = 'flex';
    screenTitle.innerText = "Fim de Jogo!";
    startBtn.innerText = "Jogar Novamente";
}

function update() {
    const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };

    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver = true;
        return;
    }

    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver = true;
            return;
        }
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
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
        
        let collision = false;
        for (const segment of snake) {
            if (segment.x === food.x && segment.y === food.y) {
                collision = true;
                break;
            }
        }
        if (!collision) {
            validPosition = true;
        }
    }
}

// --- CONTROLES (TECLADO E GESTOS) ---
function setupControls() {
    // Controles de Teclado
    document.addEventListener('keydown', e => {
        if (!gameStarted) return;
        
        switch (e.key) {
            case 'ArrowUp': case 'w': if (velocity.y === 0) velocity = { x: 0, y: -1 }; break;
            case 'ArrowDown': case 's': if (velocity.y === 0) velocity = { x: 0, y: 1 }; break;
            case 'ArrowLeft': case 'a': if (velocity.x === 0) velocity = { x: -1, y: 0 }; break;
            case 'ArrowRight': case 'd': if (velocity.x === 0) velocity = { x: 1, y: 0 }; break;
        }
    });

    // --- NOVO: CONTROLES POR GESTOS ---
    canvas.addEventListener('touchstart', e => {
        e.preventDefault(); // Impede o scroll da página
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: false });

    canvas.addEventListener('touchend', e => {
        e.preventDefault();
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: false });
}

function handleSwipe() {
    if (!gameStarted) return;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    const threshold = 50; // Mínimo de pixels para considerar um swipe

    if (Math.abs(diffX) > Math.abs(diffY)) { // Swipe horizontal
        if (Math.abs(diffX) > threshold) {
            if (diffX > 0 && velocity.x === 0) { // Direita
                velocity = { x: 1, y: 0 };
            } else if (velocity.x === 0) { // Esquerda
                velocity = { x: -1, y: 0 };
            }
        }
    } else { // Swipe vertical
        if (Math.abs(diffY) > threshold) {
            if (diffY > 0 && velocity.y === 0) { // Baixo
                velocity = { x: 0, y: 1 };
            } else if (velocity.y === 0) { // Cima
                velocity = { x: 0, y: -1 };
            }
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
    
    startBtn.disabled = true;
    startBtn.innerText = "Carregando...";

    assets.forEach(asset => {
        asset.img.src = asset.src;
        asset.img.onload = () => {
            assetsLoaded++;
            if (assetsLoaded === assets.length) {
                startBtn.disabled = false;
                startBtn.innerText = "Iniciar Jogo";
                startBtn.addEventListener('click', startGame);
                setupControls();
            }
        };
        asset.img.onerror = () => {
            alert('Erro ao carregar uma das imagens! Verifique os nomes dos arquivos.');
        };
    });
}

loadAssets();
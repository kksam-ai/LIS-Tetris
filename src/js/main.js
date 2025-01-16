// 游戏配置
const GAME_CONFIG = {
    DIFFICULTY_SPEEDS: {
        easy: 1000,    // 简单模式下方块每秒下落一格
        normal: 750,   // 标准模式下方块每0.75秒下落一格
        hard: 500      // 挑战模式下方块每0.5秒下落一格
    },
    DEFAULT_DIFFICULTY: 'normal',
    CANVAS: {
        MAIN: {
            WIDTH: 300,
            HEIGHT: 600,
            GRID_SIZE: 30
        },
        PREVIEW: {
            WIDTH: 120,
            HEIGHT: 120,
            GRID_SIZE: 30
        }
    },
    SCORING: {
        SOFT_DROP: 1,      // 软降（加速下落）得分
        HARD_DROP: 2,      // 硬降（直接落下）得分
        LINE_CLEAR: {      // 消行得分
            1: 100,        // 消除1行
            2: 300,        // 消除2行
            3: 500,        // 消除3行
            4: 800         // 消除4行
        }
    }
};

// 游戏设置管理器
class SettingsManager {
    constructor() {
        this.settings = {
            difficulty: GAME_CONFIG.DEFAULT_DIFFICULTY
        };
        this.loadSettings();
    }

    // 加载设置
    loadSettings() {
        const savedSettings = localStorage.getItem('tetrisSettings');
        if (savedSettings) {
            this.settings = JSON.parse(savedSettings);
        }
    }

    // 保存设置
    saveSettings() {
        localStorage.setItem('tetrisSettings', JSON.stringify(this.settings));
    }

    // 获取当前难度对应的下落速度
    getDropSpeed() {
        return GAME_CONFIG.DIFFICULTY_SPEEDS[this.settings.difficulty];
    }

    // 更新难度设置
    setDifficulty(difficulty) {
        this.settings.difficulty = difficulty;
        this.saveSettings();
    }
}

// 游戏界面管理器
class GameScreenManager {
    constructor() {
        this.startScreen = document.getElementById('startScreen');
        this.gameScreen = document.getElementById('gameScreen');
        this.gameCanvas = document.getElementById('gameCanvas');
        this.nextCanvas = document.getElementById('nextCanvas');
        this.gameCtx = this.gameCanvas.getContext('2d');
        this.nextCtx = this.nextCanvas.getContext('2d');
        this.isPaused = false;

        this.initializeCanvases();
    }

    // 初始化画布
    initializeCanvases() {
        // 设置主游戏画布
        this.gameCanvas.width = GAME_CONFIG.CANVAS.MAIN.WIDTH;
        this.gameCanvas.height = GAME_CONFIG.CANVAS.MAIN.HEIGHT;
        this.gameCanvas.style.width = `${GAME_CONFIG.CANVAS.MAIN.WIDTH}px`;
        this.gameCanvas.style.height = `${GAME_CONFIG.CANVAS.MAIN.HEIGHT}px`;

        // 设置预览画布
        this.nextCanvas.width = GAME_CONFIG.CANVAS.PREVIEW.WIDTH;
        this.nextCanvas.height = GAME_CONFIG.CANVAS.PREVIEW.HEIGHT;
        this.nextCanvas.style.width = `${GAME_CONFIG.CANVAS.PREVIEW.WIDTH}px`;
        this.nextCanvas.style.height = `${GAME_CONFIG.CANVAS.PREVIEW.HEIGHT}px`;

        // 绘制网格
        this.drawGrid();
    }

    // 绘制网格
    drawGrid() {
        const { WIDTH, HEIGHT, GRID_SIZE } = GAME_CONFIG.CANVAS.MAIN;

        this.gameCtx.strokeStyle = 'var(--grid-border-color)';
        this.gameCtx.lineWidth = 0.5;

        // 绘制垂直线
        for (let x = 0; x <= WIDTH; x += GRID_SIZE) {
            this.gameCtx.beginPath();
            this.gameCtx.moveTo(x, 0);
            this.gameCtx.lineTo(x, HEIGHT);
            this.gameCtx.stroke();
        }

        // 绘制水平线
        for (let y = 0; y <= HEIGHT; y += GRID_SIZE) {
            this.gameCtx.beginPath();
            this.gameCtx.moveTo(0, y);
            this.gameCtx.lineTo(WIDTH, y);
            this.gameCtx.stroke();
        }
    }

    // 显示游戏界面
    showGameScreen() {
        this.startScreen.style.display = 'none';
        this.gameScreen.style.display = 'flex';
        this.isPaused = false;
    }

    // 返回开始界面
    showStartScreen() {
        this.gameScreen.style.display = 'none';
        this.startScreen.style.display = 'block';
        this.isPaused = false;
    }

    // 切换暂停状态
    togglePause() {
        this.isPaused = !this.isPaused;
        // TODO: 在后续任务中实现暂停逻辑
    }
}

// 游戏控制器类
class GameController {
    constructor(settingsManager, screenManager) {
        this.settingsManager = settingsManager;
        this.screenManager = screenManager;
        this.gameState = GAME_STATES.IDLE;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.dropCounter = 0;
        this.lastTime = 0;
        this.board = null;
        this.renderer = null;
        this.animationId = null;

        // 初始化游戏板和渲染器
        this.initializeGame();

        // 绑定键盘事件
        this.bindKeyboardEvents();
    }

    // 初始化游戏
    initializeGame() {
        const { MAIN, PREVIEW } = GAME_CONFIG.CANVAS;
        this.board = new GameBoard(MAIN.WIDTH / MAIN.GRID_SIZE, MAIN.HEIGHT / MAIN.GRID_SIZE);
        this.renderer = new GameRenderer(
            document.getElementById('gameCanvas'),
            document.getElementById('nextCanvas'),
            MAIN.GRID_SIZE
        );
    }

    // 绑定键盘事件
    bindKeyboardEvents() {
        document.addEventListener('keydown', (event) => {
            if (this.gameState !== GAME_STATES.PLAYING) return;

            switch (event.code) {
                case 'ArrowLeft':
                    this.board.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    this.board.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    if (this.board.movePiece(0, 1)) {
                        this.score += GAME_CONFIG.SCORING.SOFT_DROP;
                        this.updateScore();
                    }
                    break;
                case 'ArrowUp':
                    this.board.rotatePiece();
                    break;
                case 'Space':
                    const linesCleared = this.board.hardDrop();
                    this.score += GAME_CONFIG.SCORING.HARD_DROP *
                        (this.board.height - this.board.currentPiece.y);
                    this.handleLineClear(linesCleared);
                    break;
            }
        });
    }

    // 开始游戏
    startGame() {
        this.gameState = GAME_STATES.PLAYING;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.board = new GameBoard(
            GAME_CONFIG.CANVAS.MAIN.WIDTH / GAME_CONFIG.CANVAS.MAIN.GRID_SIZE,
            GAME_CONFIG.CANVAS.MAIN.HEIGHT / GAME_CONFIG.CANVAS.MAIN.GRID_SIZE
        );
        this.updateScore();

        // 初始化第一个方块
        this.board.update();

        this.gameLoop();
    }

    // 暂停游戏
    togglePause() {
        if (this.gameState === GAME_STATES.PLAYING) {
            this.gameState = GAME_STATES.PAUSED;
            cancelAnimationFrame(this.animationId);
        } else if (this.gameState === GAME_STATES.PAUSED) {
            this.gameState = GAME_STATES.PLAYING;
            this.lastTime = 0;
            this.gameLoop();
        }
    }

    // 游戏结束
    gameOver() {
        this.gameState = GAME_STATES.GAME_OVER;
        cancelAnimationFrame(this.animationId);
        // TODO: 显示游戏结束界面
    }

    // 生成下一个方块
    spawnNextPiece() {
        if (!this.board.currentPiece) {
            this.board.currentPiece = this.board.nextPiece || this.board.spawnPiece();
            this.board.nextPiece = this.board.spawnPiece();

            // 检查游戏是否结束
            if (this.board.checkCollision(this.board.currentPiece)) {
                this.gameOver();
                return false;
            }
        }
        return true;
    }

    // 处理消行
    handleLineClear(linesCleared) {
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += GAME_CONFIG.SCORING.LINE_CLEAR[linesCleared] * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.updateScore();
        }
    }

    // 更新分数显示
    updateScore() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
    }

    // 游戏主循环
    gameLoop(time = 0) {
        if (this.lastTime === 0) {
            this.lastTime = time;
        }

        const deltaTime = time - this.lastTime;
        this.dropCounter += deltaTime;

        // 根据当前等级计算下落速度
        const dropInterval = this.settingsManager.getDropSpeed() / this.level;

        if (this.dropCounter > dropInterval) {
            if (!this.board.movePiece(0, 1)) {
                this.board.lockPiece();
                const linesCleared = this.board.clearLines();
                this.handleLineClear(linesCleared);

                // 更新游戏状态，检查是否可以继续
                if (!this.board.update()) {
                    this.gameOver();
                    return;
                }
            }
            this.dropCounter = 0;
        }

        // 渲染游戏画面
        this.renderer.renderBoard(this.board);
        this.renderer.renderNextPiece(this.board.nextPiece);

        this.lastTime = time;
        if (this.gameState === GAME_STATES.PLAYING) {
            this.animationId = requestAnimationFrame(this.gameLoop.bind(this));
        }
    }
}

// 等待DOM完全加载
document.addEventListener('DOMContentLoaded', () => {
    // 初始化管理器
    const settingsManager = new SettingsManager();
    const screenManager = new GameScreenManager();
    const gameController = new GameController(settingsManager, screenManager);

    // 获取DOM元素
    const startButton = document.getElementById('startGame');
    const settingsButton = document.getElementById('settings');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsButton = document.getElementById('closeSettings');
    const saveSettingsButton = document.getElementById('saveSettings');
    const pauseButton = document.getElementById('pauseGame');
    const quitButton = document.getElementById('quitGame');
    const difficultyInputs = document.querySelectorAll('input[name="difficulty"]');

    // 设置初始难度
    document.querySelector(`input[value="${settingsManager.settings.difficulty}"]`).checked = true;

    // 开始游戏按钮点击事件
    startButton.addEventListener('click', () => {
        screenManager.showGameScreen();
        gameController.startGame();
    });

    // 暂停按钮点击事件
    pauseButton.addEventListener('click', () => {
        gameController.togglePause();
        pauseButton.textContent = gameController.gameState === GAME_STATES.PAUSED ? '继续' : '暂停';
    });

    // 退出按钮点击事件
    quitButton.addEventListener('click', () => {
        if (confirm('确定要退出游戏吗？')) {
            screenManager.showStartScreen();
            gameController.gameState = GAME_STATES.IDLE;
            cancelAnimationFrame(gameController.animationId);
        }
    });

    // 设置相关事件处理
    function openSettings() {
        settingsModal.classList.add('show');
    }

    function closeSettings() {
        settingsModal.classList.remove('show');
    }

    function saveSettings() {
        const selectedDifficulty = document.querySelector('input[name="difficulty"]:checked').value;
        settingsManager.setDifficulty(selectedDifficulty);
        closeSettings();
    }

    settingsButton.addEventListener('click', openSettings);
    closeSettingsButton.addEventListener('click', closeSettings);
    saveSettingsButton.addEventListener('click', saveSettings);

    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            closeSettings();
        }
    });

    // 添加按钮点击效果
    const buttons = document.querySelectorAll('.game-button');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            button.classList.add('clicked');
            setTimeout(() => {
                button.classList.remove('clicked');
            }, 300);
        });
    });
});

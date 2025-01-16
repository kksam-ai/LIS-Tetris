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
            WIDTH: 135,
            HEIGHT: 135,
            GRID_SIZE: 30
        }
    },
    SCORING: {
        LINE_CLEAR: {      // 消行得分
            1: 100,        // 消除1行
            2: 300,        // 消除2行
            3: 500,        // 消除3行
            4: 800         // 消除4行
        },
        COMBO: {           // 连消加分
            2: 50,         // 2连消
            3: 100,        // 3连消
            4: 200,        // 4连消
            5: 300         // 5连消及以上
        }
    }
};

// 游戏设置管理器
class SettingsManager {
    constructor() {
        this.settings = {
            difficulty: GAME_CONFIG.DEFAULT_DIFFICULTY,
            avatar: null,
            username: ''
        };
        this.loadSettings();
        this.initializeAvatarUpload();
        this.initializeUsernameInput();
    }

    // 加载设置
    loadSettings() {
        const savedSettings = localStorage.getItem('tetrisSettings');
        if (savedSettings) {
            this.settings = JSON.parse(savedSettings);
            // 加载头像
            if (this.settings.avatar) {
                document.getElementById('avatarPreview').src = this.settings.avatar;
                document.getElementById('gameAvatarPreview').src = this.settings.avatar;
            }
            // 加载用户名
            if (this.settings.username) {
                document.getElementById('usernameInput').value = this.settings.username;
                document.getElementById('gameUsername').textContent = this.settings.username;
            }
        }
    }

    // 保存设置
    saveSettings() {
        localStorage.setItem('tetrisSettings', JSON.stringify(this.settings));
        this.updateGameInfo();
    }

    // 更新游戏界面的个人信息
    updateGameInfo() {
        const gameAvatar = document.getElementById('gameAvatarPreview');
        const gameUsername = document.getElementById('gameUsername');

        // 更新头像
        if (this.settings.avatar) {
            gameAvatar.src = this.settings.avatar;
        } else {
            gameAvatar.src = 'assets/images/default-avatar.svg';
        }

        // 更新用户名
        if (this.settings.username) {
            gameUsername.textContent = this.settings.username;
        } else {
            gameUsername.textContent = '玩家';
        }
    }

    // 初始化头像上传功能
    initializeAvatarUpload() {
        const avatarPreview = document.getElementById('avatarPreview');
        const avatarInput = document.getElementById('avatarInput');
        const avatarSection = document.querySelector('.avatar-preview');

        // 点击头像区域触发文件选择
        avatarSection.addEventListener('click', () => {
            avatarInput.click();
        });

        // 处理文件选择
        avatarInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const processedImage = await this.processImage(file);
                    avatarPreview.src = processedImage;
                    this.settings.avatar = processedImage;
                    this.saveSettings();
                } catch (error) {
                    console.error('Error processing image:', error);
                    alert('图片处理失败，请重试');
                }
            }
        });
    }

    // 处理图片
    async processImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    // 创建canvas进行图片处理
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // 设置输出尺寸
                    const size = 100;
                    canvas.width = size;
                    canvas.height = size;

                    // 绘制圆形裁剪区域
                    ctx.beginPath();
                    ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
                    ctx.clip();

                    // 计算缩放和位置以保持图片比例
                    const scale = Math.max(size/img.width, size/img.height);
                    const x = (size - img.width * scale) / 2;
                    const y = (size - img.height * scale) / 2;

                    // 绘制图片
                    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

                    // 转换为base64
                    try {
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                        resolve(dataUrl);
                    } catch (err) {
                        reject(err);
                    }
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
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

    // 初始化用户名输入功能
    initializeUsernameInput() {
        const usernameInput = document.getElementById('usernameInput');
        const inputHint = usernameInput.nextElementSibling;
        let errorMessage = null;

        // 验证用户名
        const validateUsername = (username) => {
            if (username.length < 2) {
                return '用户名至少需要2个字符';
            }
            if (username.length > 20) {
                return '用户名最多20个字符';
            }
            if (!/^[\u4e00-\u9fa5a-zA-Z0-9]+$/.test(username)) {
                return '用户名只能包含中文、英文和数字';
            }
            return null;
        };

        // 显示错误信息
        const showError = (message) => {
            if (!errorMessage) {
                errorMessage = document.createElement('div');
                errorMessage.className = 'error-message';
                inputHint.parentNode.insertBefore(errorMessage, inputHint.nextSibling);
            }
            errorMessage.textContent = message;
            usernameInput.classList.add('input-error');
        };

        // 清除错误信息
        const clearError = () => {
            if (errorMessage) {
                errorMessage.remove();
                errorMessage = null;
            }
            usernameInput.classList.remove('input-error');
        };

        // 处理输入事件
        usernameInput.addEventListener('input', (e) => {
            clearError();
            const username = e.target.value.trim();
            const error = validateUsername(username);

            if (error) {
                showError(error);
            } else {
                this.settings.username = username;
                this.saveSettings();
            }
        });

        // 处理失焦事件
        usernameInput.addEventListener('blur', () => {
            const username = usernameInput.value.trim();
            if (username && !validateUsername(username)) {
                this.settings.username = username;
                this.saveSettings();
            }
        });
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
        this.combo = 0;
        this.highScore = this.loadHighScore();
        this.dropCounter = 0;
        this.lastTime = 0;
        this.board = null;
        this.renderer = null;
        this.animationId = null;
        this.gameOverModal = document.getElementById('gameOverModal');

        // 初始化游戏板和渲染器
        this.initializeGame();

        // 绑定键盘事件
        this.bindKeyboardEvents();
    }

    // 加载最高分
    loadHighScore() {
        const savedScore = localStorage.getItem('tetrisHighScore');
        return savedScore ? parseInt(savedScore) : 0;
    }

    // 保存最高分
    saveHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('tetrisHighScore', this.score.toString());
        }
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

            // 游戏控制按键列表
            const gameKeys = ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'Space'];

            // 如果是游戏控制按键，阻止默认行为
            if (gameKeys.includes(event.code)) {
                event.preventDefault();
            }

            switch (event.code) {
                case 'ArrowLeft':
                    this.board.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    this.board.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    this.board.movePiece(0, 1);
                    break;
                case 'Space':
                    this.board.rotatePiece();
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
            console.log('Game paused');
            this.gameState = GAME_STATES.PAUSED;
            cancelAnimationFrame(this.animationId);
        } else if (this.gameState === GAME_STATES.PAUSED) {
            console.log('Game resumed');
            this.gameState = GAME_STATES.PLAYING;
            // 不重置lastTime，保持当前时间
            this.gameLoop(performance.now());
        }
    }

    // 游戏结束
    gameOver() {
        this.gameState = GAME_STATES.GAME_OVER;
        cancelAnimationFrame(this.animationId);

        // 保存最高分
        this.saveHighScore();

        // 更新游戏结束弹窗的分数显示
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalHighScore').textContent = this.highScore;

        // 显示游戏结束弹窗
        this.gameOverModal.classList.add('show');
    }

    // 重新开始游戏
    restartGame() {
        // 隐藏游戏结束弹窗
        this.gameOverModal.classList.remove('show');

        // 重置游戏状态
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.combo = 0;

        // 重新初始化游戏板
        this.initializeGame();

        // 更新分数显示
        this.updateScore();

        // 开始新游戏
        this.startGame();
    }

    // 退出到主菜单
    exitToMenu() {
        // 隐藏游戏结束弹窗
        this.gameOverModal.classList.remove('show');

        // 返回开始界面
        this.screenManager.showStartScreen();

        // 重置游戏状态
        this.gameState = GAME_STATES.IDLE;
        cancelAnimationFrame(this.animationId);
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

            // 基础分数
            let baseScore = GAME_CONFIG.SCORING.LINE_CLEAR[linesCleared] * this.level;

            // 连消加分
            this.combo = linesCleared > 0 ? this.combo + 1 : 0;
            if (this.combo >= 2) {
                const comboMultiplier = Math.min(this.combo, 5);
                baseScore += GAME_CONFIG.SCORING.COMBO[comboMultiplier] * this.level;
            }

            this.score += baseScore;
            this.level = Math.floor(this.lines / 10) + 1;

            // 更新分数显示，带动画效果
            this.updateScoreWithAnimation(baseScore);

            // 检查并更新最高分
            this.saveHighScore();
        } else {
            this.combo = 0;
        }
    }

    // 带动画效果的分数更新
    updateScoreWithAnimation(scoreIncrease) {
        const scoreElement = document.getElementById('score');
        const scoreDisplay = document.createElement('div');
        scoreDisplay.className = 'score-increase';
        scoreDisplay.textContent = `+${scoreIncrease}`;

        // 将动画元素添加到分数显示区域
        scoreElement.parentElement.appendChild(scoreDisplay);

        // 更新实际分数显示
        this.updateScore();

        // 动画结束后移除元素
        setTimeout(() => {
            scoreDisplay.remove();
        }, 1000);
    }

    // 更新分数显示
    updateScore() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
        document.getElementById('highScore').textContent = this.highScore;
    }

    // 游戏主循环
    gameLoop(time = 0) {
        // 如果是第一次运行或者从暂停恢复
        if (this.lastTime === 0) {
            this.lastTime = time;
            this.dropCounter = 0;
            console.log('Game loop initialized/resumed');
        }

        const deltaTime = time - this.lastTime;
        this.dropCounter += deltaTime;

        // 根据当前等级计算下落速度
        const dropInterval = this.settingsManager.getDropSpeed() / this.level;

        // 添加日志输出
        if (this.dropCounter > dropInterval) {
            console.log(`Drop triggered - Counter: ${this.dropCounter}, Interval: ${dropInterval}`);
        }

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

    // 游戏结束相关事件处理
    const restartButton = document.getElementById('restartGame');
    const exitButton = document.getElementById('exitGame');

    restartButton.addEventListener('click', () => {
        gameController.restartGame();
    });

    exitButton.addEventListener('click', () => {
        gameController.exitToMenu();
    });
});

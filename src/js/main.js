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
        },
        MOBILE: {
            PREVIEW: {
                WIDTH: 90,
                HEIGHT: 90,
                GRID_SIZE: 30
            }
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

        this.keySettingsManager = new KeySettingsManager();
        this.initializeAvatarUpload();
        this.initializeUsernameInput();
        this.initializeKeySettings();
        this.loadSettings();
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
                document.getElementById('mobileAvatarPreview').src = this.settings.avatar;
            }
            // 加载用户名
            if (this.settings.username) {
                document.getElementById('usernameInput').value = this.settings.username;
                document.getElementById('gameUsername').textContent = this.settings.username;
            }
            // 加载难度设置
            document.querySelector(`input[value="${this.settings.difficulty}"]`).checked = true;
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
        const mobileAvatar = document.getElementById('mobileAvatarPreview');
        const gameUsername = document.getElementById('gameUsername');

        // 更新头像
        if (this.settings.avatar) {
            gameAvatar.src = this.settings.avatar;
            mobileAvatar.src = this.settings.avatar;
        } else {
            gameAvatar.src = 'assets/images/default-avatar.svg';
            mobileAvatar.src = 'assets/images/default-avatar.svg';
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

    // 更新用户信息显示
    updateUserInfo() {
        const gameUsername = document.getElementById('gameUsername');
        const gameAvatarPreview = document.getElementById('gameAvatarPreview');
        const gameOverUsername = document.getElementById('gameOverUsername');
        const gameOverAvatar = document.getElementById('gameOverAvatar');

        // 更新游戏界面的用户信息
        if (gameUsername) {
            gameUsername.textContent = this.username;
        }
        if (gameAvatarPreview) {
            gameAvatarPreview.src = this.avatarUrl;
        }

        // 更新游戏结束界面的用户信息
        if (gameOverUsername) {
            gameOverUsername.textContent = this.username;
        }
        if (gameOverAvatar) {
            gameOverAvatar.src = this.avatarUrl;
        }
    }

    // 初始化按键设置
    initializeKeySettings() {
        const keyButtons = document.querySelectorAll('.key-button');
        const restoreDefaultKeys = document.getElementById('restoreDefaultKeys');
        let listeningButton = null;

        // 更新按键显示
        const updateKeyDisplay = () => {
            keyButtons.forEach(button => {
                const action = button.dataset.action;
                const type = button.dataset.type;
                const keyCode = this.keySettingsManager.keySettings[action][type];
                const keyText = button.querySelector('.key-text');
                keyText.textContent = this.getKeyDisplayName(keyCode);
            });
        };

        // 获取按键显示名称
        this.getKeyDisplayName = (keyCode) => {
            if (!keyCode) return '未设置';
            switch (keyCode) {
                case 'Space': return '空格';
                case 'ArrowLeft': return '←';
                case 'ArrowRight': return '→';
                case 'ArrowDown': return '↓';
                case 'ArrowUp': return '↑';
                default: return keyCode.replace('Key', '');
            }
        };

        // 处理按键点击
        keyButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // 如果点击的是清除按钮，不进入监听模式
                if (e.target.classList.contains('key-clear')) return;

                // 如果已经在监听其他按钮，先取消之前的监听
                if (listeningButton) {
                    listeningButton.classList.remove('listening');
                }

                // 设置当前按钮为监听状态
                button.classList.add('listening');
                listeningButton = button;
                button.querySelector('.key-text').textContent = '请按键...';
            });

            // 处理清除按钮点击
            const clearButton = button.querySelector('.key-clear');
            clearButton.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = button.dataset.action;
                const type = button.dataset.type;
                if (this.keySettingsManager.clearKey(action, type)) {
                    updateKeyDisplay();
                } else {
                    alert('每个功能必须保留至少一个按键！');
                }
            });
        });

        // 监听键盘事件
        document.addEventListener('keydown', (e) => {
            if (!listeningButton) return;

            e.preventDefault();
            const action = listeningButton.dataset.action;
            const type = listeningButton.dataset.type;

            // 设置新按键
            if (this.keySettingsManager.setKey(action, type, e.code)) {
                listeningButton.classList.remove('listening');
                listeningButton = null;
                updateKeyDisplay();
            } else {
                alert('该按键已被其他功能使用！');
            }
        });

        // 点击其他区域取消监听
        document.addEventListener('click', (e) => {
            if (listeningButton && !e.target.closest('.key-button')) {
                listeningButton.classList.remove('listening');
                listeningButton = null;
                updateKeyDisplay();
            }
        });

        // 恢复默认按键
        restoreDefaultKeys.addEventListener('click', () => {
            if (confirm('确定要恢复默认按键设置吗？')) {
                this.keySettingsManager.restoreDefaults();
                updateKeyDisplay();
            }
        });

        // 初始显示
        updateKeyDisplay();
    }
}

// 按键设置管理器
class KeySettingsManager {
    constructor() {
        this.keySettings = {
            moveLeft: {
                primary: 'ArrowLeft',
                secondary: 'KeyH'
            },
            moveRight: {
                primary: 'ArrowRight',
                secondary: 'KeyL'
            },
            moveDown: {
                primary: 'ArrowDown',
                secondary: 'KeyJ'
            },
            rotate: {
                primary: 'Space',
                secondary: 'KeyK'
            },
            hardDrop: {
                primary: 'KeyF',
                secondary: 'KeyW'
            }
        };
        this.loadSettings();
    }

    // 加载按键设置
    loadSettings() {
        const savedSettings = localStorage.getItem('tetrisKeySettings');
        if (savedSettings) {
            this.keySettings = JSON.parse(savedSettings);
        }
    }

    // 保存按键设置
    saveSettings() {
        localStorage.setItem('tetrisKeySettings', JSON.stringify(this.keySettings));
    }

    // 设置按键
    setKey(action, type, key) {
        // 检查按键冲突
        for (const [act, keys] of Object.entries(this.keySettings)) {
            if (act !== action) {
                if (keys.primary === key || keys.secondary === key) {
                    return false; // 按键已被使用
                }
            }
        }

        // 设置新按键
        this.keySettings[action][type] = key;
        this.saveSettings();
        return true;
    }

    // 清除按键
    clearKey(action, type) {
        // 检查是否可以清除
        const keys = this.keySettings[action];
        if (type === 'primary' && !keys.secondary || type === 'secondary' && !keys.primary) {
            return false; // 不能清除唯一的按键
        }

        this.keySettings[action][type] = null;
        this.saveSettings();
        return true;
    }

    // 恢复默认设置
    restoreDefaults() {
        this.keySettings = {
            moveLeft: {
                primary: 'ArrowLeft',
                secondary: 'KeyH'
            },
            moveRight: {
                primary: 'ArrowRight',
                secondary: 'KeyL'
            },
            moveDown: {
                primary: 'ArrowDown',
                secondary: 'KeyJ'
            },
            rotate: {
                primary: 'Space',
                secondary: 'KeyK'
            },
            hardDrop: {
                primary: 'KeyF',
                secondary: 'KeyW'
            }
        };
        this.saveSettings();
    }

    // 检查按键是否匹配动作
    isActionKey(action, key) {
        const keys = this.keySettings[action];
        return key === keys.primary || key === keys.secondary;
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

        // 添加移动端画布
        this.mobileGameCanvas = document.getElementById('mobileGameCanvas');
        this.mobileNextCanvas = document.getElementById('mobileNextCanvas');
        this.mobileGameCtx = this.mobileGameCanvas.getContext('2d');
        this.mobileNextCtx = this.mobileNextCanvas.getContext('2d');

        this.isPaused = false;
        this.isMobile = window.innerWidth <= 480;

        this.initializeCanvases();
        this.setupResizeHandler();
    }

    // 初始化画布
    initializeCanvases() {
        // PC端画布设置
        this.gameCanvas.width = GAME_CONFIG.CANVAS.MAIN.WIDTH;
        this.gameCanvas.height = GAME_CONFIG.CANVAS.MAIN.HEIGHT;
        this.gameCanvas.style.width = `${GAME_CONFIG.CANVAS.MAIN.WIDTH}px`;
        this.gameCanvas.style.height = `${GAME_CONFIG.CANVAS.MAIN.HEIGHT}px`;

        this.nextCanvas.width = GAME_CONFIG.CANVAS.PREVIEW.WIDTH;
        this.nextCanvas.height = GAME_CONFIG.CANVAS.PREVIEW.HEIGHT;
        this.nextCanvas.style.width = `${GAME_CONFIG.CANVAS.PREVIEW.WIDTH}px`;
        this.nextCanvas.style.height = `${GAME_CONFIG.CANVAS.PREVIEW.HEIGHT}px`;

        // 添加移动端画布设置
        if (this.isMobile) {
            this.initializeMobileCanvases();
        }

        // 绘制PC端网格
        this.drawGrid();
    }

    // 绘制PC端网格
    drawGrid() {
        const width = this.gameCanvas.width;
        const height = this.gameCanvas.height;
        const gridSize = GAME_CONFIG.CANVAS.MAIN.GRID_SIZE;

        this.gameCtx.strokeStyle = 'var(--grid-border-color)';
        this.gameCtx.lineWidth = 0.5;

        // 绘制垂直线
        for (let x = 0; x <= width; x += gridSize) {
            this.gameCtx.beginPath();
            this.gameCtx.moveTo(x, 0);
            this.gameCtx.lineTo(x, height);
            this.gameCtx.stroke();
        }

        // 绘制水平线
        for (let y = 0; y <= height; y += gridSize) {
            this.gameCtx.beginPath();
            this.gameCtx.moveTo(0, y);
            this.gameCtx.lineTo(width, y);
            this.gameCtx.stroke();
        }
    }

    // 添加移动端画布初始化方法
    initializeMobileCanvases() {
        // 计算游戏区域尺寸
        const gameArea = this.calculateGameAreaSize();

        // 设置游戏画布尺寸
        this.mobileGameCanvas.width = gameArea.width;
        this.mobileGameCanvas.height = gameArea.height;
        this.mobileGameCanvas.style.width = `${gameArea.width}px`;
        this.mobileGameCanvas.style.height = `${gameArea.height}px`;

        // 获取预览画布背景色
        const previewBgColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--color-canvas-bg').trim();

        // 设置游戏画布背景为白色
        this.mobileGameCtx.fillStyle = '#FFFFFF';
        this.mobileGameCtx.fillRect(0, 0, gameArea.width, gameArea.height);

        // 计算预览画布尺寸
        const previewSize = Math.min(80, Math.floor(gameArea.width * 0.2));
        this.mobileNextCanvas.width = previewSize;
        this.mobileNextCanvas.height = previewSize;
        this.mobileNextCanvas.style.width = `${previewSize}px`;
        this.mobileNextCanvas.style.height = `${previewSize}px`;

        // 设置预览画布背景颜色
        this.mobileNextCtx.fillStyle = '#FFFFFF';
        this.mobileNextCtx.fillRect(0, 0, previewSize, previewSize);

        // 存储计算出的尺寸供其他方法使用
        this.mobileConfig = {
            blockSize: gameArea.blockSize,
            width: gameArea.width,
            height: gameArea.height,
            previewSize,
            previewBgColor: '#FFFFFF'  // 保存预览画布背景色以供其他方法使用
        };
    }

    // 计算游戏区域尺寸
    calculateGameAreaSize() {
        // 获取游戏区域容器
        const gameArea = document.querySelector('.mobile-game-area');
        const isLandscape = window.innerWidth > window.innerHeight;

        // 获取可用空间
        const availableWidth = gameArea.clientWidth;
        const availableHeight = gameArea.clientHeight;

        // 计算理想尺寸 (保持10:20的比例)
        let width, height, blockSize;

        if (isLandscape) {
            // 横屏模式：以高度为基准
            height = availableHeight;
            width = height / 2;
            if (width > availableWidth) {
                width = availableWidth;
                height = width * 2;
            }
        } else {
            // 竖屏模式：以宽度为基准
            width = availableWidth;
            height = width * 2;
            if (height > availableHeight) {
                height = availableHeight;
                width = height / 2;
            }
        }

        // 计算方块大小
        blockSize = width / 10;

        // 确保尺寸为整数
        width = Math.floor(width);
        height = Math.floor(height);
        blockSize = Math.floor(blockSize);

        return { width, height, blockSize };
    }

    // 添加窗口大小变化处理
    setupResizeHandler() {
        window.addEventListener('resize', () => {
            const wasMobile = this.isMobile;
            this.isMobile = window.innerWidth <= 480;

            // 只有在移动状态改变时才重新初始化画布
            if (wasMobile !== this.isMobile) {
                this.initializeCanvases();
            } else if (this.isMobile) {
                // 在移动端时，随窗口大小变化调整画布大小
                this.initializeMobileCanvases();
            }
        });
    }

    // 显示游戏界面
    showGameScreen() {
        this.startScreen.style.display = 'none';
        this.gameScreen.style.display = 'flex';
        this.isPaused = false;

        // 重新初始化画布
        this.initializeCanvases();
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
    }
}

// 游戏控制器类
class GameController {
    constructor(settingsManager, screenManager) {
        this.settingsManager = settingsManager;
        this.screenManager = screenManager;
        this.keySettingsManager = this.settingsManager.keySettingsManager;
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

        // 添加移动端分数元素
        this.mobileScoreElements = {
            score: document.getElementById('mobileScore'),
            highScore: document.getElementById('mobileHighScore'),
            level: document.getElementById('mobileLevel'),
            lines: document.getElementById('mobileLines')
        };

        // 初始化游戏板和渲染器
        this.initializeGame();

        // 绑定键盘事件
        this.bindKeyboardEvents();

        // 初始化触控按钮
        this.initTouchControls();
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

            // 阻止游戏控制按键的默认行为
            if (Object.values(this.keySettingsManager.keySettings).some(keys =>
                event.code === keys.primary || event.code === keys.secondary)) {
                event.preventDefault();
            }

            if (this.keySettingsManager.isActionKey('moveLeft', event.code)) {
                this.board.movePiece(-1, 0);
            } else if (this.keySettingsManager.isActionKey('moveRight', event.code)) {
                this.board.movePiece(1, 0);
            } else if (this.keySettingsManager.isActionKey('moveDown', event.code)) {
                this.board.movePiece(0, 1);
            } else if (this.keySettingsManager.isActionKey('rotate', event.code)) {
                this.board.rotatePiece();
            } else if (this.keySettingsManager.isActionKey('hardDrop', event.code)) {
                const linesCleared = this.board.hardDrop();
                this.handleLineClear(linesCleared);
                if (!this.board.update()) {
                    this.gameOver();
                    return;
                }
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

        // 更新玩家信息显示
        const gameOverAvatar = document.getElementById('gameOverAvatar');
        const gameOverUsername = document.getElementById('gameOverUsername');
        const currentAvatar = document.getElementById('gameAvatarPreview').src;
        const currentUsername = document.getElementById('gameUsername').textContent;

        gameOverAvatar.src = currentAvatar;
        gameOverUsername.textContent = currentUsername;

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
        // 更新PC端分数
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
        document.getElementById('highScore').textContent = this.highScore;

        // 更新移动端分数
        this.mobileScoreElements.score.textContent = this.score;
        this.mobileScoreElements.level.textContent = this.level;
        this.mobileScoreElements.lines.textContent = this.lines;
        this.mobileScoreElements.highScore.textContent = this.highScore;
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

        // 添加移动端渲染
        if (this.screenManager.isMobile) {
            this.renderMobileGame();
        }

        this.lastTime = time;
        if (this.gameState === GAME_STATES.PLAYING) {
            this.animationId = requestAnimationFrame(this.gameLoop.bind(this));
        }
    }

    // 修改移动端渲染方法
    renderMobileGame() {
        const mobileCtx = this.screenManager.mobileGameCtx;
        const mobileNextCtx = this.screenManager.mobileNextCtx;
        const config = this.screenManager.mobileConfig;

        if (!config) return; // 确保配置已初始化

        // 清空游戏画布并填充白色背景
        mobileCtx.fillStyle = '#FFFFFF';
        mobileCtx.fillRect(0, 0, config.width, config.height);

        // 清空预览画布并填充背景色
        mobileNextCtx.fillStyle = config.previewBgColor;
        mobileNextCtx.fillRect(0, 0, config.previewSize, config.previewSize);

        // 绘制已固定的方块
        this.board.grid.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.drawMobileBlock(mobileCtx, x, y, value, config.blockSize);
                }
            });
        });

        // 绘制当前方块
        if (this.board.currentPiece) {
            const shape = this.board.currentPiece.getCurrentShape(); // 使用getCurrentShape获取旋转后的形状
            shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        const pieceX = this.board.currentPiece.x + x;
                        const pieceY = this.board.currentPiece.y + y;
                        this.drawMobileBlock(mobileCtx, pieceX, pieceY, this.board.currentPiece.color, config.blockSize);
                    }
                });
            });
        }

        // 绘制预览方块
        if (this.board.nextPiece) {
            const previewBlockSize = Math.floor(config.previewSize / 5); // 预览区域容纳5x5的网格
            const offsetX = (config.previewSize - this.board.nextPiece.shape[0].length * previewBlockSize) / 2;
            const offsetY = (config.previewSize - this.board.nextPiece.shape.length * previewBlockSize) / 2;

            const nextShape = this.board.nextPiece.getCurrentShape(); // 使用getCurrentShape获取旋转后的形状
            nextShape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        this.drawMobilePreviewBlock(mobileNextCtx, x, y, this.board.nextPiece.color, previewBlockSize, offsetX, offsetY);
                    }
                });
            });
        }
    }

    // 修改移动端方块绘制方法
    drawMobileBlock(ctx, x, y, color, size) {
        const xPos = x * size;
        const yPos = y * size;

        // 绘制方块主体
        ctx.fillStyle = color;
        ctx.fillRect(xPos, yPos, size - 1, size - 1);

        // 添加高光效果
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(xPos, yPos, size - 1, size / 4);
    }

    // 修改移动端预览方块绘制方法
    drawMobilePreviewBlock(ctx, x, y, color, size, offsetX, offsetY) {
        const xPos = offsetX + x * size;
        const yPos = offsetY + y * size;

        // 绘制预览方块
        ctx.fillStyle = color;
        ctx.fillRect(xPos, yPos, size - 1, size - 1);

        // 添加高光效果
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(xPos, yPos, size - 1, size / 4);
    }

    // 移动方块相关方法
    moveLeft() {
        if (this.gameState === GAME_STATES.PLAYING) {
            this.board.movePiece(-1, 0);
        }
    }

    moveRight() {
        if (this.gameState === GAME_STATES.PLAYING) {
            this.board.movePiece(1, 0);
        }
    }

    rotate() {
        console.log('Rotate called, game state:', this.gameState);
        if (this.gameState === GAME_STATES.PLAYING) {
            console.log('Attempting to rotate piece');
            if (this.board && this.board.currentPiece) {
                this.board.rotatePiece();
                console.log('Piece rotated');
            } else {
                console.log('No current piece to rotate');
            }
        }
    }

    startSoftDrop() {
        if (this.gameState === GAME_STATES.PLAYING) {
            this.board.movePiece(0, 1);
        }
    }

    stopSoftDrop() {
        // 停止加速下落,不需要特殊处理
    }

    hardDrop() {
        if (this.gameState === GAME_STATES.PLAYING) {
            const linesCleared = this.board.hardDrop();
            this.handleLineClear(linesCleared);
            if (!this.board.update()) {
                this.gameOver();
                return;
            }
        }
    }

    // 初始化触控按钮
    initTouchControls() {
        const touchButtons = {
            moveLeft: document.getElementById('moveLeft'),
            hardDrop: document.getElementById('hardDrop'),
            rotate: document.getElementById('rotate'),
            softDrop: document.getElementById('softDrop'),
            moveRight: document.getElementById('moveRight')
        };

        // 防止触摸事件引起页面滚动
        Object.values(touchButtons).forEach(button => {
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
            });
            button.addEventListener('mousedown', (e) => {
                e.preventDefault();
            });
        });

        // 绑定触摸和鼠标事件
        touchButtons.moveLeft.addEventListener('touchstart', () => {
            this.moveLeft();
        });
        touchButtons.moveLeft.addEventListener('mousedown', () => {
            this.moveLeft();
        });

        touchButtons.moveRight.addEventListener('touchstart', () => {
            this.moveRight();
        });
        touchButtons.moveRight.addEventListener('mousedown', () => {
            this.moveRight();
        });

        touchButtons.rotate.addEventListener('touchstart', () => {
            console.log('Rotate button touched');
            this.rotate();
        });
        touchButtons.rotate.addEventListener('mousedown', () => {
            console.log('Rotate button clicked');
            this.rotate();
        });

        touchButtons.softDrop.addEventListener('touchstart', () => {
            this.startSoftDrop();
        });
        touchButtons.softDrop.addEventListener('touchend', () => {
            this.stopSoftDrop();
        });
        touchButtons.softDrop.addEventListener('mousedown', () => {
            this.startSoftDrop();
        });
        touchButtons.softDrop.addEventListener('mouseup', () => {
            this.stopSoftDrop();
        });
        touchButtons.softDrop.addEventListener('mouseleave', () => {
            this.stopSoftDrop();
        });

        touchButtons.hardDrop.addEventListener('touchstart', () => {
            this.hardDrop();
        });
        touchButtons.hardDrop.addEventListener('mousedown', () => {
            this.hardDrop();
        });
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
    const restartGameButton = document.getElementById('restartGameBtn');
    const difficultyInputs = document.querySelectorAll('input[name="difficulty"]');
    const quitConfirmModal = document.getElementById('quitConfirmModal');
    const confirmQuitButton = document.getElementById('confirmQuit');
    const cancelQuitButton = document.getElementById('cancelQuit');
    const restartConfirmModal = document.getElementById('restartConfirmModal');
    const confirmRestartButton = document.getElementById('confirmRestart');
    const cancelRestartButton = document.getElementById('cancelRestart');

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

    // 重新开始按钮点击事件
    restartGameButton.addEventListener('click', () => {
        // 暂停游戏
        if (gameController.gameState === GAME_STATES.PLAYING) {
            gameController.togglePause();
            pauseButton.textContent = '继续';
        }
        // 显示重新开始确认弹窗
        restartConfirmModal.classList.add('show');
    });

    // 确认重新开始按钮点击事件
    confirmRestartButton.addEventListener('click', () => {
        restartConfirmModal.classList.remove('show');
        gameController.restartGame();
        pauseButton.textContent = '暂停';
    });

    // 取消重新开始按钮点击事件
    cancelRestartButton.addEventListener('click', () => {
        restartConfirmModal.classList.remove('show');
        // 如果游戏之前是在进行中，则恢复游戏
        if (gameController.gameState === GAME_STATES.PAUSED) {
            gameController.togglePause();
            pauseButton.textContent = '暂停';
        }
    });

    // 点击modal背景关闭modal
    restartConfirmModal.addEventListener('click', (e) => {
        if (e.target === restartConfirmModal) {
            restartConfirmModal.classList.remove('show');
            // 如果游戏之前是在进行中，则恢复游戏
            if (gameController.gameState === GAME_STATES.PAUSED) {
                gameController.togglePause();
                pauseButton.textContent = '暂停';
            }
        }
    });

    // 退出按钮点击事件
    quitButton.addEventListener('click', () => {
        // 暂停游戏
        if (gameController.gameState === GAME_STATES.PLAYING) {
            gameController.togglePause();
            pauseButton.textContent = '继续';
        }
        // 显示退出确认弹窗
        quitConfirmModal.classList.add('show');
    });

    // 确认退出按钮点击事件
    confirmQuitButton.addEventListener('click', () => {
        quitConfirmModal.classList.remove('show');
        screenManager.showStartScreen();
        gameController.gameState = GAME_STATES.IDLE;
        cancelAnimationFrame(gameController.animationId);
    });

    // 取消退出按钮点击事件
    cancelQuitButton.addEventListener('click', () => {
        quitConfirmModal.classList.remove('show');
        // 如果游戏之前是在进行中，则恢复游戏
        if (gameController.gameState === GAME_STATES.PAUSED) {
            gameController.togglePause();
            pauseButton.textContent = '暂停';
        }
    });

    // 点击modal背景关闭modal
    quitConfirmModal.addEventListener('click', (e) => {
        if (e.target === quitConfirmModal) {
            quitConfirmModal.classList.remove('show');
            // 如果游戏之前是在进行中，则恢复游戏
            if (gameController.gameState === GAME_STATES.PAUSED) {
                gameController.togglePause();
                pauseButton.textContent = '暂停';
            }
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

    // 添加移动端按钮事件处理
    const mobilePauseButton = document.getElementById('mobilePauseGame');
    const mobileRestartButton = document.getElementById('mobileRestartGame');
    const mobileQuitButton = document.getElementById('mobileQuitGame');

    // 移动端暂停按钮点击事件
    mobilePauseButton.addEventListener('click', () => {
        gameController.togglePause();
        mobilePauseButton.textContent = gameController.gameState === GAME_STATES.PAUSED ? '继续' : '暂停';
        pauseButton.textContent = mobilePauseButton.textContent; // 同步PC端按钮状态
    });

    // 移动端重新开始按钮点击事件
    mobileRestartButton.addEventListener('click', () => {
        // 暂停游戏
        if (gameController.gameState === GAME_STATES.PLAYING) {
            gameController.togglePause();
            mobilePauseButton.textContent = '继续';
            pauseButton.textContent = '继续';
        }
        // 显示重新开始确认弹窗
        restartConfirmModal.classList.add('show');
    });

    // 移动端退出按钮点击事件
    mobileQuitButton.addEventListener('click', () => {
        // 暂停游戏
        if (gameController.gameState === GAME_STATES.PLAYING) {
            gameController.togglePause();
            mobilePauseButton.textContent = '继续';
            pauseButton.textContent = '继续';
        }
        // 显示退出确认弹窗
        quitConfirmModal.classList.add('show');
    });
});

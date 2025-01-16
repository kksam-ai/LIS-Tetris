// 游戏配置
const GAME_CONFIG = {
    DIFFICULTY_SPEEDS: {
        easy: 1000,    // 简单模式下方块每秒下落一格
        normal: 750,   // 标准模式下方块每0.75秒下落一格
        hard: 500      // 挑战模式下方块每0.5秒下落一格
    },
    DEFAULT_DIFFICULTY: 'normal'
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

// 等待DOM完全加载
document.addEventListener('DOMContentLoaded', () => {
    // 初始化设置管理器
    const settingsManager = new SettingsManager();

    // 获取DOM元素
    const startButton = document.getElementById('startGame');
    const settingsButton = document.getElementById('settings');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsButton = document.getElementById('closeSettings');
    const saveSettingsButton = document.getElementById('saveSettings');
    const difficultyInputs = document.querySelectorAll('input[name="difficulty"]');

    // 设置初始难度
    document.querySelector(`input[value="${settingsManager.settings.difficulty}"]`).checked = true;

    // 打开设置弹窗
    function openSettings() {
        settingsModal.classList.add('show');
    }

    // 关闭设置弹窗
    function closeSettings() {
        settingsModal.classList.remove('show');
    }

    // 保存设置
    function saveSettings() {
        const selectedDifficulty = document.querySelector('input[name="difficulty"]:checked').value;
        settingsManager.setDifficulty(selectedDifficulty);
        closeSettings();
    }

    // 事件监听器
    settingsButton.addEventListener('click', openSettings);
    closeSettingsButton.addEventListener('click', closeSettings);
    saveSettingsButton.addEventListener('click', saveSettings);

    // 点击模态框外部关闭
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            closeSettings();
        }
    });

    // 开始游戏按钮点击事件
    startButton.addEventListener('click', () => {
        console.log('开始游戏，当前难度：', settingsManager.settings.difficulty);
        console.log('下落速度：', settingsManager.getDropSpeed(), 'ms');
        // TODO: 在后续任务中实现游戏启动逻辑
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

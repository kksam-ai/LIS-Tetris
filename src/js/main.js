// 等待DOM完全加载
document.addEventListener('DOMContentLoaded', () => {
    // 获取按钮元素
    const startButton = document.getElementById('startGame');
    const settingsButton = document.getElementById('settings');

    // 开始游戏按钮点击事件
    startButton.addEventListener('click', () => {
        console.log('开始游戏');
        // TODO: 在后续任务中实现游戏启动逻辑
    });

    // 设置按钮点击事件
    settingsButton.addEventListener('click', () => {
        console.log('打开设置');
        // TODO: 在后续任务中实现设置界面
    });

    // 添加按钮点击音效
    const buttons = document.querySelectorAll('.game-button');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            // 添加点击效果类
            button.classList.add('clicked');
            // 300ms后移除效果类
            setTimeout(() => {
                button.classList.remove('clicked');
            }, 300);
        });
    });
});

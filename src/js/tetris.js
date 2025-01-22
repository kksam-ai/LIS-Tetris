// 马卡龙色系
const MACARON_COLORS = [
    '#FFB5C2',  // 红色
    '#FFD4B8',  // 橙色
    '#FFE4B5',  // 黄色
    '#B5E4D3',  // 绿色
    '#A5EAFF',  // 蓝色
    '#B5C9FF',  // 靛色
    '#E1DCFC'   // 紫色
];

// 获取随机马卡龙色
function getRandomMacaronColor() {
    return MACARON_COLORS[Math.floor(Math.random() * MACARON_COLORS.length)];
}

// 方块形状定义
const TETROMINOES = {
    I: {
        shape: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        color: '#98D8C1' // 主粉绿色
    },
    J: {
        shape: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#B5E4D3' // 浅粉绿色
    },
    L: {
        shape: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#7AC1A6' // 深粉绿色
    },
    O: {
        shape: [
            [1, 1],
            [1, 1]
        ],
        color: '#E8F6F1' // 最浅粉绿色
    },
    S: {
        shape: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        color: '#A8DEC9' // 中浅粉绿色
    },
    T: {
        shape: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#89CEB4' // 中深粉绿色
    },
    Z: {
        shape: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
        color: '#C2EBD9' // 浅粉绿色
    }
};

// 游戏状态
const GAME_STATES = {
    IDLE: 'idle',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver'
};

// 方块类
class Tetromino {
    constructor(type) {
        this.type = type;
        this.shape = TETROMINOES[type].shape;
        this.color = getRandomMacaronColor();
        this.x = 3;
        this.y = 0;
        this.rotation = 0;
    }

    // 获取当前形状
    getCurrentShape() {
        return this.rotateMatrix(this.shape, this.rotation);
    }

    // 矩阵旋转
    rotateMatrix(matrix, rotation) {
        const N = matrix.length;
        // 深拷贝原始矩阵
        let rotated = Array.from({ length: N }, (_, i) =>
            Array.from({ length: N }, (_, j) => matrix[i][j])
        );

        for (let i = 0; i < rotation % 4; i++) {
            const temp = Array.from({ length: N }, (_, i) =>
                Array.from({ length: N }, (_, j) => rotated[N - j - 1][i])
            );
            rotated = temp;
        }

        return rotated;
    }
}

// 游戏板类
class GameBoard {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.grid = this.createEmptyGrid();
        this.currentPiece = null;
        this.nextPiece = null;
        this.lastLockedPiece = null;  // 记录上一个锁定的方块状态
        this.lastClearedLines = [];   // 记录上一次消除的行
    }

    // 创建空网格
    createEmptyGrid() {
        return Array.from({ length: this.height }, () =>
            Array(this.width).fill(null)
        );
    }

    // 检查是否可以撤销
    canUndo() {
        return this.lastLockedPiece !== null &&  // 存在上一个锁定的方块
               this.currentPiece !== null &&     // 当前有正在下落的方块
               !this.lastClearedLines.length;    // 上一个方块没有触发消行
    }

    // 执行撤销操作
    undo() {
        if (!this.canUndo()) {
            return false;
        }

        // 移除上一个锁定的方块
        const { shape, x, y, color } = this.lastLockedPiece;
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const boardY = y + row;
                    const boardX = x + col;
                    if (boardY >= 0 && boardY < this.height && boardX >= 0 && boardX < this.width) {
                        this.grid[boardY][boardX] = null;
                    }
                }
            }
        }

        // 重置状态
        this.lastLockedPiece = null;
        return true;
    }

    // 生成新方块
    spawnPiece() {
        const types = Object.keys(TETROMINOES);
        const type = types[Math.floor(Math.random() * types.length)];
        return new Tetromino(type);
    }

    // 检查碰撞
    checkCollision(piece, offsetX = 0, offsetY = 0, rotation = 0) {
        console.log('Checking collision for:', {
            pieceType: piece.type,
            currentRotation: piece.rotation,
            newRotation: (piece.rotation + rotation) % 4,
            offsetX,
            offsetY
        });

        const shape = piece.rotateMatrix(piece.shape, (piece.rotation + rotation) % 4);

        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const newX = piece.x + x + offsetX;
                    const newY = piece.y + y + offsetY;

                    if (newX < 0 || newX >= this.width ||
                        newY >= this.height ||
                        (newY >= 0 && this.grid[newY][newX] !== null)) {
                        console.log('Collision detected at:', { x: newX, y: newY });
                        return true;
                    }
                }
            }
        }
        console.log('No collision detected');
        return false;
    }

    // 锁定方块
    lockPiece() {
        if (!this.currentPiece) return;

        // 保存当前方块状态，用于撤销
        this.lastLockedPiece = {
            shape: this.currentPiece.getCurrentShape(),
            x: this.currentPiece.x,
            y: this.currentPiece.y,
            color: this.currentPiece.color
        };

        const shape = this.currentPiece.getCurrentShape();
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardY = this.currentPiece.y + y;
                    if (boardY >= 0) {
                        this.grid[boardY][this.currentPiece.x + x] = this.currentPiece.color;
                    }
                }
            }
        }
        this.currentPiece = null;
    }

    // 清除完整行
    clearLines() {
        this.lastClearedLines = []; // 重置上一次消除的行记录
        let linesCleared = 0;

        for (let y = this.height - 1; y >= 0; y--) {
            if (this.grid[y].every(cell => cell !== null)) {
                // 记录被消除的行
                this.lastClearedLines.push(y);
                // 移除该行
                this.grid.splice(y, 1);
                // 在顶部添加新行
                this.grid.unshift(Array(this.width).fill(null));
                linesCleared++;
                y++; // 重新检查当前位置
            }
        }

        return linesCleared;
    }

    // 移动方块
    movePiece(dx, dy) {
        if (!this.checkCollision(this.currentPiece, dx, dy)) {
            this.currentPiece.x += dx;
            this.currentPiece.y += dy;
            return true;
        }
        return false;
    }

    // 旋转方块
    rotatePiece() {
        console.log('Attempting to rotate piece in GameBoard');
        if (!this.checkCollision(this.currentPiece, 0, 0, 1)) {
            this.currentPiece.rotation = (this.currentPiece.rotation + 1) % 4;
            console.log('Piece rotated successfully');
            return true;
        }
        console.log('Rotation blocked by collision');
        return false;
    }

    // 硬降（直接降落到底部）
    hardDrop() {
        if (!this.currentPiece) return 0;

        let dropDistance = 0;
        let maxDropDistance = this.height; // 最大可能的下落距离

        // 使用二分查找优化距离计算
        let low = 0;
        let high = maxDropDistance;

        while (low <= high) {
            let mid = Math.floor((low + high) / 2);
            if (this.checkCollision(this.currentPiece, 0, mid)) {
                high = mid - 1;
            } else {
                if (this.checkCollision(this.currentPiece, 0, mid + 1)) {
                    dropDistance = mid;
                    break;
                }
                low = mid + 1;
            }
        }

        // 使用movePiece进行实际移动
        if (dropDistance > 0) {
            this.currentPiece.y += dropDistance;
        }

        // 锁定方块并处理消行
        this.lockPiece();
        return this.clearLines();
    }

    // 更新游戏状态
    update() {
        if (!this.currentPiece) {
            // 如果没有当前方块，生成新的方块
            this.currentPiece = this.nextPiece || this.spawnPiece();
            this.nextPiece = this.spawnPiece();

            // 检查游戏是否结束
            if (this.checkCollision(this.currentPiece)) {
                return false;
            }
        }
        return true;
    }
}

// 游戏渲染器
class GameRenderer {
    constructor(gameCanvas, nextCanvas, gridSize) {
        this.gameCtx = gameCanvas.getContext('2d');
        this.nextCtx = nextCanvas.getContext('2d');
        this.gridSize = gridSize;

        // 设置预览画布尺寸
        this.nextCanvas = nextCanvas;
        this.nextCanvas.width = 135;
        this.nextCanvas.height = 135;
    }

    // 清空画布
    clear(ctx, width, height) {
        ctx.clearRect(0, 0, width, height);
    }

    // 绘制单个方块
    drawBlock(ctx, x, y, color) {
        const size = this.gridSize;
        ctx.fillStyle = color;
        ctx.fillRect(x * size, y * size, size, size);

        // 添加高光效果
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(x * size, y * size, size, size / 4);

        // 添加边框
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.strokeRect(x * size, y * size, size, size);
    }

    // 绘制游戏板
    renderBoard(board) {
        this.clear(this.gameCtx, board.width * this.gridSize, board.height * this.gridSize);

        // 绘制已固定的方块
        for (let y = 0; y < board.height; y++) {
            for (let x = 0; x < board.width; x++) {
                if (board.grid[y][x]) {
                    this.drawBlock(this.gameCtx, x, y, board.grid[y][x]);
                }
            }
        }

        // 绘制当前方块
        if (board.currentPiece) {
            const shape = board.currentPiece.getCurrentShape();
            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[y].length; x++) {
                    if (shape[y][x]) {
                        const drawX = board.currentPiece.x + x;
                        const drawY = board.currentPiece.y + y;
                        if (drawY >= 0) {
                            this.drawBlock(this.gameCtx, drawX, drawY, board.currentPiece.color);
                        }
                    }
                }
            }
        }
    }

    // 绘制下一个方块预览
    renderNextPiece(piece) {
        if (!piece) return;

        const shape = piece.getCurrentShape();
        const shapeSize = shape.length;

        // 计算单个格子的大小（确保不超过120px的限制）
        const maxSize = 120;
        const gridSize = Math.min(maxSize / shapeSize, 30);

        // 计算居中位置
        const totalWidth = shapeSize * gridSize;
        const offsetX = (135 - totalWidth) / 2;
        const offsetY = (135 - totalWidth) / 2;

        // 清空画布
        this.clear(this.nextCtx, 135, 135);

        // 绘制方块
        for (let y = 0; y < shapeSize; y++) {
            for (let x = 0; x < shapeSize; x++) {
                if (shape[y][x]) {
                    const drawX = offsetX + x * gridSize;
                    const drawY = offsetY + y * gridSize;

                    // 绘制方块
                    this.nextCtx.fillStyle = piece.color;
                    this.nextCtx.fillRect(drawX, drawY, gridSize, gridSize);

                    // 添加高光效果
                    this.nextCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    this.nextCtx.fillRect(drawX, drawY, gridSize, gridSize / 4);

                    // 添加边框
                    this.nextCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                    this.nextCtx.strokeRect(drawX, drawY, gridSize, gridSize);
                }
            }
        }
    }
}

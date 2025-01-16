// 方块形状定义
const TETROMINOES = {
    I: {
        shape: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        color: '#FFB5C2' // 粉色
    },
    J: {
        shape: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#95E1D3' // 薄荷绿
    },
    L: {
        shape: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#F9EAC3' // 淡黄
    },
    O: {
        shape: [
            [1, 1],
            [1, 1]
        ],
        color: '#FFDAC1' // 淡橙
    },
    S: {
        shape: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        color: '#B5D8EB' // 淡蓝
    },
    T: {
        shape: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#E2BEF1' // 淡紫
    },
    Z: {
        shape: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
        color: '#FFB2A6' // 珊瑚粉
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
        this.color = TETROMINOES[type].color;
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
        let rotated = matrix;

        for (let i = 0; i < rotation % 4; i++) {
            rotated = Array.from({ length: N }, (_, i) =>
                Array.from({ length: N }, (_, j) => rotated[N - j - 1][i])
            );
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
    }

    // 创建空网格
    createEmptyGrid() {
        return Array.from({ length: this.height }, () =>
            Array(this.width).fill(null)
        );
    }

    // 生成新方块
    spawnPiece() {
        const types = Object.keys(TETROMINOES);
        const type = types[Math.floor(Math.random() * types.length)];
        return new Tetromino(type);
    }

    // 检查碰撞
    checkCollision(piece, offsetX = 0, offsetY = 0, rotation = 0) {
        const shape = piece.rotateMatrix(piece.shape, (piece.rotation + rotation) % 4);

        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const newX = piece.x + x + offsetX;
                    const newY = piece.y + y + offsetY;

                    if (newX < 0 || newX >= this.width ||
                        newY >= this.height ||
                        (newY >= 0 && this.grid[newY][newX] !== null)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // 锁定方块
    lockPiece() {
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
    }

    // 清除完整行
    clearLines() {
        let linesCleared = 0;

        for (let y = this.height - 1; y >= 0; y--) {
            if (this.grid[y].every(cell => cell !== null)) {
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
        if (!this.checkCollision(this.currentPiece, 0, 0, 1)) {
            this.currentPiece.rotation = (this.currentPiece.rotation + 1) % 4;
            return true;
        }
        return false;
    }

    // 快速下落
    hardDrop() {
        while (this.movePiece(0, 1)) {
            // 继续下落直到碰撞
        }
        this.lockPiece();
        return this.clearLines();
    }
}

// 游戏渲染器
class GameRenderer {
    constructor(gameCanvas, nextCanvas, gridSize) {
        this.gameCtx = gameCanvas.getContext('2d');
        this.nextCtx = nextCanvas.getContext('2d');
        this.gridSize = gridSize;
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

        const previewSize = 4;
        this.clear(this.nextCtx, previewSize * this.gridSize, previewSize * this.gridSize);

        const shape = piece.getCurrentShape();
        const offsetX = (previewSize - shape.length) / 2;
        const offsetY = (previewSize - shape.length) / 2;

        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    this.drawBlock(
                        this.nextCtx,
                        x + offsetX,
                        y + offsetY,
                        piece.color
                    );
                }
            }
        }
    }
}

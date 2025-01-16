# Title
优化下一个方块预览区

# Introduction
调整下一个方块预览区的显示效果，统一画布尺寸和背景色，优化方块显示大小和位置。

# Tasks
- [x] 设置nextCanvas尺寸为135x135px
- [x] 使用与主游戏区相同的背景色
- [x] 限制预览方块最大尺寸为120px
- [x] 实现预览方块在画布中居中显示
- [x] 保持方块样式效果（高光和边框）

# Dependencies
- [x] 032 马卡龙色方块

# Status History
- 2024-01-16: Created
- 2024-01-16: Completed

# Implementation Details
1. CSS更改：
   - nextCanvas尺寸：135x135px
   - 背景色：var(--color-canvas-bg)
   - 保持圆角和阴影效果

2. JavaScript更改：
   - 在GameRenderer构造函数中设置画布尺寸
   - 重写renderNextPiece方法：
     - 根据方块形状计算适当的格子大小
     - 确保总宽度不超过120px
     - 计算居中偏移量
     - 保持方块的高光和边框效果

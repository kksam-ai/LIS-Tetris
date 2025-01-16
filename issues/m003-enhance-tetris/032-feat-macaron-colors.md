# Title
实现马卡龙色方块

# Introduction
为游戏方块实现随机的马卡龙色系（粉红、粉蓝、粉紫、粉绿、粉棕），确保颜色深度足够以与背景形成良好的视觉对比。

# Tasks
- [x] 定义马卡龙色系的颜色值
- [x] 实现方块颜色随机分配机制
- [x] 确保颜色深度适中，与背景有足够对比度
- [x] 测试不同显示器下的颜色效果
- [x] 确保颜色搭配美观

# Dependencies
- [x] 031 游戏功能增强
- [x] 019 颜色方案优化

# Status History
- 2024-01-16: Created
- 2024-01-16: Completed
- 2024-01-16: Updated - 重新设计为七色马卡龙方案

# Color Scheme
马卡龙七色方案：
1. #FFB5C2 - 柔和的粉红色
2. #FFD4B8 - 柔和的橙色
3. #FFE4B5 - 柔和的黄色
4. #B5E4D3 - 柔和的薄荷绿
5. #A5EAFF - 柔和的天蓝
6. #B5C9FF - 柔和的靛蓝
7. #E1DCFC - 柔和的淡紫

# Implementation
- 将MACARON_COLORS改为数组存储七种标准色
- 简化getRandomMacaronColor()函数，直接从数组中随机选择颜色
- 修改Tetromino类的构造函数，使用随机马卡龙色
- 所有颜色都保持马卡龙特有的柔和、明亮特性

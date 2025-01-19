# 移动端自适应布局优化

## Introduction
当前移动端布局使用固定高度的方式实现，这种方式在不同尺寸的手机屏幕上可能会出现显示问题。需要参考专业手机游戏的设计理念，实现更好的自适应布局。

目标是实现一个基于屏幕比例的自适应布局系统，使游戏在不同尺寸的手机屏幕上都能获得良好的显示效果和操作体验。

### 布局方案

#### 1. 屏幕区域划分
将屏幕垂直划分为三个主要区域，每个区域使用相对比例：

1. 顶部信息区（15%-20%）
   - 显示分数、等级、下一个方块等信息
   - 最小高度：80px
   - 最大高度：20%屏幕高度
   - 内部元素等比缩放

2. 游戏主区域（50%-60%）
   - 核心玩法区域
   - 宽度：屏幕宽度减去安全边距
   - 10列方块均匀分布
   - 方块保持正方形
   - 居中显示游戏区域

3. 底部控制区（25%-30%）
   - 触控按钮区域
   - 最小高度：120px
   - 最大高度：30%屏幕高度
   - 按钮最小触控区域：44pt x 44pt
   - 按钮间距合理分布

### 关键约束与优化建议
1. 布局约束
   - 顶部区域：确保信息清晰可见，内部元素保持合适比例
   - 游戏区域：10列方块均匀分布，保持方块为正方形
   - 底部区域：按钮大小和间距确保易于操作

2. 性能优化
   - 使用transform进行缩放
   - 避免频繁重新计算布局
   - 使用CSS变量便于统一调整

### 游戏区域计算策略
1. 方块尺寸计算
   ```javascript
   // 计算方块大小
   const safeMargin = Math.min(screenWidth * 0.05, 20); // 两侧安全边距
   const gameWidth = screenWidth - (safeMargin * 2);
   const blockSize = Math.floor(gameWidth / 10); // 确保整数

   // 计算游戏区域实际宽度（保持居中）
   const actualGameWidth = blockSize * 10;
   const sideMargin = (screenWidth - actualGameWidth) / 2;
   ```

2. 高度计算
   ```javascript
   // 计算可用高度
   const topHeight = Math.min(Math.max(screenHeight * 0.15, 80), screenHeight * 0.2);
   const bottomHeight = Math.min(Math.max(screenHeight * 0.25, 120), screenHeight * 0.3);
   const availableHeight = screenHeight - topHeight - bottomHeight;

   // 计算游戏区域高度（20行）
   const gameHeight = blockSize * 20;
   ```

## Tasks
- [x] CSS文件结构优化
  - [x] 将mobile.css的样式合并到style.css中
  - [x] 删除mobile.css文件
  - [x] 优化媒体查询结构
  - [x] 使用CSS变量定义关键尺寸
- [x] 实现游戏区域布局
  - [x] 计算方块尺寸
  - [x] 实现居中显示
  - [x] 处理安全边距
- [x] 实现自适应布局
  - [x] 设置区域高度比例
  - [x] 处理最小/最大高度限制
  - [x] 实现响应式缩放
- [x] 优化控制按钮
  - [x] 设置合适的按钮大小
  - [x] 优化按钮间距
  - [x] 实现触控反馈
- [x] 实现信息区域布局
  - [x] 布局分数和等级显示
  - [x] 设置预览区域
  - [x] 优化文字大小
- [x] 测试不同设备适配
  - [x] 测试小屏手机显示
  - [x] 测试大屏手机显示
  - [x] 验证操作体验

## Dependencies
- [x] 046 移动端基础布局实现
- [x] 047 移动端触控按钮实现

## Status History
- 2025-01-18: Created
- 2025-01-18: Updated 更新方块尺寸计算策略，改为基于屏幕宽度的10列均匀分布
- 2025-01-18: Updated 移除触控方块相关设计，专注于按钮操作体验
- 2024-01-19: Updated 完成CSS文件结构优化，合并mobile.css到style.css

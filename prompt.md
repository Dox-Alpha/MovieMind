请帮我开发一个 React 单页网页项目，主题是“MovieLens 迷你电影推荐系统”。这不是一个 PPT 式展示网页，而是一个真正可交互的迷你推荐系统 Demo，同时通过滚动叙事让用户逐步理解推荐系统流程。

## 项目定位

这是课程项目 Topic 06：动手做一个迷你推荐系统。

网页需要同时满足两个目标：

1. 作为一个可运行的推荐系统 Demo：

   * 用户可以搜索电影
   * 给几部喜欢的电影打 1~5 分
   * 选择不同推荐算法
   * 点击生成 Top-10 推荐结果
   * 每个推荐结果需要有推荐理由

2. 作为一个课程项目展示网页：

   * 用户通过向下滚动，逐步看到推荐系统的完整流程
   * 包括：推荐场景、数据来源、评分矩阵、相似度计算、推荐生成、结果解释、成功/错误案例、局限与风险讨论

## 技术要求

请使用 React 项目实现，技术栈你来选择，但建议使用：

* React + Vite
* Tailwind CSS
* Framer Motion 用于滚动动画和动态效果
* Recharts 或类似图表库用于可视化
* 不需要真实后端
* 数据由 Python 脚本预处理成 JSON，前端读取 JSON 展示和交互

请同时提供：

* React 前端项目
* Python 数据预处理脚本
* README.md，说明如何运行项目、如何处理 MovieLens 数据、项目结构和算法说明

## 数据要求

使用 MovieLens small 数据集。

需要写 Python 脚本读取 MovieLens small 的：

* ratings.csv
* movies.csv

然后生成前端使用的 JSON 文件，例如：

* movies.json
* ratings_sample.json
* user_item_matrix.json
* item_similarity.json
* user_similarity.json
* recommendations_demo.json

为了保证前端性能，可以只选取一部分数据，例如：

* 评分数量较多的前 100~300 部电影
* 活跃用户若干
* 生成一个适合前端展示的小型评分矩阵

## 推荐算法

请实现或模拟展示 4 个有代表性的算法：

1. Popularity Baseline
   根据电影平均评分和评分人数推荐热门高分电影。

2. User-based Collaborative Filtering
   根据用户—电影评分矩阵计算用户相似度，寻找相似用户，再推荐相似用户喜欢但当前用户未看过的电影。

3. Item-based Collaborative Filtering
   根据电影之间的评分向量计算电影相似度，根据用户喜欢的电影推荐相似电影。

4. Matrix Factorization / SVD
   使用矩阵分解思想生成推荐结果。可以在 Python 侧用 sklearn TruncatedSVD 或 numpy 实现简化版，然后导出结果给前端。

推荐结果至少包含：

* 电影标题
* 类型 genres
* 推荐分数
* 使用的算法
* 推荐理由，例如：

  * “因为你喜欢 Toy Story，它与这部电影在用户评分模式上相似”
  * “与你兴趣相似的用户也喜欢这部电影”
  * “这部电影在数据集中评分高且评价人数较多”
  * “SVD 潜在兴趣向量认为你可能喜欢这类电影”

## 页面结构

请做成一个科技感、fancy、动态感较强的单页滚动网页。整体不是普通报告，而是一个类似 interactive dashboard / mini system 的作品。

建议页面模块如下：

### 1. Hero Section

标题：MovieLens Mini Recommender System

副标题：From user behavior to personalized movie recommendations

需要有科技感背景，例如：

* 深色渐变背景
* 粒子/网格/流动线条
* 动态节点图，表示“用户—电影—推荐”的连接

需要有按钮：

* Start Exploring
* Try Recommendation

### 2. Recommendation Playground

这是核心模块。

用户可以：

* 搜索电影
* 添加到“我喜欢的电影”
* 给每部电影打 1~5 分
* 选择算法：

  * Popularity
  * User-based CF
  * Item-based CF
  * SVD
* 点击 Generate Recommendations
* 展示 Top-10 推荐电影卡片

电影卡片包含：

* title
* genres
* score
* reason
* algorithm badge

### 3. Pipeline Animation

动态展示推荐系统流程：

用户行为数据 → 用户—电影评分矩阵 → 相似度计算 → 推荐生成 → 推荐解释

希望有横向流程动画，节点逐个亮起，并用 motion 动画展示数据流动。

### 4. Data Section

展示 MovieLens 数据来源说明。

展示：

* 数据集名称
* ratings.csv / movies.csv
* 用户数、电影数、评分数
* 评分分布图
* 电影类型分布图

### 5. Rating Matrix Section

展示一个小型用户—电影评分矩阵。

要求：

* 用 heatmap 或 table 展示
* 空值显示为灰色或 “—”
* 鼠标 hover 时显示：userId、movie title、rating

### 6. Similarity Section

展示相似度分析。

需要包括：

* 用户相似度矩阵
* 电影相似度矩阵
* 余弦相似度解释
* 可选：选择一部电影，展示最相似的电影 Top-5

### 7. Algorithm Comparison Section

展示四种算法的对比。

表格字段：

* Algorithm
* Core Idea
* Input
* Strength
* Weakness
* Suitable Scenario

### 8. Case Study Section

展示至少两个用户的推荐案例。

每个案例包括：

* 用户已评分电影
* 推荐结果
* 推荐依据
* 成功推荐案例
* 可能错误推荐案例

### 9. Limitations & Risks Section

讨论推荐系统局限与风险：

* 数据稀疏
* 冷启动
* 信息茧房
* 隐私泄露
* 兴趣固化
* 热门偏置
* 推荐结果缺乏多样性

这一部分也要设计得有视觉效果，不要只是普通 bullet list。可以用风险卡片。

### 10. Conclusion Section

总结：

* 推荐系统如何利用用户行为预测偏好
* 为什么相似用户会收到相似推荐
* 不同算法的差异
* 推荐系统的价值与风险

## 设计风格

整体风格：

* 科技感
* 深色主题
* 现代 dashboard 风格
* 有动态滚动动画
* 卡片式布局
* 渐变色、玻璃拟态、发光边框可以使用
* 不要像普通 PPT
* 不要太幼稚
* 页面要有“系统正在运行”的感觉

可以使用类似配色：

* 深蓝 / 黑紫背景
* 青蓝色、紫色作为高亮
* 推荐分数用醒目的 badge 展示

## README 要求

README.md 需要包含：

1. 项目简介
2. 项目结构
3. 如何下载 MovieLens small 数据集
4. 如何运行 Python 预处理脚本
5. 如何启动 React 项目
6. 四种推荐算法说明
7. 页面模块说明
8. 课程项目可交付内容对应关系

## 最终目标

请生成一个完整、可运行、结构清晰、适合课程展示的 React 项目。重点是让它看起来像一个真正的迷你推荐系统，而不是静态报告网页。

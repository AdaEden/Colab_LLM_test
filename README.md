# 一千零一夜的国王 - The King of Arabian Nights

与《一千零一夜》中的萨珊王对话的互动式聊天机器人，使用GLM-4-0520大语言模型实现角色扮演。女主角具有将他人语言化为现实的神奇能力！

## ✨ 功能特色

- 🤖 **AI角色扮演**: 基于GLM-4-0520的萨珊王角色扮演
- 💬 **实时对话**: 流畅的聊天体验，具有1001夜风格
- ✨ **智能元素提取**: 从国王的回复中提取指定类别的元素
- 🎨 **高亮显示**: 实时高亮显示提取的元素，支持点击交互
- 📝 **文本标记**: 生成带有{{}}标记的文本用于语言化现实
- 🎨 **精美UI**: 波斯风格的渐变背景和金色主题
- 📱 **响应式设计**: 完美适配移动端和桌面端

## 🛠 技术栈

- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **后端**: Next.js API Routes
- **大模型**: GLM-4-0520 (智谱AI)
- **部署**: Vercel
- **图标**: Lucide React

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd chatbot-king
```

### 2. 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 3. 配置环境变量

在项目根目录创建 `.env.local` 文件：

```env
GLM_API_KEY=your_glm_api_key_here
```

> 获取GLM API密钥：前往 [智谱AI开放平台](https://open.bigmodel.cn/) 注册并获取API Key

### 4. 本地开发

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 开始使用。

## 🌍 部署到Vercel

### 方法一：通过Git部署（推荐）

1. 将代码推送到GitHub仓库
2. 在 [Vercel](https://vercel.com) 创建新项目
3. 连接你的GitHub仓库
4. 在Vercel项目设置中添加环境变量：
   - `GLM_API_KEY`: 你的智谱AI API密钥
5. 点击部署

### 方法二：Vercel CLI部署

```bash
# 安装Vercel CLI
npm i -g vercel

# 登录Vercel
vercel login

# 部署项目
vercel

# 设置环境变量
vercel env add GLM_API_KEY
```

## 📋 项目结构

```
├── app/                    # Next.js 13+ App Router
│   ├── api/               # API路由
│   │   ├── chat/          # 聊天API
│   │   ├── keywords/      # 关键词分析API（已废弃）
│   │   └── extract-elements/ # 元素提取API
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx          # 主页面
├── components/            # React组件
│   └── HighlightText.tsx  # 文本高亮显示组件
├── types/                 # TypeScript类型定义
│   ├── index.ts          # 主要类型定义
│   └── env.d.ts          # 环境变量类型
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 🎯 使用说明

### 基本对话

1. 在输入框中输入你的故事
2. 按Enter或点击发送按钮
3. 萨珊王会以JSON格式回复，包含评论和续写的故事

### 元素提取功能 ⭐

这是本项目的核心功能，模拟女主角将语言化为现实的能力：

#### 1. 选择元素类别
- 🌸 **植物**: 花朵、树木、草药、果实等
- 🍎 **食物**: 食品、饮料、调料等  
- ⚔️ **武器**: 刀剑、弓箭、盾牌等
- 💎 **宝物**: 珠宝、黄金、宝石等
- 🦅 **动物**: 各种生物、神话生物等
- 🏰 **地点**: 城市、建筑、地形等
- 👑 **人物**: 角色名称、职业身份等
- 👗 **服饰**: 衣物、装饰品等

#### 2. 提取操作流程
1. 发送消息并获得萨珊王的回复
2. 在右侧面板选择要提取的元素类别（可多选）
3. 点击"提取元素"按钮
4. 查看提取结果：
   - **高亮显示**: 聊天中的元素会被高亮标记
   - **标记文本**: 生成带有{{}}的标记版本
   - **元素列表**: 显示所有提取的元素及置信度
   - **分析结果**: AI对提取结果的分析

#### 3. 交互功能
- **悬停效果**: 鼠标悬停在高亮元素上显示详细信息
- **点击交互**: 点击高亮元素可以进行进一步操作（可扩展）
- **颜色编码**: 不同类别的元素使用不同颜色高亮

### 示例

**输入故事**: "沙漠中有一朵红色的荆棘之花，旁边放着一把锋利的宝剑。"

**选择类别**: 植物、武器

**提取结果**:
- 高亮显示: 沙漠中有一朵红色的<mark>荆棘之花</mark>，旁边放着一把锋利的<mark>宝剑</mark>。
- 标记文本: "沙漠中有一朵红色的{{荆棘之花}}，旁边放着一把锋利的{{宝剑}}。"
- 元素列表:
  - 荆棘之花 (植物) - 95%
  - 宝剑 (武器) - 90%

### 角色设定

萨珊王具有以下特征：
- 暴躁且高傲的性格
- 只对有趣的故事感兴趣
- 会对无聊或重复的故事表达愤怒
- 对现代词汇不理解并会愤怒
- 回复格式为JSON结构

## ⚙️ 配置说明

### 环境变量

| 变量名 | 说明 | 必需 |
|-------|------|------|
| `GLM_API_KEY` | 智谱AI的API密钥 | ✅ |

### GLM模型参数

- **模型**: `glm-4-0520`
- **Temperature**: 
  - `0.95` (聊天对话)
  - `0.1` (元素提取 - 需要更精确)
- **Max Tokens**: 
  - `500` (聊天对话)
  - `800` (元素提取)

## 🎨 界面特色

- **波斯风格设计**: 夜蓝色到皇家紫色再到波斯金的渐变背景
- **毛玻璃效果**: 现代化的半透明面板
- **智能高亮**: 8种颜色区分不同类别的元素
- **响应式布局**: 适配各种屏幕尺寸
- **流畅动画**: 平滑的加载和交互动画

## 🎯 最佳操作流程

### 对于1001夜游戏开发者：

1. **故事创作阶段**:
   - 输入富含各种元素的故事片段
   - 让萨珊王续写并丰富故事内容

2. **元素收集阶段**:
   - 根据游戏需要选择特定元素类别
   - 提取国王回复中的关键元素
   - 获得标记后的文本用于游戏逻辑

3. **游戏机制设计**:
   - 利用提取的元素创建游戏道具
   - 基于置信度设计道具品质
   - 使用高亮功能进行玩家交互

4. **扩展开发**:
   - 修改 `handleElementClick` 函数添加自定义交互
   - 扩展元素类别以适应游戏世界观
   - 集成到游戏的物品生成系统

## 🔧 自定义配置

### 修改系统提示词

编辑 `app/api/chat/route.ts` 中的 `systemPrompt` 变量来调整萨珊王的行为和回复风格。

### 添加新的元素类别

在 `app/page.tsx` 中修改 `ELEMENT_CATEGORIES` 数组：

```typescript
const ELEMENT_CATEGORIES = [
  { id: 'magic', name: '魔法', description: '咒语、法术、魔法效果等', icon: '🔮' },
  // ... 其他类别
]
```

同时在 `app/api/extract-elements/route.ts` 中更新系统提示词的类别定义。

### 调整元素高亮颜色

在 `components/HighlightText.tsx` 中修改 `getCategoryColor` 函数：

```typescript
const colors: { [key: string]: string } = {
  '新类别': 'bg-cyan-400/30 text-cyan-700 border-cyan-400',
  // ... 其他颜色
}
```

## 🐛 故障排除

### 常见问题

1. **API调用失败**
   - 检查GLM_API_KEY是否正确设置
   - 确认API密钥有效且有足够的额度

2. **元素提取不准确**
   - 尝试调整系统提示词的描述
   - 增加更多示例和规则
   - 检查fallback匹配规则

3. **高亮显示异常**
   - 确认元素的startIndex和endIndex正确
   - 检查文本是否包含特殊字符

4. **TypeScript错误**
   - 运行 `npm install` 确保所有依赖已安装
   - 检查Node.js版本是否符合要求（推荐16+）

### 调试模式

在开发环境中，API错误会在浏览器控制台显示详细信息。

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 🙏 致谢

- [智谱AI](https://open.bigmodel.cn/) 提供GLM-4-0520模型
- [Next.js](https://nextjs.org/) 提供优秀的React框架
- [Tailwind CSS](https://tailwindcss.com/) 提供实用的CSS框架
- [Vercel](https://vercel.com/) 提供免费的部署平台 
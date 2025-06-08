# 一千零一夜的国王 - The King of Arabian Nights

与《一千零一夜》中的萨珊王对话的互动式聊天机器人，使用GLM-4-0520大语言模型实现角色扮演。

## ✨ 功能特色

- 🤖 **AI角色扮演**: 基于GLM-4-0520的萨珊王角色扮演
- 💬 **实时对话**: 流畅的聊天体验，具有1001夜风格
- 🔍 **关键词分析**: 智能分析国王回复中的关键词
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
│   │   └── keywords/      # 关键词分析API
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx          # 主页面
├── types/                 # TypeScript类型定义
│   └── index.ts
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

### 关键词分析

1. 发送消息并获得AI回复
2. 点击右侧"分析最后回复"按钮
3. 查看提取的关键词、分析结果和置信度

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
- **Temperature**: `0.95` (聊天) / `0.3` (关键词分析)
- **Max Tokens**: `500` (聊天) / `300` (关键词分析)

## 🎨 界面特色

- **波斯风格设计**: 夜蓝色到皇家紫色再到波斯金的渐变背景
- **毛玻璃效果**: 现代化的半透明面板
- **响应式布局**: 适配各种屏幕尺寸
- **流畅动画**: 平滑的加载和交互动画

## 🔧 自定义配置

### 修改系统提示词

编辑 `app/api/chat/route.ts` 中的 `systemPrompt` 变量来调整萨珊王的行为和回复风格。

### 调整UI主题

在 `tailwind.config.js` 中修改自定义颜色：

```javascript
colors: {
  'persian-gold': '#FFD700',    // 波斯金
  'royal-purple': '#663399',    // 皇家紫
  'night-blue': '#191970',      // 夜蓝色
}
```

## 🐛 故障排除

### 常见问题

1. **API调用失败**
   - 检查GLM_API_KEY是否正确设置
   - 确认API密钥有效且有足够的额度

2. **样式显示异常**
   - 确认Tailwind CSS正确安装
   - 检查是否有CSS冲突

3. **TypeScript错误**
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
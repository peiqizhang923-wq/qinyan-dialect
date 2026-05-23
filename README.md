# 秦言三韵 · 掌上长安

> 陕西地域方言智能文创平台 | 第28届中国机器人及人工智能大赛

基于大语言模型的陕西方言智能转译、语音合成与非遗数字化传承系统。覆盖**关中、陕北、陕南**三大方言区，融合 AI 翻译、神经网络语音合成、趣味互动与方言保护数据看板。

---

## 功能模块

| 模块 | 说明 |
|------|------|
| 🗣️ **乡音翻译机** | 普通话 ↔ 关中/陕北/陕南方言双向转译，AI 驱动 |
| 🏮 **大唐雅言** | 现代文案 → 盛唐长安古典文风转换，内置 11 处名胜 |
| 📖 **秦字解码局** | 方言生僻字发音、释义、地域分布、民俗典故全维度检索 |
| 📝 **方言八级考** | 16 题随机出 3 题，即时评分，游戏化方言学习 |
| 🎋 **长安祈福签** | 八支签文随机抽取，签筒抖动动画 |
| 🎰 **吃货大转盘** | 12 道三秦美食随机抽取，弹出古风美食文化卡 |
| 📊 **评测中心** | 50 条标准语料库，三方言自动量化评测 |
| 📜 **长安行迹** | 用户全平台操作历史时间线 |
| 🏛️ **方言保护** | 陕西省 89 区县方言保护数据看板 |
| ⚙️ **引擎配置** | AI 提供商与 TTS 语音引擎切换 |

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | HTML5 + CSS3 + Vanilla JavaScript（零框架） |
| AI 大模型 | 火山引擎 · 豆包（OpenAI 兼容 API） |
| 语音合成 | Edge-TTS（微软陕西话神经语音）+ 讯飞 WebSocket + Web Speech API |
| 后端数据库 | SQLite + Python HTTP API Server（端口 9881） |
| 桌面封装 | Electron |
| 后端服务 | Python（TTS:9880 / DB:9881 两个微服务） |
| 音效 | Web Audio API 过程化合成（无外部音频文件） |
| 存储 | localStorage（前端缓存）+ SQLite（后端持久化）双写架构 |

---

## 系统架构

```
前端 UI（11个HTML页面）
    │
    ├── common.js 公共算法层
    │   ├── callAI() ──── HTTPS ──► 火山引擎豆包 API
    │   ├── speakText() ─ HTTP ──► Python TTS Server :9880
    │   │                   WSS  ──► 讯飞 TTS（备选）
    │   │                   API ──► Web Speech（兜底）
    │   ├── dbFetch() ─── HTTP ──► Python DB Server :9881
    │   │                   └──► SQLite 数据库
    │   └── SFX / STATE / HMAC-SHA256
    │
    └── 本地双写：localStorage + SQLite 持久化
```

---

## 环境要求

| 依赖 | 版本 | 用途 |
|------|------|------|
| Python | ≥ 3.8 | TTS 语音服务 |
| Node.js | ≥ 18 | Electron 桌面版（可选） |
| 现代浏览器 | Chrome / Edge 最新版 | 运行 Web 版 |

---

## 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/peiqizhang923-wq/qinyan-dialect.git
cd qinyan-dialect
```

### 2. 配置 API 密钥

```bash
# 复制配置模板
cp config.example.js config.js
```

编辑 `config.js`，填入你的 API 密钥：

```javascript
var CONFIG = {
    VOLC_API_KEY: '你的火山引擎API密钥',
    VOLC_MODEL:   '你的模型端点ID',
    XF_APP_ID:     '你的讯飞应用ID',      // 可选
    XF_API_KEY:    '你的讯飞API Key',     // 可选
    XF_API_SECRET: '你的讯飞API Secret'   // 可选
};
```

> **如何获取密钥：**
> - 火山引擎（豆包）：注册 [volcengine.com](https://www.volcengine.com)，开通豆包大模型服务，创建 API Key 和端点
> - 讯飞 TTS（可选）：注册 [xfyun.com](https://www.xfyun.com)，开通语音合成服务

### 3. 安装 Python 依赖

```bash
pip install -r requirements_tts.txt
```

> `db_server.py` 仅需 Python 内置库（sqlite3 / http.server），无需额外安装。

### 4. 启动后端服务

```bash
# 启动数据库服务（端口 9881）
python db_server.py

# 另开终端，启动 TTS 语音服务（端口 9880）
python tts_server.py
```

> 也可直接双击 `启动.bat`，自动拉起两个服务并打开首页。

### 5. 打开应用

**方式一：浏览器（推荐）**

双击 `启动.bat`，或直接浏览器打开 `index.html`

**方式二：Electron 桌面应用**

```bash
npm install
npm start
```

> 💡 如果未安装 Python 或 TTS 服务未启动，翻译功能仍可正常使用，语音播放会自动降级到浏览器内置语音。

---

## 项目结构

```
qinyan-dialect/
├── index.html              # 首页总览
├── translate.html          # 乡音翻译机
├── classical.html          # 大唐雅言
├── dict.html               # 秦字解码局
├── quiz.html               # 方言八级考
├── fortune.html            # 长安祈福签
├── roulette.html           # 吃货大转盘
├── settings.html           # 引擎配置
├── eval.html               # 评测中心
├── history.html            # 长安行迹
├── protect.html            # 方言保护
├── common.css              # 共享样式（盛唐美学主题）
├── common.js               # 共享逻辑（AI调用/TTS/音效/存储）
├── config.example.js       # 配置文件模板
├── config.js               # 真实配置（gitignore，需自行创建）
├── tts_server.py           # Python TTS HTTP 服务（端口 9880）
├── db_server.py            # Python 数据库 API 服务（端口 9881）
├── main.js                 # Electron 主进程
├── preload.js              # Electron 预加载脚本
├── package.json            # Node.js 项目配置
├── requirements_tts.txt    # Python 依赖
├── 启动.bat                # 一键启动脚本（浏览器版）
├── 启动-Electron.bat       # 一键启动脚本（Electron版）
│
├── img/                    # 图片素材
│   ├── food/               #   12道美食实拍
│   └── spots/              #   11处长安名胜
│
├── 算法技术文档.md          # 完整算法技术文档
├── PPT文案-算法技术.md      # PPT 汇报文案
├── 2分钟演示视频脚本.md      # 比赛演示视频脚本
└── 演示视频脚本.md          # 3分钟版演示视频脚本
```

---

## 语音引擎说明

| 引擎 | 音色 | 网络要求 | 说明 |
|------|------|----------|------|
| **Edge-TTS**（主力） | 纯正陕西话（微软 Xiaoni） | 需联网 + Python 服务 | 神经网络语音，自然度最高 |
| **讯飞 TTS**（备选） | 普通话（参数模拟方言） | 需联网 | WebSocket 流式合成 |
| **Web Speech**（兜底） | 系统语音 | 无需网络 | 离线可用，降级保障 |

引擎故障时自动切换到下一级，用户无感知。

---

## 数据库说明

系统采用 **localStorage（前端缓存）+ SQLite（后端持久化）双写架构**，确保离线可用且数据不丢失。

| 数据表 | 存储内容 |
|--------|---------|
| `history` | 用户操作历史（翻译、解码、考试、抽签等） |
| `eval_results` | 评测中心的翻译质量数据 |
| `settings` | 引擎配置（AI提供商、语音引擎等） |
| `dialect_vocabulary` | 24 条方言词汇种子数据（含发音、释义、地域、典故） |

**API 端点（`http://localhost:9881`）：**

| 端点 | 方法 | 功能 |
|------|------|------|
| `/api/history` | GET/POST | 读写操作历史 |
| `/api/eval` | GET/POST | 读写评测结果 |
| `/api/eval/stats` | GET | 三方言准确率聚合统计 |
| `/api/settings` | GET/POST | 读写用户配置 |
| `/api/vocabulary` | GET | 查询方言词汇（支持 `?word=` 和 `?region=` 参数） |
| `/api/health` | GET | 健康检查 |

> 前端调用 `saveHistory()` 时同时写入 localStorage 和后端 SQLite，后端不可用时不影响正常使用。

---

## 评测说明

系统内置 50 条标准测试语料，覆盖 6 大场景（日常问候 / 饮食文化 / 天气环境 / 情感表达 / 动作行为 / 地点场景）。评测采用方言特征词密度算法自动评分：

- 加载对应方言区的特征词库（共 27 个特征词）
- 统计 AI 翻译结果中特征词出现数量
- 评分 = 60（基础分）+ 特征词命中数 × 10（上限 40）
- 评级：≥85 优 / 70–84 中 / <70 低

---

## 常见问题

**Q: 打开 index.html 后语音播放没声音？**
A: 检查是否启动了 Python TTS 服务（`python tts_server.py`），确认终端显示"Edge-TTS server ready on :9880"。如 Python 不可用，系统会自动降级到浏览器语音。

**Q: AI 翻译返回错误？**
A: 检查 `config.js` 中的 `VOLC_API_KEY` 是否正确，火山引擎账户是否有余额。

**Q: 数据库服务启动报错？**
A: `db_server.py` 仅使用 Python 内置库（sqlite3 / http.server），无需 pip 安装任何依赖。确保 Python ≥ 3.8 且 9881 端口未被占用。

**Q: Electron 启动后一片空白？**
A: 先运行 `npm install` 安装 Electron。如已安装，尝试 `npx electron .` 查看控制台报错。

---

## 参考资料

- 《陕西方言集成》（10卷）—— 陕西省档案局，商务印书馆
- 陕西 310GB 方言语音档案专库 —— 省/市/县三级全覆盖
- 中国语言资源保护工程 —— 教育部、国家语委

---

## License

MIT

# KOF Nano Banana MCP Server 🍌

Gemini 原生圖片生成 MCP Server (Nano Banana)。[KeepOnFirst Agentic Workflow](https://github.com/keeponfirst/keeponfirst-agentic-workflow-starter) 的一部分。

[English](README.md) | 繁體中文

## 功能特色

- **圖片生成**：支援 Gemini 2.5 Flash Image 和 Gemini 3 Pro Image
- **佇列處理**：支援批次處理 prompt 檔案，具備驗證與 Dry-run 功能
- **YAML Frontmatter**：支援在 Prompt 檔頭設定參數
- **跨 IDE 支援**：適用於任何支援 MCP 的客戶端 (Cursor, Windsurf, Claude Desktop 等)

## ⚠️ 重要提示：費用與 Free Tier

**請注意：Gemini API Free Tier 不支援圖片生成模型。**

若要使用此 MCP Server，您的 Google Cloud 專案必須啟用計費功能。

| 模型 | 單張價格 (預估) |
|------|-----------------|
| **Gemini 2.5 Flash Image** | ~$0.039 (1024x1024) |
| **Gemini 3 Pro Image** (2K) | ~$0.134 |
| **Gemini 3 Pro Image** (4K) | ~$0.24 |

*價格以 Google 官方公告為準*

## ☕ 支持這個專案

如果這個專案對你有幫助，歡迎請我喝杯咖啡：

<a href="https://www.buymeacoffee.com/keeponfirst" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" height="45" />
</a>

## 安裝方式

### 方法 A：透過 npx 使用 (推薦)

```json
{
  "mcpServers": {
    "nanobanana": {
      "command": "npx",
      "args": ["-y", "@keeponfirst/kof-nanobanana-mcp"],
      "env": {
        "GEMINI_API_KEY": "您的-API-Key"
      }
    }
  }
}
```

### 方法 B：本地開發

```bash
cd kof-nanobanana-mcp
npm install
npm run build
```

然後在 MCP 設定檔中使用絕對路徑指向 `dist/index.js`。

## 設定

1. 前往 [Google AI Studio](https://aistudio.google.com/apikey) 取得 API Key
2. 確保您的專案已綁定 Billing Account

## Tools 工具說明

### `nanobanana_generate_image`

產生單張圖片。

**參數：**
| 名稱 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `prompt` | string | ✅ | 圖片描述 (10-5000 字元) |
| `output_path` | string | ✅ | 儲存路徑 |
| `model` | string | ❌ | `gemini-2.5-flash-image` (預設) 或 `gemini-3-pro-image-preview` |
| `aspect_ratio` | string | ❌ | `1:1`, `16:9`, `9:16`, `4:3`, `3:4` |
| `overwrite` | boolean | ❌ | 是否覆蓋現有檔案 (預設: false) |

### `nanobanana_list_queue`

列出並驗證佇列中的 prompt 檔案。

### `nanobanana_process_queue`

批次處理佇列中的所有檔案。

**參數：**
| 名稱 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `queue_dir` | string | ❌ | 佇列目錄 (預設: `nanobanana/queue`) |
| `validate_only` | boolean | ❌ | 僅驗證，不產圖 |
| `dry_run` | boolean | ❌ | 模擬執行，不呼叫 API |
| `overwrite` | string | ❌ | 策略：`skip` (預設), `overwrite`, `rename` |

## Prompt 檔案格式

在 `nanobanana/queue/` 建立 `.md` 檔案，支援 YAML frontmatter：

```markdown
---
output_path: assets/generated/workflow-hero.png
model: gemini-2.5-flash-image
aspect_ratio: 16:9
overwrite: false
---

# Hero Image

Create a modern, sleek hero illustration showing...
```

## 授權

MIT

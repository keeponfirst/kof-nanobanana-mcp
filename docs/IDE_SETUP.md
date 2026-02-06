# 其他 IDE 設定指南

這份文件說明如何在不同的 AI IDE 中設定 KOF Nano Banana MCP Server。

## 前置需求

1. Node.js 18+
2. Gemini API Key（從 [AI Studio](https://aistudio.google.com/apikey) 取得）

## 快速開始

### 步驟 1：複製專案

```bash
git clone https://github.com/keeponfirst/keeponfirst-agentic-workflow-starter
cd keeponfirst-agentic-workflow-starter/kof-nanobanana-mcp
npm install
npm run build
```

### 步驟 2：記住 dist/index.js 的完整路徑

```bash
pwd
# 例如: /Users/yourname/projects/keeponfirst-agentic-workflow-starter/kof-nanobanana-mcp
# 完整路徑就是: /Users/yourname/projects/keeponfirst-agentic-workflow-starter/kof-nanobanana-mcp/dist/index.js
```

---

## IDE 設定

### Cursor

**檔案位置**: `~/.cursor/mcp.json`

```json
{
  "mcpServers": {
    "nanobanana": {
      "command": "node",
      "args": ["/完整路徑/kof-nanobanana-mcp/dist/index.js"],
      "env": {
        "GEMINI_API_KEY": "你的-API-Key"
      }
    }
  }
}
```

設定後重啟 Cursor。

---

### Windsurf (Codeium)

**檔案位置**: `~/.codeium/windsurf/mcp_config.json`

```json
{
  "mcpServers": {
    "nanobanana": {
      "command": "node",
      "args": ["/完整路徑/kof-nanobanana-mcp/dist/index.js"],
      "env": {
        "GEMINI_API_KEY": "你的-API-Key"
      }
    }
  }
}
```

設定後重啟 Windsurf。

---

### Claude Desktop

**檔案位置**: 
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "nanobanana": {
      "command": "node",
      "args": ["/完整路徑/kof-nanobanana-mcp/dist/index.js"],
      "env": {
        "GEMINI_API_KEY": "你的-API-Key"
      }
    }
  }
}
```

設定後重啟 Claude Desktop。

---

### VS Code + Continue.dev

**檔案位置**: `~/.continue/config.json`

在 `experimental` 區塊加入：

```json
{
  "experimental": {
    "modelContextProtocolServers": [
      {
        "transport": {
          "type": "stdio",
          "command": "node",
          "args": ["/完整路徑/kof-nanobanana-mcp/dist/index.js"],
          "env": {
            "GEMINI_API_KEY": "你的-API-Key"
          }
        }
      }
    ]
  }
}
```

---

### GitHub Copilot (預覽功能)

目前 GitHub Copilot 的 MCP 支援還在預覽階段。請參考官方文件：
https://docs.github.com/en/copilot/customizing-copilot/using-model-context-protocol

---

## 驗證連線

### 方法 1：使用 MCP Inspector

```bash
cd kof-nanobanana-mcp
npx @modelcontextprotocol/inspector node dist/index.js
```

這會開啟一個 web 介面讓你測試所有 tools。

### 方法 2：在 IDE 中呼叫

在你的 AI IDE 中輸入：
> 用 nanobanana_list_queue 列出 queue

如果設定正確，AI 應該會呼叫這個 tool。

---

## 可用的 Tools

| Tool | 說明 |
|------|------|
| `nanobanana_generate_image` | 產生單張圖片 |
| `nanobanana_list_queue` | 列出 queue 中的 prompt |
| `nanobanana_process_queue` | 批次處理 queue |

---

## 常見問題

### Q: MCP server 沒有載入？
A: 確保：
1. 完全關閉 IDE 再重開（不只是重新載入視窗）
2. 路徑正確且檔案存在
3. Node.js 18+ 已安裝

### Q: API Key 錯誤？
A: 
1. 確認 API Key 正確
2. 確認 Gemini API 已啟用付費 tier（image generation 需要）
3. 前往 [AI Studio](https://aistudio.google.com/usage) 檢查額度

### Q: 圖片沒有產生？
A: 檢查 prompt 是否違反內容政策。Gemini 會拒絕某些類型的圖片。

---

## 費用參考

| Model | 價格 |
|-------|------|
| gemini-2.5-flash-image | ~$0.039/張 |
| gemini-3-pro-image-preview (2K) | ~$0.134/張 |
| gemini-3-pro-image-preview (4K) | ~$0.24/張 |

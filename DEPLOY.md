# 🚀 發佈指南 (Deployment Guide)

這份文件指引如何將 `kof-nanobanana-mcp` 獨立為一個新的 Git repository 並發佈到 npm。

## 1. 建立獨立 Repo

由於此目錄目前位於另一個 repo 內，你需要先將其移出或初始化為新的 git repo。

### 選項 A：初始化為新的 Repo (推薦)

執行以下指令將此資料夾初始化為新專案：

```bash
# 1. 進入目錄
cd kof-nanobanana-mcp

# 2. 初始化 git
git init
git branch -M main

# 3. 建立 .gitignore
echo "node_modules/\ndist/\n.env\n.DS_Store" > .gitignore

# 4. 提交程式碼
git add .
git commit -m "feat: Initial commit of kof-nanobanana-mcp"

# 5. (選擇性) 連接到你的 GitHub
# gh repo create keeponfirst/kof-nanobanana-mcp --public --source=. --remote=origin
```

## 2. 發佈到 npm

確保你已經登入 npm (需要屬於 @keeponfirst organization 或更改 package name)。

```bash
# 1. 登入 (如果尚未登入)
npm login

# 2. 發佈
npm publish --access public
```

## 3. 使用方式 (發佈後)

發佈成功後，任何使用者都可以透過 `npx` 直接執行，無需安裝：

**設定 `mcp_config.json`**:

```json
{
  "mcpServers": {
    "nanobanana": {
      "command": "npx",
      "args": ["-y", "@keeponfirst/kof-nanobanana-mcp"],
      "env": {
        "GEMINI_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

這樣就完成了完全解耦！

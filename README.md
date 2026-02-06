# KOF Nano Banana MCP Server 🍌

MCP server for Gemini native image generation (Nano Banana). Part of the [KeepOnFirst Agentic Workflow](https://github.com/keeponfirst/keeponfirst-agentic-workflow-starter).

## Features

- **Generate images** using Gemini 2.5 Flash Image or Gemini 3 Pro Image
- **Process queue** of prompt files with validation and dry-run support
- **YAML frontmatter** support for prompt configuration
- **Cross-IDE compatible** - works with any MCP-enabled client

## Installation

### Option 1: Use via npx (Recommended)

If you have published this package or use it locally:

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

### Option 2: Local Development

```bash
cd kof-nanobanana-mcp
npm install
npm run build
```

Then configure absolute path in your MCP config (see Configuration section).

## Configuration

### 1. Get a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Create an API key
3. Note: Image generation costs ~$0.039/image (Flash) or ~$0.134/image (Pro 2K)

### 2. Add to MCP Config

Add to your MCP configuration file (e.g., `~/.gemini/antigravity/mcp_config.json`):

```json
{
  "servers": {
    "nanobanana": {
      "command": "node",
      "args": ["/path/to/kof-nanobanana-mcp/dist/index.js"],
      "env": {
        "GEMINI_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Tools

### `nanobanana_generate_image`

Generate a single image.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `prompt` | string | ✅ | Image description (10-5000 chars) |
| `output_path` | string | ✅ | Path to save the image |
| `model` | string | ❌ | `gemini-2.5-flash-image` (default) or `gemini-3-pro-image-preview` |
| `aspect_ratio` | string | ❌ | `1:1`, `16:9`, `9:16`, `4:3`, `3:4` |
| `overwrite` | boolean | ❌ | Overwrite existing file (default: false) |

**Example:**
```json
{
  "prompt": "A modern flat illustration of three AI robots working together on code",
  "output_path": "assets/generated/workflow-hero.png",
  "model": "gemini-2.5-flash-image",
  "aspect_ratio": "16:9"
}
```

### `nanobanana_list_queue`

List and validate prompt files in the queue.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `queue_dir` | string | ❌ | Queue directory (default: `nanobanana/queue`) |
| `validate` | boolean | ❌ | Validate files (default: true) |
| `check_conflicts` | boolean | ❌ | Check if outputs exist (default: true) |

### `nanobanana_process_queue`

Batch process all prompt files.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `queue_dir` | string | ❌ | Queue directory (default: `nanobanana/queue`) |
| `validate_only` | boolean | ❌ | Only validate, no generation |
| `dry_run` | boolean | ❌ | Preview without API calls |
| `overwrite` | string | ❌ | `skip`, `overwrite`, or `rename` |

## Prompt File Format

Create `.md` files in `nanobanana/queue/` with YAML frontmatter:

```markdown
---
output_path: assets/generated/workflow-hero.png
model: gemini-2.5-flash-image
aspect_ratio: 16:9
overwrite: false
---

# Workflow Hero Image

Create a modern, sleek hero illustration showing three AI agents
working together in a software development workflow.

## Style Guidelines
- Style: Flat illustration with gradients
- Color palette: Deep purple (#6B46C1) to blue (#3B82F6)
- Background: Subtle gradient
```

## Pricing Reference

| Model | Price per Image |
|-------|-----------------|
| Gemini 2.5 Flash Image | ~$0.039 (1024x1024) |
| Gemini 3 Pro Image (2K) | ~$0.134 |
| Gemini 3 Pro Image (4K) | ~$0.24 |

## License

MIT

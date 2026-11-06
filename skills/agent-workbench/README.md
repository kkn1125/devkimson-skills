# Agent Workbench portable runtime

Install the same Agent MCP connection and small workflow entry on another PC. Full rules, task/case records, and the canonical skill remain in MCP. This package does not provision an unrelated developer toolchain.

Requires Node.js 22 or newer and an installed Codex CLI supporting `mcp get --json` and `env_http_headers`. There are no npm dependencies or install scripts. Windows supports a native `codex.exe` or the standard npm `codex.cmd` installation on PATH. The npm JavaScript launcher runs directly under Node without a shell. macOS/Linux use `codex`. Only Codex is supported by this release.

## Skill repository installation

The local skill source is managed at `devkimson-skills/skills/agent-workbench/SKILL.md`. Its full workflow and operating rules remain MCP resources. From the devkimson-skills checkout, install this entry using the repository's normal skill installer:

```powershell
npx skills add . -g -a codex --skill agent-workbench -y
```

This installs the entry; an Agent MCP connection must already be configured. The optional portable installer below sets up that connection and the same entry on a separate PC. No personal profile is changed by checking out this repository.

## Preview and install

Extract the ZIP anywhere. Run from its directory, or use the absolute path to `cli.mjs`. All paths below are examples that you explicitly choose. The command does not infer your personal profile.

```powershell
node cli.mjs install --codex-home C:/profiles/work/.codex --workspace C:/projects/my-project
node cli.mjs install --codex-home C:/profiles/work/.codex --workspace C:/projects/my-project --apply
```

The first command is a dry run. `--dry-run` is also accepted. Only `--apply` writes the target configuration, receipt, and workspace entry. An optional `--url https://your-agent-mcp.example/mcp` overrides the default endpoint. URLs cannot contain credentials, query strings, or fragments. HTTP is accepted only for loopback testing. `--token-env NAME` changes the token environment variable name, never its value.

The installer stages a copy of only the target TOML in a temporary directory. It appends or replaces its exact marked `agent-workbench` server block, then validates the candidate with Codex's read-only `mcp get --json` parser. CLI output and TOML contents are never printed. Temporary staging is removed after the command. Unrelated config bytes are preserved. The installer refuses to take over a pre-existing reserved server or edited entry. Existing installed entries must match their receipt and marked block before an update. Repeating an unchanged install changes no target files. Concurrent edits stop installation; already applied files are restored when they still match this invocation's writes.

Managed targets are `<codex-home>/config.toml`, `<codex-home>/agent-workbench.json`, and `<workspace>/.agents/skills/agent-workbench/SKILL.md`. No `AGENTS.md`, other skills, credentials, `auth.json`, original pstack files, or local `ai-workspace/` files are copied or changed. Installation refuses symbolic links in target paths. Protect the selected directories with your OS account permissions.

On each PC, supply `AGENT_MCP_TOKEN` to the launching process through your approved secret manager or local environment. Do not put its value in arguments, this bundle, source control, chat, or a shared log. The generated connection uses this configuration.

```toml
[mcp_servers.agent-workbench]
url = "https://agent-mcp.devkimson.kro.kr/mcp"

[mcp_servers.agent-workbench.env_http_headers]
"x-mcp-token" = "AGENT_MCP_TOKEN"
```

Launch Codex with the selected configuration home and workspace after setting the token locally.

```powershell
$env:CODEX_HOME = 'C:/profiles/work/.codex'
codex.cmd -C C:/projects/my-project
```

Invoke `$agent-workbench` in that workspace. If skill discovery does not refresh, restart Codex. A separate portable config home has its own Codex login state; sign in through Codex when needed rather than copying login files. Using a separate config home is optional; applying to an existing home requires your own explicit target and `--apply`.

## Doctor

```powershell
node cli.mjs doctor --codex-home C:/profiles/work/.codex --workspace C:/projects/my-project
node cli.mjs doctor --codex-home C:/profiles/work/.codex --workspace C:/projects/my-project --online
```

Repeat any custom `--url` or `--token-env` installation options with doctor. Offline doctor checks files, ownership hashes, the parsed Codex configuration, and whether the token environment variable is present. It makes no network call and reports `authenticatedMcp: not-tested`. It never prints the variable value. A missing token is reported separately from valid files/configuration.

`--online` performs MCP initialization, tool discovery, and a read-only authenticated `resource_search` for the canonical protocol path. It reports only execution status, never resource bodies, response headers, or tokens. `resource_search-executed` proves a tool call succeeded. It does not prove canonical resources exist, workflow/model generation, Office deployment, or end-to-end task completion. Initialization/tool failures are reported as `failed`, without forwarding server diagnostics. The online check uses the configured `x-mcp-token` header and rejects redirects. It accepts JSON or SSE MCP responses with a bounded read and timeout.

The runtime entry selects current MCP tools from the exposed inventory. New compact, batched, and version-aware context tools are optional until the server exposing them is deployed. Existing read tools remain a fallback.

## Test and bundle

```powershell
npm test
npm run bundle -- --out C:/temp/agent-workbench-release
```

Tests use temporary profiles/workspaces and the installed Codex CLI. They do not invoke model generation or apply to a personal profile. The bundle command uses an explicit file allowlist and produces a ZIP plus SHA-256 sidecar. The ZIP contains `SHA256SUMS` for its source files. No runtime profile, environment file, token, or repository settings are included. You can run the extracted package outside this source directory without npm install.

Codex config support was checked against installed CLI help and temporary `mcp add/get/list` probes. The runtime uses only `mcp get` because add/list may initiate OAuth discovery. Workspace skill discovery follows [OpenAI's skill documentation](https://learn.chatgpt.com/docs/build-skills). No support for Cursor or Claude is claimed.

---
name: agent-workbench
description: Load the shared Agent MCP workbench workflow for development, QA, and project tasks or cases.
---

# Agent Workbench runtime entry

This file is a portable pointer. The current rules and full workflow live in Agent MCP, not this installation.

1. Inspect the connected Agent MCP tool inventory. Prefer `context_prepare` when exposed. Otherwise use exposed `rule_get_effective_compact` or `rule_get_effective`, and `context_resolve`. Supply the actual workspace path and agent name. Use compact projection only when its schema supports it.
2. Search Agent MCP resources for the exact paths `agent-protocol/70-agent-workbench.md` and `ai-workspace/60-skills/agent-workbench/SKILL.md`. Read their current content through `resource_read_budgeted` or `resource_get_content`. Use `resource_read_batch` and `knownVersion` only when exposed by the current server. Follow those canonical instructions for the requested task.
3. Keep task/case records and workspace state in MCP resources. Do not write a local `ai-workspace/` mirror. If tools or canonical resources are unavailable, report the missing connection/resource and stop dependent work. A local doctor pass does not prove authenticated MCP execution.

Do not copy credentials or global settings between PCs. This entry grants no additional action permissions.

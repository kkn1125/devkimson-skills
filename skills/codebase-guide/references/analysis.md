# Focused analysis and refresh

## Feature tracing

Start from an observable anchor: screen label, route, command, event, job or public symbol. Find registration and actual dispatch, then trace input validation/authentication, transformations, business rules, state writes, output and failure paths. A successful path helps orientation but does not establish error behavior.

Read tests and fixtures as evidence of expected behavior, separately from implementation and observed execution. Compare docs against code. Follow dependency injection bindings, middleware, reflection, plugin registration, SQL/ORM relations, feature flags and event routing when they participate. Describe what is dynamically resolved and cannot be established statically.

Persist a feature guide only as detailed as needed: trigger, ordered flow, responsibilities, important data/contracts, exceptional behavior, evidence links, focused diagram, and the best place to start a change. Do not invent a design rationale from code; use history or label rationale as inference.

## Change impact

Get the proposed task, desired behavior or existing diff. A configuration switch, dependency upgrade, job rerun, data repair or schema change can be a concrete target without a code diff. If no target exists, describe dependency relationships and request one before claiming a task-specific impact assessment.

Search every caller of the target symbol and inspect actual use, not just matching names. Trace outward to consumers and inward to shared dependencies. Check re-exports, routes, API schemas, serializers, database readers/writers, caches, queue/event consumers, background jobs, configuration, migrations and tests where relevant. Follow cross-repository contracts only within available scope; name inaccessible consumers.

Use a compact table:

| Target | Relationship and evidence | Expected consequence | Confidence | Verification needed |
| --- | --- | --- | --- | --- |

Separate directly confirmed effects, transitive effects supported by a trace, and possible effects needing runtime or external confirmation. Include negative/error paths and compatibility for old data, clients and event payloads. Stop expanding when a stable unchanged contract isolates the change, or when access/evidence ends; explain the boundary. Imports alone do not establish behavioral impact.

Recommend the smallest relevant existing tests and manual checks. State which checks ran. Do not implement the proposed change unless separately requested.

## Technology and code conventions

Identify actual framework bootstrapping, adapters, module/bean registration, dependency injection, data access and configuration rather than equating installed packages with an active stack. Separate manifest version ranges, resolved lockfile versions and observed runtime versions. For a monorepo, report per executable unit; do not apply one package's stack to every service. Identify important internal shared modules and their responsibilities as well as third-party dependencies. Include mixed stacks and migration remnants when evidence supports them, marking uncertain or apparently inactive dependencies.

Extract a few short, representative snippets from actual maintained application code, with relative file links and symbol names. Choose examples useful for the task: route/controller, service/module boundaries, validation, error handling, database queries/transactions, tests, or frontend state/API access. Explain what each snippet demonstrates and how to follow the local pattern. Redact secrets and omit unrelated code without changing behavior; label omitted context. Do not fabricate an example and present it as extracted source.

Check formatter/linter/compiler configuration and compare more than one relevant implementation where available. Distinguish enforced formatting, repeated implementation conventions and isolated examples. If styles differ by module or generation, describe the target module's convention and the conflict rather than inventing a universal standard. Existing code can contain defects: report questionable examples as observations, not recommended practices. Do not refactor code as part of convention extraction.

## Potentially unused APIs

No frontend reference means only “no call found in the inspected frontend scope,” never “unused” or “safe to delete.” API consumers may include external clients, partners, mobile apps, old frontend versions, scripts, jobs, webhooks, other services and operational tooling. An unregistered route is a different finding from an exposed route with no known consumer; check routing/gateway registration before deciding which applies.

Establish the exact method, effective path, route prefixes/versions and aliases. Search authorized repositories for direct calls, API clients/generated clients, dynamic URL construction, gateway rewrites and configuration. Record which branches/repositories were inspected and which consumers were inaccessible. Tests establish expected contracts, not actual traffic or consumer existence.

Inspect authentication middleware/guards, headers, token validation/issuers/audiences, API keys, scopes, network restrictions, API docs and history for clues about intended clients. Different token/header conventions can suggest an integration path, but do not prove external use or disuse. Describe the inference and contrary evidence; never include token values. If these clues do not resolve consumer identity, say it is unclear.

Use user-authorized access logs, gateway metrics, traces, client inventories or owner confirmation when available. For traffic evidence record environment, observation period, coverage and sampling/retention limits. Zero observed traffic may miss infrequent, seasonal or disaster-recovery use. Distinguish a documented retirement decision from technically proven absence; even owner-approved deletion may retain residual consumer risk.

For each candidate report method/path, registration, found consumers, inspected search scope, authentication clues, traffic evidence and gaps, conclusion and next check. Use conclusions such as **usage confirmed**, **no caller found within inspected scope**, or **unclear**. A deprecation/removal candidate is a recommendation with stated evidence and risk, not a claim of universal non-use. If evidence is insufficient, do not recommend immediate deletion as established-safe; identify the smallest missing check and, when useful, propose observation/deprecation before removal. Do not deploy tracking or remove the API under analysis-only authorization.

## Operational behavior and incident investigation

Apply only the checks relevant to the task; do not produce a generic operational audit.

- Resolve effective configuration through defaults, environment overrides, flags, registrations and deployment units. Redact secret values. Describe source configuration separately from evidence of what the target environment actually runs. Identify whether a change takes effect on reload, restart, rebuild or redeployment when evidence supports it.
- For stateful work, trace readers/writers, transaction and authorization/tenant boundaries, persisted formats and caches. For async or batch work, inspect retries, timeouts, idempotency, duplicate/out-of-order events, scheduling and partial completion where they alter the task outcome. Record irreversible side effects such as notifications or external writes.
- For changes spanning services or persisted data, inspect old/new version compatibility, in-flight work and necessary ordering. Flag rollback limits: reverting code may not reverse data writes or already sent events. Describe recovery options only from existing mechanisms or clearly mark them as proposals; never execute them under analysis-only authorization.
- For incidents, anchor evidence to environment, timestamp/time zone, request/job identifiers and deployed version when available. Trace from the observed symptom and compare with a known-good case if accessible. Examine recent relevant code, configuration and data changes without assuming recency proves causation.
- List plausible causes with supporting and contradicting evidence and the smallest discriminating check. A static code path is not proof of the live incident cause. Use user-authorized logs, metrics, traces and MCP resources; record missing access rather than manufacturing observations.
- Connect verification to observable outcomes: which existing test exercises the contract, what log/metric/state would confirm expected behavior, and which failure would show regression. Record commands only when known from the repository; do not fabricate production queries or runbooks.

For a task report, add operational prerequisites, compatibility/order constraints, failure/recovery limits and post-change observations only where relevant. These are investigation results or proposed checks, not authorization to make the change.

## Refresh

1. Read the prior scope and per-document baseline. Verify repository identity and whether the baseline commit exists; if missing, rebuild the affected map rather than assuming comparability.
2. Inspect committed differences from that baseline, staged/unstaged changes, untracked files and deleted/renamed paths. Old dirty-state metadata is a clue, not a complete content snapshot: reread previously dirty evidence even if the current commit matches.
3. Revisit documents supported by affected symbols/contracts and follow their consumer/provider relationships. Manifest, registration or schema changes may invalidate the overview even without changes in a previously traced function.
4. Recheck evidence links, stale diagrams, setup commands and contradictory notes. Update only verified sections, and retain dates/baselines for remaining sections. If the former baseline cannot reconstruct content, state that limitation and reread the relevant scope.

## Method sources

Consulted 2026-10-22. These guide analysis choices, not claims about a particular repository.

- [C4 model diagrams](https://c4model.com/diagrams): choose useful abstraction levels; context and container views often suffice. Use the idea without requiring a C4 tool or all four levels.
- [GitHub ReadME: code visibility](https://github.com/readme/guides/code-visibility-codesee): connect what code does, why it exists and where it belongs. This is practitioner guidance by a tooling vendor, not independent evidence of tool efficacy.
- [Code Compass research](https://arxiv.org/abs/2405.06271): highlights difficulty combining documentation with code exploration. Use evidence-linked reading paths; do not generalize its formative results into guaranteed onboarding speed.

Feature tracing, bidirectional dependency inspection and baseline-aware refresh above are practical synthesis, not guarantees of complete impact detection. Dynamic dispatch and unavailable services remain explicit limits.

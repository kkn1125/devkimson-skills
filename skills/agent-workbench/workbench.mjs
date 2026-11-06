import { readFile, writeFile, mkdir, mkdtemp, rm, rename, lstat, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join, dirname, parse, delimiter } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';

const root = dirname(fileURLToPath(import.meta.url));
export const manifest = JSON.parse(await readFile(join(root, 'manifest.json'), 'utf8'));
const skill = await readFile(join(root, 'SKILL.md'), 'utf8');
const hash = (value) => createHash('sha256').update(value).digest('hex');
const stable = (value) => JSON.stringify(value, (_, item) => item && !Array.isArray(item) && typeof item === 'object'
  ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b))) : item);
const fail = (message) => { throw Object.assign(new Error(message), { safeMessage: message }); };

async function read(path) {
  try { return await readFile(path, 'utf8'); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

async function noSymlinks(path) {
  const absolute = resolve(path);
  let current = parse(absolute).root;
  for (const part of absolute.slice(current.length).split(/[\\/]/).filter(Boolean)) {
    current = join(current, part);
    try {
      if ((await lstat(current)).isSymbolicLink()) fail('Target paths must not contain symbolic links.');
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
}

function options(values) {
  if (!values['codex-home'] || !values.workspace) fail('Both --codex-home and --workspace are required. No personal profile is selected automatically.');
  const url = values.url ?? manifest.defaultUrl;
  let endpoint;
  try { endpoint = new URL(url); } catch { fail('Use a valid HTTPS MCP endpoint.'); }
  if (endpoint.username || endpoint.password || endpoint.search || endpoint.hash || !/^[a-zA-Z0-9:/._~-]+$/.test(url)) {
    fail('MCP URL must have no credentials, query, fragment, or shell characters.');
  }
  if (endpoint.protocol !== 'https:' && !(endpoint.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(endpoint.hostname))) {
    fail('Use HTTPS, or HTTP only for a loopback test server.');
  }
  const tokenEnv = values['token-env'] ?? manifest.defaultTokenEnv;
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(tokenEnv)) fail('Use an environment variable name, never a token value.');
  const home = resolve(values['codex-home']);
  const workspace = resolve(values.workspace);
  return { home, workspace, url, tokenEnv,
    config: join(home, 'config.toml'), receipt: join(home, 'agent-workbench.json'),
    entry: join(workspace, '.agents/skills/agent-workbench/SKILL.md') };
}

function codex(args, home, allowMissing = false) {
  let executable = 'codex';
  if (process.platform === 'win32') {
    executable = null;
    for (const directory of (process.env.PATH ?? '').split(delimiter).filter(Boolean)) {
      const native = join(directory, 'codex.exe');
      const npm = join(directory, 'node_modules/@openai/codex/bin/codex.js');
      if (existsSync(native)) { executable = native; break; }
      if (existsSync(join(directory, 'codex.cmd')) && existsSync(npm)) {
        executable = process.execPath; args = [npm, ...args]; break;
      }
    }
    if (!executable) fail('Install Codex CLI on PATH using its native executable or standard npm installation.');
  }
  const result = spawnSync(executable, args, {
    windowsHide: true, encoding: 'utf8', timeout: 20000,
    maxBuffer: 4 * 1024 * 1024, cwd: home,
    env: { ...process.env, CODEX_HOME: home },
  });
  if (!result.error && result.status !== 0 && allowMissing && result.stderr.includes("Error: No MCP server named 'agent-workbench' found.")) return null;
  if (result.error || result.status !== 0) fail('Codex configuration check failed. Verify Codex CLI availability and the target TOML without sharing credentials.');
  return result.stdout;
}

async function stage(config, work) {
  const directory = await mkdtemp(join(tmpdir(), 'agent-workbench-'));
  try {
    await writeFile(join(directory, 'config.toml'), config ?? '', { mode: 0o600 });
    return await work(directory);
  } finally { await rm(directory, { recursive: true, force: true }); }
}

function getServer(home) {
  try {
    const result = codex(['mcp', 'get', manifest.serverName, '--json'], home, true);
    return result === null ? null : JSON.parse(result);
  } catch (error) {
    if (error.safeMessage) throw error;
    fail('Codex returned an unsupported server format.');
  }
}

function configBlock(url, tokenEnv) {
  return '# agent-workbench:begin\n[mcp_servers.agent-workbench]\nurl = ' + JSON.stringify(url)
    + '\n[mcp_servers.agent-workbench.env_http_headers]\n"x-mcp-token" = ' + JSON.stringify(tokenEnv)
    + '\n# agent-workbench:end\n';
}

async function snapshot(opts) {
  for (const path of [opts.config, opts.receipt, opts.entry]) await noSymlinks(path);
  const contents = await Promise.all([read(opts.config), read(opts.receipt), read(opts.entry)]);
  let receipt;
  try { receipt = contents[1] === null ? null : JSON.parse(contents[1]); } catch { fail('Installation receipt is invalid. No files were changed.'); }
  if (receipt && (receipt.schemaVersion !== 1 || receipt.serverName !== manifest.serverName)) fail('Installation receipt is unsupported.');
  return { contents, receipt };
}

async function atomicWrite(path, content) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = join(dirname(path), '.agent-workbench-' + randomUUID());
  try {
    const mode = await stat(path).then((value) => value.mode).catch((error) => {
      if (error.code === 'ENOENT') return 0o600;
      throw error;
    });
    await writeFile(temporary, content, { flag: 'wx', mode });
    await rename(temporary, path);
  } finally { await rm(temporary, { force: true }); }
}

export async function install(values) {
  const opts = options(values);
  const before = await snapshot(opts);
  const generated = await stage(before.contents[0], async (home) => {
    const existing = getServer(home);
    if (existing && (!before.receipt || before.receipt.serverHash !== hash(stable(existing)))) {
      fail('Reserved MCP entry already exists or was edited outside this installer. No files were changed.');
    }
    const path = join(home, 'config.toml');
    let config = before.contents[0] ?? '';
    const next = configBlock(opts.url, opts.tokenEnv);
    if (before.receipt) {
      const prior = configBlock(before.receipt.url, before.receipt.tokenEnv);
      if (config.split(prior).length !== 2) fail('Managed configuration block is missing, duplicated, or edited. No files were changed.');
      config = config.replace(prior, next);
    } else {
      if (config.includes('# agent-workbench:begin') || config.includes('# agent-workbench:end')) fail('Unowned installation markers exist. No files were changed.');
      config += (config && !config.endsWith('\n') ? '\n' : '') + next;
    }
    await writeFile(path, config, { mode: 0o600 });
    const server = getServer(home);
    if (server?.transport?.url !== opts.url || server?.transport?.env_http_headers?.['x-mcp-token'] !== opts.tokenEnv || server.transport.bearer_token_env_var) fail('Codex did not install the requested environment-based connection.');
    return { config: await read(join(home, 'config.toml')), serverHash: hash(stable(server)) };
  });
  if (before.contents[2] !== null && before.contents[2] !== skill && hash(before.contents[2]) !== before.receipt?.skillHash) {
    fail('Workflow entry already exists or was edited outside this installer. No files were changed.');
  }
  const receipt = JSON.stringify({ schemaVersion: 1, version: manifest.version, serverName: manifest.serverName,
    url: opts.url, tokenEnv: opts.tokenEnv, serverHash: generated.serverHash, skillHash: hash(skill) }, null, 2) + '\n';
  const paths = [opts.config, opts.receipt, opts.entry];
  const after = [generated.config, receipt, skill];
  const changed = paths.filter((_, index) => after[index] !== before.contents[index]);
  if (values.apply) {
    const applied = [];
    try {
      for (let index = 0; index < paths.length; index++) {
        if (after[index] === before.contents[index]) continue;
        await noSymlinks(paths[index]);
        if (await read(paths[index]) !== before.contents[index]) fail('Target changed during installation. Retry after reviewing the concurrent change.');
        await atomicWrite(paths[index], after[index]);
        applied.push(index);
      }
    } catch (error) {
      for (const index of applied.reverse()) {
        if (await read(paths[index]) !== after[index]) fail('Installation interrupted by concurrent changes. Review the three target files before retrying.');
        if (before.contents[index] === null) await rm(paths[index]);
        else await atomicWrite(paths[index], before.contents[index]);
      }
      throw error;
    }
  }
  return { status: 'success', mode: values.apply ? 'applied' : 'dry-run', version: manifest.version,
    changedFiles: changed, authenticatedMcp: 'not-tested',
    next: values.apply ? 'Set the token environment variable on this PC, launch Codex in the selected workspace, and invoke $agent-workbench.' : 'Review these target paths, then repeat with --apply.' };
}

export async function doctor(values) {
  const opts = options(values);
  const before = await snapshot(opts);
  const server = await stage(before.contents[0], (home) => getServer(home));
  const configuration = !!before.receipt && before.contents[2] === skill
    && before.receipt.version === manifest.version
    && before.contents[0]?.split(configBlock(opts.url, opts.tokenEnv)).length === 2
    && before.receipt.skillHash === hash(skill) && before.receipt.serverHash === hash(stable(server))
    && server?.enabled === true && server?.transport?.type === 'streamable_http'
    && server.transport.url === opts.url && server.transport.env_http_headers?.['x-mcp-token'] === opts.tokenEnv;
  const result = { status: configuration ? 'success' : 'error', version: manifest.version,
    filesAndConfig: configuration ? 'valid' : 'missing-or-drifted',
    tokenEnvironment: process.env[opts.tokenEnv] ? 'present' : 'missing', authenticatedMcp: 'not-tested' };
  if (values.online) {
    if (!configuration) fail('Repair files/configuration before an online check.');
    if (!process.env[opts.tokenEnv]) fail('Token environment variable is missing. Set it locally before an online check.');
    try { result.authenticatedMcp = await checkMcp(opts.url, process.env[opts.tokenEnv]); } catch {
      result.status = 'error'; result.authenticatedMcp = 'failed';
    }
  }
  return result;
}

export async function checkMcp(url, token) {
  let session;
  let id = 0;
  async function request(method, params, notification = false) {
    const response = await fetch(url, { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(10000),
      headers: { 'x-mcp-token': token, 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream',
        ...(session ? { 'Mcp-Session-Id': session } : {}), 'MCP-Protocol-Version': '2025-03-26' },
      body: JSON.stringify({ jsonrpc: '2.0', ...(notification ? {} : { id: ++id }), method, params }) });
    if (!response.ok) throw new Error('MCP request failed');
    session = response.headers.get('mcp-session-id') ?? session;
    if (notification) { await response.body?.cancel(); return; }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let body = '';
    try {
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        body += decoder.decode(chunk.value, { stream: true });
        if (body.length > 256000) throw new Error('MCP output exceeded doctor limit');
        if (response.headers.get('content-type')?.includes('text/event-stream')) {
          for (const event of body.split(/\r?\n\r?\n/).slice(0, -1)) {
            const data = event.split(/\r?\n/).filter((line) => line.startsWith('data:')).map((line) => line.slice(5).trimStart()).join('\n');
            if (!data) continue;
            const message = JSON.parse(data);
            if (message.id === id) { if (message.error) throw new Error('MCP error'); return message.result; }
          }
        }
      }
      const message = JSON.parse(body);
      if (message.id !== id || message.error) throw new Error('MCP error');
      return message.result;
    } finally { await reader.cancel(); }
  }
  try {
    const initialized = await request('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'agent-workbench-doctor', version: manifest.version } });
    if (initialized?.protocolVersion !== '2025-03-26') throw new Error('Unsupported MCP version');
    await request('notifications/initialized', {}, true);
    const names = [];
    let cursor;
    for (let page = 0; page < 10; page++) {
      const listed = await request('tools/list', cursor ? { cursor } : {});
      names.push(...(listed?.tools ?? []).map((tool) => tool.name));
      if (!listed?.nextCursor) break;
      cursor = listed.nextCursor;
      if (page === 9) throw new Error('MCP tool inventory exceeded doctor limit');
    }
    if (!names.includes('resource_search')) throw new Error('Required resource_search tool missing');
    const result = await request('tools/call', { name: 'resource_search', arguments: { q: manifest.canonical.protocol, limit: 1 } });
    if (!result || result.isError) throw new Error('MCP tool execution failed');
    return 'resource_search-executed';
  } finally {
    if (session) await fetch(url, { method: 'DELETE', redirect: 'error', signal: AbortSignal.timeout(3000),
      headers: { 'x-mcp-token': token, 'Mcp-Session-Id': session, 'MCP-Protocol-Version': '2025-03-26' } }).catch(() => {});
  }
}

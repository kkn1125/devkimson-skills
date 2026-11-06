import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { createHash, randomUUID } from 'node:crypto';
import { install, doctor, checkMcp, manifest } from '../workbench.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const secret = 'fixture-only-' + randomUUID();

async function fixture(t) {
  const directory = await mkdtemp(join(tmpdir(), 'workbench-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return { directory, 'codex-home': join(directory, 'profile with spaces', '.codex'), workspace: join(directory, 'project with spaces') };
}

test('dry run creates no targets and apply is idempotent while preserving unrelated config', async (t) => {
  const options = await fixture(t);
  const preview = await install(options);
  assert.equal(preview.mode, 'dry-run');
  await assert.rejects(access(options['codex-home']));
  await assert.rejects(access(options.workspace));
  await mkdir(options['codex-home'], { recursive: true });
  const config = join(options['codex-home'], 'config.toml');
  const unrelated = '# keep this comment\nmodel = "existing-model"\n[mcp_servers.other]\nurl = "https://other.example/mcp"\n[mcp_servers.other.http_headers]\n"x-private" = "' + secret + '"\n';
  await writeFile(config, unrelated);
  const first = await install({ ...options, apply: true });
  assert.equal(first.mode, 'applied');
  const content = await readFile(config, 'utf8');
  assert.ok(content.startsWith(unrelated));
  assert.ok(content.includes('# keep this comment'));
  assert.ok(content.includes('model = "existing-model"'));
  assert.ok(content.includes('[mcp_servers.other]'));
  assert.ok(content.includes('url = "https://other.example/mcp"'));
  assert.ok(content.includes('[mcp_servers.other.http_headers]'));
  assert.match(content, new RegExp('"?x-private"? = "' + secret + '"'));
  assert.ok(content.includes('env_http_headers'));
  assert.ok(content.includes('"x-mcp-token" = "AGENT_MCP_TOKEN"'));
  assert.ok(!JSON.stringify(first).includes(secret));
  const second = await install({ ...options, apply: true });
  assert.deepEqual(second.changedFiles, []);
  assert.equal(await readFile(config, 'utf8'), content);
  const report = await doctor(options);
  assert.equal(report.filesAndConfig, 'valid');
  assert.equal(report.authenticatedMcp, 'not-tested');
  assert.ok(!JSON.stringify(report).includes(secret));
});

test('owned URL/token-name changes preserve other settings and modified entries are refused', async (t) => {
  const options = await fixture(t);
  await install({ ...options, apply: true });
  const changed = { ...options, url: 'https://second.example/mcp', 'token-env': 'SECOND_MCP_TOKEN' };
  await install({ ...changed, apply: true });
  assert.equal((await doctor(changed)).filesAndConfig, 'valid');
  const entry = join(options.workspace, '.agents/skills/agent-workbench/SKILL.md');
  await writeFile(entry, 'user-edited entry');
  await assert.rejects(install({ ...changed, apply: true }), /entry already exists or was edited/);
  assert.equal(await readFile(entry, 'utf8'), 'user-edited entry');
});

test('existing reserved server, invalid TOML, and credential URLs are refused without overwrites', async (t) => {
  const options = await fixture(t);
  await mkdir(options['codex-home'], { recursive: true });
  const config = join(options['codex-home'], 'config.toml');
  const contents = '[mcp_servers.agent-workbench]\nurl = "https://already.example/mcp"\n';
  await writeFile(config, contents);
  await assert.rejects(install({ ...options, apply: true }), /Reserved MCP entry/);
  assert.equal(await readFile(config, 'utf8'), contents);
  await writeFile(config, 'invalid = "' + secret);
  const child = spawnSync(process.execPath, [join(root, 'cli.mjs'), 'install', '--codex-home', options['codex-home'], '--workspace', options.workspace], { encoding: 'utf8' });
  assert.equal(child.status, 1);
  assert.ok(!(child.stdout + child.stderr).includes(secret));
  for (const url of ['https://name:secret@example.com/mcp', 'https://example.com/mcp?token=secret', 'http://example.com/mcp', 'https://example.com/mcp&echo']) {
    await assert.rejects(install({ ...options, url }));
  }
  await assert.rejects(install({ ...options, 'token-env': 'not-a-variable' }));
});

test('editing the owned MCP server is detected before install and doctor reports drift', async (t) => {
  const options = await fixture(t);
  await install({ ...options, apply: true });
  const config = join(options['codex-home'], 'config.toml');
  const changed = (await readFile(config, 'utf8')).replace(manifest.defaultUrl, 'https://user-change.example/mcp');
  await writeFile(config, changed);
  await assert.rejects(install({ ...options, apply: true }), /Reserved MCP entry/);
  assert.equal(await readFile(config, 'utf8'), changed);
  assert.equal((await doctor(options)).filesAndConfig, 'missing-or-drifted');
});

for (const format of ['json', 'sse']) {
  test('online doctor uses the environment header and executes a read-only tool over ' + format, async (t) => {
    const calls = [];
    const server = createServer(async (request, response) => {
      assert.equal(request.headers['x-mcp-token'], secret);
      assert.equal(request.headers.authorization, undefined);
      if (request.method === 'DELETE') { response.writeHead(204).end(); return; }
      let text = '';
      for await (const chunk of request) text += chunk;
      const message = JSON.parse(text);
      calls.push(message);
      if (message.method === 'notifications/initialized') { response.writeHead(202).end(); return; }
      const result = message.method === 'initialize' ? { protocolVersion: '2025-03-26' }
        : message.method === 'tools/list' ? { tools: [{ name: 'resource_search' }] }
          : { content: [{ type: 'text', text: secret }] };
      const payload = JSON.stringify({ jsonrpc: '2.0', id: message.id, result });
      response.setHeader('Mcp-Session-Id', 'fixture-session');
      if (format === 'sse') response.setHeader('Content-Type', 'text/event-stream');
      else response.setHeader('Content-Type', 'application/json');
      response.end(format === 'sse' ? 'event: message\ndata: ' + payload + '\n\n' : payload);
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    t.after(() => new Promise((resolve) => server.close(resolve)));
    const options = await fixture(t);
    options.url = 'http://127.0.0.1:' + server.address().port + '/mcp';
    options['token-env'] = 'WORKBENCH_TEST_TOKEN';
    const previous = process.env.WORKBENCH_TEST_TOKEN;
    process.env.WORKBENCH_TEST_TOKEN = secret;
    t.after(() => { if (previous === undefined) delete process.env.WORKBENCH_TEST_TOKEN; else process.env.WORKBENCH_TEST_TOKEN = previous; });
    await install(options);
    assert.equal(calls.length, 0);
    await install({ ...options, apply: true });
    assert.equal(calls.length, 0);
    assert.equal((await doctor(options)).authenticatedMcp, 'not-tested');
    assert.equal(calls.length, 0);
    const report = await doctor({ ...options, online: true });
    assert.equal(report.authenticatedMcp, 'resource_search-executed');
    assert.ok(!JSON.stringify(report).includes(secret));
    assert.deepEqual(calls.map((call) => call.method), ['initialize', 'notifications/initialized', 'tools/list', 'tools/call']);
    assert.deepEqual(calls[3].params, { name: 'resource_search', arguments: { q: manifest.canonical.protocol, limit: 1 } });
  });
}

test('doctor does not claim authentication when token is missing or the server rejects the tool', async (t) => {
  const options = await fixture(t);
  const tokenEnv = 'WORKBENCH_TEST_ABSENT_TOKEN';
  delete process.env[tokenEnv];
  await install({ ...options, 'token-env': tokenEnv, apply: true });
  const offline = await doctor({ ...options, 'token-env': tokenEnv });
  assert.equal(offline.filesAndConfig, 'valid');
  assert.equal(offline.tokenEnvironment, 'missing');
  assert.equal(offline.authenticatedMcp, 'not-tested');
  await assert.rejects(doctor({ ...options, 'token-env': tokenEnv, online: true }), /Token environment variable is missing/);
  const server = createServer((_, response) => response.writeHead(401).end(secret));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  await assert.rejects(checkMcp('http://127.0.0.1:' + server.address().port + '/mcp', secret), /MCP request failed/);
});

test('allowlisted ZIP validates checksums and extracted runtime works outside the repository', async (t) => {
  const options = await fixture(t);
  const built = spawnSync(process.execPath, [join(root, 'bundle.mjs'), '--out', options.directory], { cwd: options.directory, encoding: 'utf8' });
  assert.equal(built.status, 0, built.stderr);
  const archive = await readFile(join(options.directory, 'agent-workbench-' + manifest.version + '.zip'));
  const sidecar = await readFile(join(options.directory, 'agent-workbench-' + manifest.version + '.zip.sha256'), 'utf8');
  assert.equal(sidecar.split('  ')[0], createHash('sha256').update(archive).digest('hex'));
  const files = new Map();
  let offset = 0;
  const extracted = join(options.directory, 'extracted');
  while (archive.readUInt32LE(offset) === 0x04034b50) {
    const size = archive.readUInt32LE(offset + 18);
    const nameLength = archive.readUInt16LE(offset + 26);
    const name = archive.subarray(offset + 30, offset + 30 + nameLength).toString().split('/').slice(1).join('/');
    const data = archive.subarray(offset + 30 + nameLength, offset + 30 + nameLength + size);
    files.set(name, data);
    await mkdir(dirname(join(extracted, name)), { recursive: true });
    await writeFile(join(extracted, name), data);
    offset += 30 + nameLength + size;
  }
  assert.equal(archive.readUInt32LE(offset), 0x02014b50);
  assert.deepEqual([...files.keys()], [...manifest.files, 'SHA256SUMS']);
  for (const line of files.get('SHA256SUMS').toString().trim().split('\n')) {
    const [sum, name] = line.split('  ');
    assert.equal(createHash('sha256').update(files.get(name)).digest('hex'), sum);
  }
  assert.ok(!archive.includes(Buffer.from(secret)));
  const result = spawnSync(process.execPath, [join(extracted, 'cli.mjs'), 'install', '--codex-home', options['codex-home'], '--workspace', options.workspace, '--apply'], { cwd: options.directory, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).mode, 'applied');
  assert.ok(!result.stdout.includes(root));
});

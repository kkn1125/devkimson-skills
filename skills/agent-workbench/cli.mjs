#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { install, doctor } from './workbench.mjs';

try {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      'codex-home': { type: 'string' }, workspace: { type: 'string' }, url: { type: 'string' },
      'token-env': { type: 'string' }, apply: { type: 'boolean' }, online: { type: 'boolean' },
      'dry-run': { type: 'boolean' }, help: { type: 'boolean' },
    },
  });
  if (values.help || positionals.length === 0) {
    console.log('node cli.mjs install|doctor --codex-home DIR --workspace DIR [--url HTTPS_URL] [--token-env NAME] [--apply|--dry-run] [--online]');
  } else {
    if (positionals.length !== 1 || !['install', 'doctor'].includes(positionals[0])) throw new Error('Use install or doctor.');
    if (values.apply && values['dry-run']) throw new Error('Choose --apply or --dry-run.');
    if (positionals[0] === 'install' && values.online) throw new Error('--online is available only with doctor.');
    if (positionals[0] === 'doctor' && (values.apply || values['dry-run'])) throw new Error('Doctor is read-only.');
    const result = await (positionals[0] === 'install' ? install : doctor)(values);
    console.log(JSON.stringify(result, null, 2));
    if (result.status === 'error') process.exitCode = 1;
  }
} catch (error) {
  // Codex and network diagnostics can contain credentials, so only our fixed messages reach the terminal.
  console.error(error.safeMessage ?? (error.name === 'TypeError' ? 'Invalid input or unavailable runtime. See README.md.' : 'Operation failed. Check arguments, Codex CLI, target permissions, and README.md.'));
  process.exitCode = 1;
}

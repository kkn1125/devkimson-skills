import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { parseArgs } from 'node:util';

const root = dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(await readFile(join(root, 'manifest.json'), 'utf8'));
const { values } = parseArgs({ options: { out: { type: 'string' } } });
const destination = resolve(values.out ?? join(root, 'dist'));
const prefix = 'agent-workbench-' + manifest.version + '/';
const files = await Promise.all(manifest.files.map(async (name) => {
  if (!/^[a-zA-Z0-9./_-]+$/.test(name) || name.split('/').includes('..') || name.startsWith('/')) throw new Error('Invalid bundle file');
  return { name, data: await readFile(join(root, name)) };
}));
files.push({ name: 'SHA256SUMS', data: Buffer.from(files.map(({ name, data }) => createHash('sha256').update(data).digest('hex') + '  ' + name).join('\n') + '\n') });

function crc32(data) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const locals = [];
const directory = [];
let offset = 0;
for (const { name, data } of files) {
  const filename = Buffer.from(prefix + name);
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50);
  local.writeUInt16LE(20, 4);
  local.writeUInt16LE(0x21, 12);
  local.writeUInt32LE(crc32(data), 14);
  local.writeUInt32LE(data.length, 18);
  local.writeUInt32LE(data.length, 22);
  local.writeUInt16LE(filename.length, 26);
  locals.push(local, filename, data);
  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50);
  central.writeUInt16LE(20, 4);
  central.writeUInt16LE(20, 6);
  local.copy(central, 10, 8, 28);
  central.writeUInt32LE(offset, 42);
  directory.push(central, filename);
  offset += local.length + filename.length + data.length;
}
const central = Buffer.concat(directory);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50);
end.writeUInt16LE(files.length, 8);
end.writeUInt16LE(files.length, 10);
end.writeUInt32LE(central.length, 12);
end.writeUInt32LE(offset, 16);
const archive = Buffer.concat([...locals, central, end]);
await mkdir(destination, { recursive: true });
const filename = 'agent-workbench-' + manifest.version + '.zip';
await writeFile(join(destination, filename), archive);
await writeFile(join(destination, filename + '.sha256'), createHash('sha256').update(archive).digest('hex') + '  ' + filename + '\n');
console.log(join(destination, filename));

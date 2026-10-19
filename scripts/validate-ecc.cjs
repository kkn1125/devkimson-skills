const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {document,hash,walk,inventory}=require('./import-ecc.cjs');
function validate(root,source){
  root=path.resolve(root);const manifest=JSON.parse(fs.readFileSync(path.join(root,'ecc-manifest.json'),'utf8'));
  const seen=new Set(),covered=new Set(),errors=[];let links=0,files=0;
  const check=(fn)=>{try{fn()}catch(e){errors.push(e.message)}};
  for(const entry of manifest.entries){
    const dir=path.join(root,'skills',entry.name);
    check(()=>{assert(!seen.has(entry.name),'duplicate '+entry.name);seen.add(entry.name);const {meta}=document(fs.readFileSync(path.join(dir,'SKILL.md'),'utf8'));assert.equal(meta.name,entry.name);assert(/^ecc-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(meta.name)&&meta.name.length<=64);assert(typeof meta.description==='string'&&meta.description.trim()&&meta.description.length<=1024);assert(!/[<>]/.test(meta.description));assert(Object.keys(meta).every(k=>['name','description','metadata','license','allowed-tools'].includes(k)));assert(fs.readFileSync(path.join(dir,'LICENSE'),'utf8').includes('Copyright (c) 2026 Affaan Mustafa'));assert.equal(walk(dir).filter(p=>path.basename(p)==='SKILL.md').length,1,'nested skill discovery '+entry.name);});
    if(entry.source)covered.add(entry.source);for(const v of entry.variants||[])covered.add(v.source);
    for(const f of entry.files){
      check(()=>assert.equal(hash(fs.readFileSync(path.join(root,f.path))),f.sha256,'hash mismatch '+f.path));files++;
    }
    for(const file of walk(dir).filter(p=>p.endsWith('.md'))){
      const text=fs.readFileSync(file,'utf8').replace(/^([ \t]*)(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\2[ \t]*$/gm,'');
      for(const m of text.matchAll(/!?\[[^\]\n]*\]\(([^)\s]+)\)/g)){
        const target=m[1];if(/^(?:[a-z][\w+.-]*:|#|\/\/)/i.test(target)||/[{}<>]/.test(target))continue;
        check(()=>{const resolved=path.resolve(path.dirname(file),target.split('#')[0]);assert(resolved===dir||resolved.startsWith(dir+path.sep),'link escapes installed skill '+file+': '+target);assert(fs.existsSync(resolved),'missing link '+file+': '+target)});links++;
      }
      if(!file.includes('ecc-upstream')&&!file.includes('ecc-core')&&!file.includes('codex-variant')){
        const raw=fs.readFileSync(file,'utf8');
        for(const fence of raw.matchAll(/^([ \t]*)(`{3,}|~{3,})(bash|sh|shell|powershell|ps1)[^\n]*\n([\s\S]*?)^\1\2[ \t]*$/gm)){
          check(()=>assert(!/\$(?:\{)?(?:CLAUDE_[A-Z_]+|ARGUMENTS)\b|~\/\.claude\/|^\s*claude\s/m.test(fence[4]),'host-only executable sample '+file));
        }
      }
    }
    check(()=>assert.deepEqual(new Set(walk(dir).map(p=>path.relative(root,p).split(path.sep).join('/'))),new Set(entry.files.map(f=>f.path)),'untracked packaged file '+entry.name));
  }
  check(()=>assert.deepEqual(new Set(fs.readdirSync(path.join(root,'skills')).filter(n=>n.startsWith('ecc-'))),seen,'manifest/installed skill mismatch'));
  if(source){
    for(const e of inventory(source))check(()=>assert(covered.has(e.source),'uncovered upstream source '+e.source));
    for(const e of manifest.entries)if(e.sourceSha256)check(()=>assert.equal(hash(fs.readFileSync(path.join(source,e.source))),e.sourceSha256,'upstream source mismatch '+e.source));
  }
  return {skills:seen.size,files,localLinks:links,coveredSources:covered.size,errors};
}
module.exports={validate};
if(require.main===module){const r=validate(process.argv[2]||process.cwd(),process.argv[3]);console.log(JSON.stringify(r,null,2));if(r.errors.length)process.exitCode=1;}


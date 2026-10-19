const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {build,document,assignNames,normalizeFences,profileFor}=require('../scripts/import-ecc.cjs');
const {validate}=require('../scripts/validate-ecc.cjs');
function fixture(){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ecc-port-test-')),source=path.join(dir,'source'),output=path.join(dir,'output');
 const write=(p,s)=>{fs.mkdirSync(path.dirname(path.join(source,p)),{recursive:true});fs.writeFileSync(path.join(source,p),s)};
 for(const p of ['skills','.agents/skills','agents','commands','rules/common','contexts'])fs.mkdirSync(path.join(source,p),{recursive:true});
 write('LICENSE','MIT License\nCopyright (c) 2026 Affaan Mustafa\n');write('package.json','{"version":"2.2.3"}');
 const doc=(name,body)=>`---\nname: ${name}\ndescription: "Use ${name} for its domain."\n---\n\n${body}`;
 write('skills/alpha/SKILL.md',doc('alpha','[guide](guide.md)\n[external](../../rules/common/style.md)\n'));
 write('skills/alpha/guide.md','Technical guide\n');write('skills/alpha/scripts/sample.js','console.log("not executed")\n');
 write('skills/alpha/agents/openai.yaml','interface:\n  display_name: "Alpha"\n  default_prompt: "Use $alpha to inspect inputs."\npolicy:\n  allow_implicit_invocation: false\n');
 write('.agents/skills/alpha/SKILL.md',doc('alpha','[guide](guide.md)\nCore variant\n'));write('.agents/skills/alpha/guide.md','Core guide\n');
 write('commands/alpha.md','---\ndescription: "Perform alpha command"\n---\nCommand variant\n');
 write('agents/inspector.md',doc('inspector','Read context and report evidence.\n'));
 write('rules/common/style.md','# Style\n\n[other](other.md)\n');write('rules/common/other.md','Other rule\n');
 write('contexts/review.md','Review only the requested changes.\n');
 return {source,output,dir,revision:'a'.repeat(40)};
}
test('YAML parsing supports multiline and quoted metadata without losing body',()=>{
 const d=document('---\nname: alpha\ndescription: >\n  first line\n  second line\n---\nbody');
 assert.equal(d.meta.description,'first line second line\n');assert.equal(d.body,'body');
});
test('namespaces disambiguate commands while retaining the primary skill',()=>{
 assert.deepEqual(assignNames([{name:'alpha',kind:'skill'},{name:'alpha',kind:'command'}]).map(e=>e.target),['ecc-alpha','ecc-command-alpha']);
 assert.throws(()=>assignNames([{name:'alpha',kind:'skill'},{name:'alpha',kind:'skill'},{name:'alpha',kind:'skill'}]),/duplicate/);
});
test('host-specific shell examples become non-executable references; domain code stays intact',()=>{
 const bash='```bash\nnode "${CLAUDE_PLUGIN_ROOT:-missing}/script.js" $ARGUMENTS\n```';
 assert.match(normalizeFences(bash),/^```text/);
 const domain='```typescript\nconst total = values.reduce((a,b)=>a+b,0)\n```';assert.equal(normalizeFences(domain),domain);
});
test('clinical evaluation remains its domain rather than generic harness evaluation',()=>{
 assert.equal(profileFor({name:'healthcare-eval-harness'}),'domain');assert.equal(profileFor({name:'eval-harness'}),'evaluation');
});
test('full import preserves assets, isolated variant links and all source records; no overwrite',()=>{
 const f=fixture(),m=build(f),r=validate(f.output,f.source);assert.deepEqual(r.errors,[]);assert.equal(m.sourceCounts.skill,1);
 assert(m.entries.some(e=>e.name==='ecc-command-alpha'));assert.equal(r.coveredSources,6);
 assert.equal(fs.readFileSync(path.join(f.output,'skills/ecc-alpha/scripts/sample.js'),'utf8'),'console.log("not executed")\n');
 const ui=require('yaml').parse(fs.readFileSync(path.join(f.output,'skills/ecc-alpha/agents/openai.yaml'),'utf8'));assert.equal(ui.interface.default_prompt,'Use $ecc-alpha to inspect inputs.');assert.equal(ui.policy.allow_implicit_invocation,false);assert.equal(ui.interface.display_name,'Alpha');
 assert.throws(()=>build(f),/Refusing to overwrite/);
 const file=path.join(f.output,'skills/ecc-alpha/scripts/sample.js');fs.appendFileSync(file,'changed');assert(validate(f.output).errors.some(e=>e.includes('hash mismatch')));
});
test('historical workflow links remain local and executable runtime is not promised',()=>{
 const f=fixture();fs.mkdirSync(path.join(f.source,'skills/continuous-learning'),{recursive:true});
 fs.writeFileSync(path.join(f.source,'skills/continuous-learning/SKILL.md'),'---\nname: continuous-learning\ndescription: "Capture patterns from sessions"\n---\nOriginal specific fields.\n');
 build(f);const root=path.join(f.output,'skills/ecc-continuous-learning');
 assert.match(fs.readFileSync(path.join(root,'references/ecc-workflow.md'),'utf8'),/\]\(ecc-upstream\.md\)/);
 assert.match(fs.readFileSync(path.join(root,'references/ecc-upstream.md'),'utf8'),/Original specific fields/);
 assert.deepEqual(validate(f.output,f.source).errors,[]);
});
test('shipped corpus has complete isolated packages and exact pinned provenance',()=>{
 const root=process.env.ECC_TARGET||path.resolve(__dirname,'..'),r=validate(root);
 assert.deepEqual(r.errors,[]);assert.equal(r.skills,507);assert.equal(r.coveredSources,550);
 const m=JSON.parse(fs.readFileSync(path.join(root,'ecc-manifest.json'),'utf8'));
 assert.equal(m.upstream.revision,'76aaa77df6adc5b889e689007bf99b9a4f74af34');
 for(const name of ['ecc-frontend-design-direction','ecc-code-reviewer','ecc-systematic-debugging','ecc-tdd-workflow','ecc-market-research','ecc-customer-billing-ops','ecc-ito-training','ecc-rules-react'])assert(m.entries.some(e=>e.name===name),name);
});


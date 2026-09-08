// Copy only UUID-matched framework dSYMs into a finished archive before export.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const archive = process.argv[2];
if (!archive || !archive.endsWith('.xcarchive')) throw Error('Pass an .xcarchive path');
const root = path.resolve(__dirname, '..');
const app = path.join(archive, 'Products/Applications/ALPHA.app');
const symbols = path.join(archive, 'dSYMs');
const uuid = file => execFileSync('xcrun', ['dwarfdump', '--uuid', file], {encoding:'utf8'}).split('\n').map(l=>l.match(/^UUID: ([A-F0-9-]+) \(([^)]+)\)/)).filter(Boolean).map(m=>`${m[1]}:${m[2]}`);
const candidates = execFileSync('rg', ['--files','--no-ignore',path.join(root,'ios/Pods')], {encoding:'utf8',maxBuffer:16*1024*1024}).split('\n').filter(p=>p.includes('.dSYM/Contents/Resources/DWARF/'));
const result = [];
for (const name of fs.readdirSync(path.join(app,'Frameworks')).filter(n=>n.endsWith('.framework'))) {
  const binary=path.join(app,'Frameworks',name,name.slice(0,-10));
  const required=uuid(binary);
  if(!required.length) throw Error(`No UUID: ${name}`);
  const target=path.join(symbols,`${name}.dSYM`);
  if(fs.existsSync(target)) {
    const available=uuid(target);
    if(!required.every(u=>available.includes(u))) throw Error(`Archive dSYM mismatch: ${name}`);
    result.push({framework:name,status:'present',uuids:required});continue;
  }
  const candidate=candidates.find(p=>path.basename(p)===name.slice(0,-10)&&required.every(u=>uuid(p).includes(u)));
  if(candidate) {
    fs.cpSync(candidate.split('/Contents/Resources/DWARF/')[0],target,{recursive:true,errorOnExist:true,force:false});
    result.push({framework:name,status:'added',uuids:required});
  } else result.push({framework:name,status:'missing',uuids:required});
}
console.log(JSON.stringify(result,null,2));

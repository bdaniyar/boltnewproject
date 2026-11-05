"""Package only current deliverables and genuine evidence; verify every member."""
import hashlib
import json
from pathlib import Path
import shutil
from zipfile import ZipFile, ZIP_DEFLATED
from docx import Document

base=Path(__file__).resolve().parents[1]
repo=base.parent
name='Practice09_Boranov_Daniyar_Submission'
folder=base/name
archive=base/(name+'.zip')
folder.mkdir(exist_ok=True)
# Clear only this generated staging folder; original source/evidence is never removed.
for old in folder.iterdir():
    if old.is_dir(): shutil.rmtree(old)
    else: old.unlink()
for rel in ['Practice09_Boranov_Daniyar_Report.docx','SmartCampus_Source_Export.zip','source-export-manifest.json','README.md','changed-files.md','pattern-rationale.md','comparison.md','UNAVAILABLE_EVIDENCE.md','Email_Draft.txt']:
    shutil.copy2(base/rel,folder/rel)
shutil.copy2(repo/'AGENTS.md',folder/'AGENTS.md')
shutil.copytree(base/'prompts',folder/'prompts')
for f in (base/'evidence').rglob('*'):
    if not f.is_file() or f.name in ['SmartCampus_Practice08_Baseline.zip','.DS_Store']:
        continue
    target=folder/f.relative_to(base)
    target.parent.mkdir(parents=True,exist_ok=True)
    shutil.copy2(f,target)
bad_parts={'.git','node_modules','dist','qa','__pycache__','.cache'}
members=sorted(p for p in folder.rglob('*') if p.is_file())
assert not any(bad_parts.intersection(p.relative_to(folder).parts) for p in members)
assert not any(p.suffix=='.pdf' or p.name.startswith('.env') for p in members)
assert (repo/'AGENTS.md').read_bytes()==(folder/'prompts/AGENTS_EXPLICIT_CONTEXT.md').read_bytes()
with ZipFile(folder/'SmartCampus_Source_Export.zip') as z:
    assert z.testzip() is None
    assert z.read('AGENTS.md')==(repo/'AGENTS.md').read_bytes()
    for member in z.namelist():
        assert not bad_parts.intersection(Path(member).parts)
        assert not Path(member).name.startswith('.env')
with ZipFile(folder/'evidence/baseline/SmartCampus_Baseline_Source.zip') as z:
    assert z.testzip() is None
    assert not any(Path(n).name=='AGENTS.md' for n in z.namelist())
doc=Document(folder/'Practice09_Boranov_Daniyar_Report.docx')
assert len(doc.inline_shapes)==5
all_paras=list(doc.paragraphs)+[p for t in doc.tables for row in t.rows for c in row.cells for p in c.paragraphs]
for p in all_paras:
    for r in p.runs:
        if r.text:
            assert r.font.name=='Times New Roman'
            assert r.font.size.pt==12
            assert str(r.font.color.rgb)=='000000'
assert not doc.settings.element.xpath('.//w:documentProtection')
sums=[]
for f in members:
    sums.append(hashlib.sha256(f.read_bytes()).hexdigest()+'  '+f.relative_to(folder).as_posix())
(folder/'SHA256SUMS.txt').write_text('\n'.join(sums)+'\n')
with ZipFile(archive,'w',ZIP_DEFLATED,compresslevel=9) as z:
    for f in sorted(folder.rglob('*')):
        if f.is_file(): z.write(f,Path(name)/f.relative_to(folder))
with ZipFile(archive) as z:
    assert z.testzip() is None
    count=len(z.namelist())
audit={'archive':archive.name,'files':count,'bytes':archive.stat().st_size,'sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'crcCheck':'passed','docxTextFont':'Times New Roman 12pt black','editable':True,'docxImages':len(doc.inline_shapes),'excluded':['dependencies','caches','build output','Git internals','secrets','historical assignment artefacts','QA renders','full historical baseline archive'],'missingExternalEvidence':['Bolt A/B responses/screenshots/model details','Bolt implementation demonstration','verified revised publication URL']}
(base/'package-verification.json').write_text(json.dumps(audit,indent=2)+'\n')
print(json.dumps(audit,indent=2))

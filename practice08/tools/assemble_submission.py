"""Assemble verified local files without dependencies or generated QA intermediates.

Edit the canonical report in practice08/reports before refreshing the package.
The full submission is not emailed, published or uploaded by this script.
"""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import hashlib
import json
import shutil
import subprocess

ROOT=Path(__file__).resolve().parents[2]
WORK=ROOT/'practice08'
NAME='Practice08_Boranov_Daniyar_Submission'
DEST=ROOT/NAME
DEST.mkdir(exist_ok=True)
for name in ['evidence','prompts']:
    shutil.copytree(WORK/name,DEST/name,dirs_exist_ok=True)
for name in ['comparison.md','defect_log.md','README.md','PENDING_MANUAL_STEPS.md','Email_Draft.txt','EVIDENCE_CHECKLIST.md']:
    shutil.copy2(WORK/name,DEST/name)
shutil.copy2(WORK/'reports/Practice08_Boranov_Daniyar_Report.docx',DEST/'Practice08_Boranov_Daniyar_Report.docx')
shutil.copy2(ROOT/'bug-detector/SKILL.md',DEST/'SKILL.md')
shutil.copy2(ROOT/'bug-detector.zip',DEST/'bug-detector.zip')
# Include the exact prepared instructions and package helper without duplicating QA.
shutil.copytree(WORK/'tools',DEST/'tools',dirs_exist_ok=True)
shutil.copytree(ROOT/'bug-detector',DEST/'bug-detector',dirs_exist_ok=True)

tracked=subprocess.check_output(['git','ls-files','-z'],cwd=ROOT).decode().split('\0')
source={ROOT/name for name in tracked if name}
source.update((ROOT/'tests').glob('practice08*'))
source.update((ROOT/'bug-detector').rglob('*'))
source.update((WORK/'tools').rglob('*'))
source.update((WORK/'prompts').rglob('*'))
source.update(WORK.glob('*.md'))
source.add(WORK/'Email_Draft.txt')
source={p for p in source if p.is_file() and not any(v in p.relative_to(ROOT).parts for v in ['node_modules','.git','dist','__pycache__']) and not p.name.startswith('.env')}
with ZipFile(DEST/'SmartCampus_Source_Export.zip','w',ZIP_DEFLATED) as z:
    for p in sorted(source):
        z.write(p,'SmartCampus/'+p.relative_to(ROOT).as_posix())
    z.writestr('SmartCampus/PRACTICE08_SOURCE_README.md',(WORK/'README.md').read_text())
with ZipFile(DEST/'SmartCampus_Source_Export.zip') as z:
    assert z.testzip() is None
    required=['SmartCampus/package.json','SmartCampus/package-lock.json','SmartCampus/src/bookingLogic.ts','SmartCampus/tests/practice08.regression.test.ts']
    assert all(p in z.namelist() for p in required)
    assert all('/node_modules/' not in p and '/.git/' not in p and '/dist/' not in p and not Path(p).name.startswith('.env') for p in z.namelist())

files=sorted(p for p in DEST.rglob('*') if p.is_file() and p.name!='SHA256SUMS.txt')
(DEST/'SHA256SUMS.txt').write_text(''.join(hashlib.sha256(p.read_bytes()).hexdigest()+'  '+p.relative_to(DEST).as_posix()+'\n' for p in files))
archive=ROOT/(NAME+'.zip')
with ZipFile(archive,'w',ZIP_DEFLATED) as z:
    for p in sorted(DEST.rglob('*')):
        if p.is_file():z.write(p,NAME+'/'+p.relative_to(DEST).as_posix())
with ZipFile(archive) as z:assert z.testzip() is None
print(json.dumps({'directory':str(DEST),'archive':str(archive),'files':len(files)+1,'archiveBytes':archive.stat().st_size},indent=2))

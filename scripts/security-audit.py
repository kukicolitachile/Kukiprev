"""Scan reachable/reflog Git blobs and working text; emit locations, never credential values."""
import json,re,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
patterns={
 'github_token':r'(?:gh[pousr]_[A-Za-z0-9]{25,}|github_pat_[A-Za-z0-9_]{40,})',
 'aws_access_id':r'AKIA[0-9A-Z]{16}',
 'private_key':r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',
 'api_token':r'sk-[A-Za-z0-9_-]{35,}',
 'literal_credential':r'''(?i)(?:api[_-]?key|password|client_secret|access_token)\s*[:=]\s*["']([A-Za-z0-9_+/=-]{16,})["']'''
}
patterns={k:re.compile(v) for k,v in patterns.items()};candidates=[];seen=set();checked=0;skipped=0
objects=subprocess.check_output(['git','rev-list','--objects','--all','--reflog'],cwd=ROOT,text=True).splitlines()
for line in objects:
 oid,_,name=line.partition(' ')
 if oid in seen:continue
 seen.add(oid)
 meta=subprocess.check_output(['git','cat-file','-t',oid],cwd=ROOT,text=True).strip()
 if meta!='blob':continue
 size=int(subprocess.check_output(['git','cat-file','-s',oid],cwd=ROOT,text=True))
 if size>2_000_000:skipped+=1;continue
 data=subprocess.check_output(['git','cat-file','blob',oid],cwd=ROOT)
 if b'\0' in data:skipped+=1;continue
 try:text=data.decode('utf-8')
 except UnicodeError:skipped+=1;continue
 checked+=1
 for kind,pattern in patterns.items():
  if pattern.search(text):candidates.append({'object':oid[:12],'file':name,'kind':kind})
for file in ROOT.rglob('*'):
 if '.git' in file.parts or 'node_modules' in file.parts or not file.is_file() or file.stat().st_size>2_000_000 or '__pycache__' in file.parts:continue
 try:text=file.read_text()
 except (OSError,UnicodeError):continue
 if '\0' in text:continue
 for kind,pattern in patterns.items():
  if pattern.search(text):candidates.append({'working_tree':str(file.relative_to(ROOT)),'kind':kind})
print(json.dumps({'git_scope':'reachable refs and local reflogs','text_blobs_checked':checked,'binary_or_large_blobs_skipped':skipped,'credential_candidates':candidates,'limits':'Pattern scan, not proof of absence. Does not cover inaccessible remote/deleted history, credentials configured outside Git, or all binary metadata.'},indent=2))

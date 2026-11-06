"""Bounded local scan; report candidate locations, never secret values."""
import json,re,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
patterns=[re.compile(x) for x in [r'gh[pousr]_[A-Za-z0-9]{25,}',r'github_pat_[A-Za-z0-9_]{40,}',r'AKIA[0-9A-Z]{16}',r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',r'sk-[A-Za-z0-9]{35,}']]
commits=subprocess.check_output(['git','rev-list','--all'],cwd=ROOT,text=True).splitlines();candidates=[];checked=0
for commit in commits:
 files=subprocess.check_output(['git','ls-tree','-r','--name-only',commit],cwd=ROOT,text=True).splitlines()
 for name in files:
  if Path(name).suffix.lower() not in {'.js','.json','.py','.md','.html','.css','.yml','.yaml','.env','.key','.pem','.toml'}:continue
  data=subprocess.check_output(['git','show',f'{commit}:{name}'],cwd=ROOT)
  checked+=1
  text=data.decode(errors='replace')
  if any(p.search(text) for p in patterns):candidates.append({'commit':commit[:8],'file':name})
for file in ROOT.rglob('*'):
 if '.git' in file.parts or not file.is_file() or file.suffix not in {'.js','.json','.py','.md','.html','.css','.yml','.yaml','.env','.key','.pem','.toml'}:continue
 if any(p.search(file.read_text(errors='replace')) for p in patterns):candidates.append({'working_tree':str(file.relative_to(ROOT))})
print(json.dumps({'commits_checked':len(commits),'text_blobs_checked':checked,'high_confidence_candidates':candidates,'limits':'Pattern scan only; not a proof that all credentials or sensitive information are absent. Remote visibility and permissions require separate authenticated inspection.'},indent=2))

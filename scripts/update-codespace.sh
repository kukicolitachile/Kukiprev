#!/usr/bin/env bash
# Source is obtained only from the repository's review branch. No ZIP, clone or alternative server.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
review_branch='implementation/correa-interactiva-2.4'
review_ref="refs/remotes/origin/$review_branch"
git fetch origin "refs/heads/$review_branch:$review_ref"
review_sha=$(git rev-parse "$review_ref")
git merge-base --is-ancestor 24bb4af "$review_sha" || { echo 'La rama no parte de la base acordada.'; exit 1; }
if git show-ref --verify --quiet "refs/heads/$review_branch"; then
  git merge-base --is-ancestor "$review_branch" "$review_ref" || { echo 'La rama local contiene commits divergentes. Se conservó sin sobrescribir.'; exit 1; }
fi
# Stop only a recognized Python development server owned by this user, on this app's port.
python3 - <<'PY'
import os,signal,subprocess,time
from pathlib import Path
root=Path.cwd().resolve();allowed={root,root.parent/'DecidoBien-review-24bb4af'}
result=subprocess.run(['lsof','-nP','-t','-iTCP:4173','-sTCP:LISTEN'],capture_output=True,text=True)
if result.returncode not in {0,1}:raise SystemExit('No se pudo identificar el puerto. No se detuvo ningún proceso.')
pids=set(int(x) for x in result.stdout.split())
for pid in pids:
 try:
  proc=Path('/proc')/str(pid);cwd=(proc/'cwd').resolve()
  args=(proc/'cmdline').read_bytes().decode().strip('\0').split('\0')
  owned=proc.stat().st_uid==os.getuid()
  python=Path(args[0]).name.startswith('python')
  standard=args[1:4]==['-m','http.server','4173'] and args[4:] in [[],['--bind','0.0.0.0'],['--bind','127.0.0.1']]
  project=len(args)>=2 and (cwd/args[1]).resolve()==cwd/'server.py' and args[2:] in [[],['--port','4173']]
  if not(owned and python and cwd in allowed and (standard or project)):raise ValueError()
 except (OSError,ValueError,IndexError):raise SystemExit('Proceso desconocido en 4173. No se detuvo ningún proceso ni se cambiaron archivos.')
for pid in pids:os.kill(pid,signal.SIGTERM)
for _ in range(50):
 remaining=subprocess.run(['lsof','-nP','-t','-iTCP:4173','-sTCP:LISTEN'],capture_output=True,text=True)
 if remaining.returncode==1:break
 if remaining.returncode!=0:raise SystemExit('No se pudo comprobar el cierre del puerto.')
 time.sleep(.1)
else:raise SystemExit('El servidor anterior no cerró el puerto. No se usó terminación forzada.')
PY
previous_branch=$(git symbolic-ref --short -q HEAD || git rev-parse HEAD)
if [ -n "$(git status --porcelain=v1 --untracked-files=all)" ]; then
  git stash push --include-untracked -m "Antes de actualizar DecidoBien 2.4; origen=$previous_branch"
  printf 'Cambios locales conservados en stash: %s\n' "$(git rev-parse refs/stash)"
fi
if git show-ref --verify --quiet "refs/heads/$review_branch"; then
  git switch --no-overwrite-ignore "$review_branch"
  git merge --ff-only "$review_ref"
else
  git switch --no-overwrite-ignore --no-track -c "$review_branch" "$review_ref"
fi
review_fetch="+refs/heads/$review_branch:$review_ref"
if ! git config --fixed-value --get-all remote.origin.fetch "$review_fetch" >/dev/null; then
  git config --add remote.origin.fetch "$review_fetch"
fi
git config "branch.$review_branch.remote" origin
git config "branch.$review_branch.merge" "refs/heads/$review_branch"
test "$(git rev-parse HEAD)" = "$review_sha"
python3 - <<'PY'
import json,subprocess
v=json.loads(subprocess.check_output(['python3','server.py','--diagnose'],text=True))
assert v['release']=='2.4.0-review.3' and v['source_hash']=='22939c6b869a56c9' and not v['modified'], 'El contenido local no coincide con la base.'
print(json.dumps(v,indent=2),flush=True)
PY
npm start

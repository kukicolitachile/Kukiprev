#!/usr/bin/env bash
# Review updates come from Git. Preflight does not stop the current service or alter its worktree.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
python3 - <<'PY'
import hashlib,json,os,shutil,signal,subprocess,sys,tempfile,time,urllib.request
from pathlib import Path

PORT=4173
EXPECTED_RELEASE='2.7.0-review.1'
EXPECTED_SOURCE_HASH='be8ab5576f3a94ca'
REVIEW_BRANCH='implementation/correa-phaser-demo'
START_COMMAND=['npm','start']
ROOT=Path.cwd().resolve()
REF='refs/remotes/origin/'+REVIEW_BRANCH
OPENER=urllib.request.build_opener(urllib.request.ProxyHandler({}))

def run(*args,cwd=ROOT):
 result=subprocess.run(args,cwd=cwd,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
 if result.returncode:
  raise RuntimeError('Falló '+args[0]+': '+(result.stderr.strip() or result.stdout.strip())[:700])
 return result.stdout.strip()

def git(*args):return run('git',*args)
def ref_exists(ref):return subprocess.run(['git','show-ref','--verify','--quiet',ref],cwd=ROOT).returncode==0
def ancestor(a,b):return subprocess.run(['git','merge-base','--is-ancestor',a,b],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL).returncode==0

def listeners():
 p=subprocess.run(['lsof','-nP','-t','-iTCP:'+str(PORT),'-sTCP:LISTEN'],capture_output=True,text=True)
 if p.returncode not in {0,1}:raise RuntimeError('No se pudo identificar el puerto; no se detuvo ningún proceso.')
 return set(int(x) for x in p.stdout.split())

def recognize(pid):
 try:
  proc=Path('/proc')/str(pid);cwd=(proc/'cwd').resolve();args=(proc/'cmdline').read_bytes().decode().strip('\0').split('\0')
  owned=proc.stat().st_uid==os.getuid();python=Path(args[0]).name.startswith('python')
  standard=args[1:4]==['-m','http.server',str(PORT)] and args[4:] in [[],['--bind','0.0.0.0'],['--bind','127.0.0.1']]
  project=len(args)>=2 and (cwd/args[1]).resolve()==cwd/'server.py' and args[2:] in [[],['--port',str(PORT)]]
  if not(owned and python and cwd in {ROOT,ROOT.parent/'DecidoBien-review-2f8275d'} and (standard or project)):raise ValueError()
  # Prevent signalling a reused PID after the preflight.
  start=(proc/'stat').read_text().rsplit(')',1)[1].split()[19]
  return {'pid':pid,'cwd':str(cwd),'args':args,'start':start,'project':project}
 except (OSError,ValueError,IndexError):raise RuntimeError('Proceso desconocido en el puerto. No se detuvo ni se cambiaron archivos.')

def fingerprint():
 h=hashlib.sha256()
 for args in [['status','--porcelain=v1','-z','--untracked-files=all'],['diff','--binary'],['diff','--cached','--binary','HEAD']]:
  h.update(subprocess.check_output(['git',*args],cwd=ROOT))
 paths=subprocess.check_output(['git','ls-files','--others','--exclude-standard','-z'],cwd=ROOT).split(b'\0')
 for raw in paths:
  if not raw:continue
  h.update(raw);path=ROOT/os.fsdecode(raw)
  if path.is_symlink():h.update(os.fsencode(os.readlink(path)))
  elif path.is_file():
   with path.open('rb') as f:
    for chunk in iter(lambda:f.read(1024*1024),b''):h.update(chunk)
 return h.hexdigest()

def require_clean_operation():
 for name in ['index.lock','MERGE_HEAD','CHERRY_PICK_HEAD','REVERT_HEAD','rebase-merge','rebase-apply']:
  if Path(git('rev-parse','--git-path',name)).exists():raise RuntimeError('Hay una operación Git pendiente ('+name+'). El servidor continúa sin cambios.')
 if git('ls-files','--unmerged'):raise RuntimeError('Hay conflictos Git sin resolver. El servidor continúa sin cambios.')
 if subprocess.run(['git','config','--bool','core.sparseCheckout'],cwd=ROOT,capture_output=True,text=True).stdout.strip()=='true':
  raise RuntimeError('Este actualizador requiere un checkout completo; no se cambió el servidor.')
 worktree=None
 for line in git('worktree','list','--porcelain').splitlines():
  if line.startswith('worktree '):worktree=Path(line[9:]).resolve()
  if line=='branch refs/heads/'+REVIEW_BRANCH and worktree!=ROOT:
   raise RuntimeError('La rama de revisión está activa en otro checkout; el servidor continúa sin cambios.')

def check_ignored_collisions(sha):
 targets=[os.fsdecode(x) for x in subprocess.check_output(['git','ls-tree','-r','--name-only','-z',sha],cwd=ROOT).split(b'\0') if x]
 ignored=[os.fsdecode(x) for x in subprocess.check_output(['git','ls-files','--others','--ignored','--exclude-standard','-z'],cwd=ROOT).split(b'\0') if x]
 # A file can collide with the target itself, a target directory, or a target file's parent.
 for old in ignored:
  old=old.rstrip('/')
  if any(old==new or old.startswith(new+'/') or new.startswith(old+'/') for new in targets):
   raise RuntimeError('Un archivo ignorado colisiona con el candidato: '+old+'. No se detuvo el servidor ni se movió el archivo.')

def candidate_preflight(sha):
 # An isolated detached worktree validates the candidate without serving another instance.
 with tempfile.TemporaryDirectory(prefix='decidobien-updater-preflight-') as tmp:
  candidate=Path(tmp)/'candidate';added=False
  try:
   git('worktree','add','--quiet','--detach',str(candidate),sha);added=True
   package=json.loads((candidate/'package.json').read_text())
   if package.get('scripts',{}).get('start')!='python3 server.py':raise RuntimeError('El candidato no usa el servidor de revisión esperado.')
   compile((candidate/'server.py').read_text(),str(candidate/'server.py'),'exec')
   value=json.loads(run(sys.executable,'server.py','--diagnose',cwd=candidate))
   if value.get('release')!=EXPECTED_RELEASE or value.get('source_hash')!=EXPECTED_SOURCE_HASH or value.get('modified'):
    raise RuntimeError('La versión o huella del candidato no coincide con la entrega prevista; el servidor anterior continúa activo.')
  finally:
   if added:git('worktree','remove','--force',str(candidate))

def response(path):
 with OPENER.open('http://127.0.0.1:'+str(PORT)+path,timeout=.6) as r:return r.status,r.read()

def runtime_ready(sha,process):
 deadline=time.monotonic()+10
 while time.monotonic()<deadline:
  if process.poll() is not None:raise RuntimeError('El nuevo servidor terminó antes de validar su arranque (código '+str(process.returncode)+').')
  try:
   _,raw=response('/__runtime.json');v=json.loads(raw)
   if v.get('commit')==sha and v.get('branch')==REVIEW_BRANCH and v.get('release')==EXPECTED_RELEASE and v.get('source_hash')==EXPECTED_SOURCE_HASH and not v.get('modified'):
    return v
  except (OSError,ValueError):pass
  time.sleep(.1)
 raise RuntimeError('No se pudo verificar la versión servida por el candidato.')

def stop_started_server(process):
 # npm can exit before its Python child; terminate only the group we created.
 try:os.killpg(process.pid,signal.SIGTERM)
 except ProcessLookupError:pass
 process.wait(timeout=5)
 deadline=time.monotonic()+5
 while listeners():
  if time.monotonic()>deadline:raise RuntimeError('El servidor nuevo no liberó el puerto; no se usó terminación forzada.')
  time.sleep(.1)

original_head=None;original_branch=None;before_fingerprint=None;previous=[];stopped=False;switched=False;stash=None;new_server=None;verified=False
try:
 for name in ['git','python3','node','npm','lsof']:
  if not shutil.which(name):raise RuntimeError('Falta un requisito: '+name+'. No se detuvo el servidor.')
 run('npm','--version');run('node','--version');require_clean_operation()
 original_head=git('rev-parse','HEAD');original_branch=git('symbolic-ref','--short','-q','HEAD') if subprocess.run(['git','symbolic-ref','--quiet','HEAD'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL).returncode==0 else None
 before_fingerprint=fingerprint();previous=[recognize(pid) for pid in listeners()]
 # A recovery outside ROOT cannot be restored by changing ROOT; reject this legacy case before stopping.
 if any(Path(p['cwd'])!=ROOT for p in previous):raise RuntimeError('El servidor reconocido usa otro checkout. Se conserva activo; actualiza desde ese checkout antes de continuar.')
 git('fetch','origin','refs/heads/'+REVIEW_BRANCH+':'+REF);sha=git('rev-parse',REF)
 if not ancestor('2f8275d',sha):raise RuntimeError('La rama no parte de la base acordada.')
 if ref_exists('refs/heads/'+REVIEW_BRANCH) and not ancestor(REVIEW_BRANCH,REF):raise RuntimeError('La rama local contiene commits divergentes; se conservó sin sobrescribir.')
 check_ignored_collisions(sha)
 if ref_exists('refs/heads/'+REVIEW_BRANCH):check_ignored_collisions(REVIEW_BRANCH)
 candidate_preflight(sha)
 if git('rev-parse','HEAD')!=original_head or fingerprint()!=before_fingerprint:raise RuntimeError('El árbol cambió durante el preflight. No se detuvo el servidor; vuelve a intentarlo después de revisar esos cambios.')
 require_clean_operation();check_ignored_collisions(sha)
 if listeners()!={p['pid'] for p in previous} or any(recognize(p['pid'])!=p for p in previous):raise RuntimeError('Cambió el proceso del puerto durante el preflight. No se detuvo ningún proceso.')
 print('Preflight completo: candidato, requisitos, operación Git y colisiones verificados.',flush=True)
 stopped=True
 for p in previous:os.kill(p['pid'],signal.SIGTERM)
 deadline=time.monotonic()+5
 while listeners():
  if time.monotonic()>deadline:raise RuntimeError('El servidor anterior no cerró el puerto. No se usó terminación forzada.')
  time.sleep(.1)
 if git('status','--porcelain=v1','--untracked-files=all'):
  git('stash','push','--include-untracked','-m','Antes de actualizar DecidoBien; origen='+(original_branch or original_head))
  stash=git('rev-parse','refs/stash');print('Cambios locales conservados en stash: '+stash,flush=True)
 if ref_exists('refs/heads/'+REVIEW_BRANCH):git('switch','--no-overwrite-ignore',REVIEW_BRANCH);switched=True;git('merge','--ff-only',REF)
 else:git('switch','--no-overwrite-ignore','--no-track','-c',REVIEW_BRANCH,REF);switched=True
 if git('rev-parse','HEAD')!=sha:raise RuntimeError('El checkout no coincide con el candidato.')
 value=json.loads(run(sys.executable,'server.py','--diagnose'))
 if value.get('release')!=EXPECTED_RELEASE or value.get('source_hash')!=EXPECTED_SOURCE_HASH or value.get('modified'):raise RuntimeError('El checkout activo no coincide con el candidato validado.')
 fetch_spec='+refs/heads/'+REVIEW_BRANCH+':'+REF
 configured=git('config','--get-all','remote.origin.fetch').splitlines()
 if fetch_spec not in configured:git('config','--add','remote.origin.fetch',fetch_spec)
 git('config','branch.'+REVIEW_BRANCH+'.remote','origin');git('config','branch.'+REVIEW_BRANCH+'.merge','refs/heads/'+REVIEW_BRANCH)
 new_server=subprocess.Popen(START_COMMAND,cwd=ROOT,start_new_session=True)
 value=runtime_ready(sha,new_server);verified=True;print(json.dumps({'actualizacion':'verificada','servidor':value,'cambios_locales_en_stash':stash},ensure_ascii=False),flush=True)
 try:
  code=new_server.wait()
 except KeyboardInterrupt:
  stop_started_server(new_server)
  code=0
 sys.exit(code)
except (Exception,KeyboardInterrupt) as error:
 print('No se completó la actualización: '+str(error),file=sys.stderr,flush=True)
 if not stopped:
  print('El servicio y el árbol de trabajo anteriores no se cambiaron.',file=sys.stderr,flush=True);sys.exit(1)
 # A verified new service ending is not silently relabelled as an old service.
 if verified:
  print('El candidato llegó a estar verificado; el servidor terminó. No se revirtió ni se aplicó el stash automáticamente.',file=sys.stderr,flush=True);sys.exit(1)
 try:
  if new_server:stop_started_server(new_server)
  live=listeners()
  if live:
   if not switched and all(any(p['pid']==pid and recognize(pid)==p for p in previous) for pid in live):
    print('El servicio anterior sigue activo; no se cambió el checkout.',file=sys.stderr,flush=True);sys.exit(1)
   raise RuntimeError('El puerto está ocupado; no se detuvo ese proceso para simular una recuperación.')
  if original_branch and ref_exists('refs/heads/'+original_branch) and git('rev-parse',original_branch)==original_head:
   git('switch','--no-overwrite-ignore',original_branch)
  else:git('switch','--no-overwrite-ignore','--detach',original_head)
  if git('rev-parse','HEAD')!=original_head:raise RuntimeError('No se recuperó el HEAD anterior.')
  if previous:
   log_path=Path(git('rev-parse','--git-path','decidobien-updater-recovery.log')).resolve()
   with log_path.open('ab') as log:
    recovered=[subprocess.Popen(p['args'],cwd=p['cwd'],stdout=log,stderr=log,start_new_session=True) for p in previous]
   deadline=time.monotonic()+8;checked=None
   while time.monotonic()<deadline:
    if any(p.poll() is not None for p in recovered):raise RuntimeError('El proceso de recuperación terminó antes de verificarse.')
    try:
     live=listeners()
     if live and live<={p.pid for p in recovered} and all(recognize(pid)['cwd']==str(ROOT) for pid in live):
      if previous[0]['project']:
       _,raw=response('/__runtime.json');checked=json.loads(raw)
       if checked.get('commit')!=original_head:raise ValueError('HEAD servido distinto')
      else:
       status,raw=response('/');checked={'http_status':status,'head':original_head,'comando':previous[0]['args'],'contenido_root':'base Git anterior; stash no reaplicado' if stash else 'checkout anterior sin stash nuevo'}
      break
    except (OSError,ValueError):pass
    time.sleep(.1)
   else:raise RuntimeError('No respondió una instancia reconocida del servicio anterior.')
   print(json.dumps({'recuperacion':'base_anterior_verificada','servidor':checked,'head':original_head,'rama':git('branch','--show-current'),'comandos_reiniciados':[p['args'] for p in previous],'stash_no_reaplicado':stash,'ediciones_locales_reaplicadas':False,'registro':str(log_path)},ensure_ascii=False),file=sys.stderr,flush=True)
  else:print('Se recuperó el HEAD anterior. No había un servidor previo que reiniciar; el puerto quedó sin servicio.',file=sys.stderr,flush=True)
 except Exception as recovery_error:
  print('RECUPERACIÓN NO VERIFICADA: '+str(recovery_error)+'. HEAD actual='+git('rev-parse','HEAD')+'; stash conservado='+str(stash)+'. Revisa el diagnóstico antes de usar esta instancia.',file=sys.stderr,flush=True)
 sys.exit(1)
PY

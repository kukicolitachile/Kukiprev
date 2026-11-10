import json,subprocess,tempfile,time,os,signal,urllib.request,socket
from pathlib import Path
base=Path(tempfile.mkdtemp(prefix='decidobien-git-update-'));remote=base/'remote.git'
def run(*args):return subprocess.check_output(args,text=True,stderr=subprocess.PIPE).strip()
run('git','clone','--bare',str(Path(__file__).resolve().parents[1]),str(remote));run('git','--git-dir',str(remote),'update-ref','refs/heads/main','844bc05')
source=(Path(__file__).resolve().parents[1]/'scripts/update-codespace.sh').read_text()
def fixture(name,port):
 root=base/name;run('git','clone','--branch','main',str(remote),str(root))
 script=base/(name+'.sh');script.write_text(source.replace('4173',str(port)).replace('npm start','python3 server.py --port '+str(port)))
 return root,script
for port in [4190,4191,4192]:
 with socket.socket() as probe:probe.bind(('127.0.0.1',port))
root,script=fixture('Kukiprev',4190)
run('git','-C',str(root),'config','user.name','Prueba local');run('git','-C',str(root),'config','user.email','test@example.invalid')
(root/'commit-local.txt').write_text('Commit local que conservar\n');run('git','-C',str(root),'add','commit-local.txt');run('git','-C',str(root),'commit','-m','Local change to preserve')
original_main=run('git','-C',str(root),'rev-parse','main')
(root/'README.md').write_text((root/'README.md').read_text()+'\nMODIFICACION_LOCAL\n');(root/'nota-local.txt').write_text('ARCHIVO_SIN_SEGUIMIENTO\n')
old=subprocess.Popen(['python3','-m','http.server','4190','--bind','127.0.0.1'],cwd=root,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(.3)
output=open(base/'actualizacion.log','w');process=subprocess.Popen(['bash',str(script)],cwd=root,stdout=output,stderr=output,start_new_session=True)
try:
 opener=urllib.request.build_opener(urllib.request.ProxyHandler({}));active=None
 for _ in range(100):
  if process.poll() is not None:raise RuntimeError((base/'actualizacion.log').read_text())
  try:
   with opener.open('http://127.0.0.1:4190/__runtime.json',timeout=.3) as r:active=json.load(r)
   if active.get('release')=='2.6.1-review.1':break
  except Exception:pass
  time.sleep(.1)
 assert active and active['release']=='2.6.1-review.1' and active['branch']=='implementation/correa-phaser-demo' and not active['modified'],active
 assert run('git','-C',str(root),'rev-parse','main')==original_main
 assert 'MODIFICACION_LOCAL' in run('git','-C',str(root),'show','stash@{0}:README.md')
 assert 'ARCHIVO_SIN_SEGUIMIENTO' in run('git','-C',str(root),'show','stash@{0}^3:nota-local.txt')
 assert old.poll() is not None
finally:
 os.killpg(process.pid,signal.SIGTERM);process.wait();output.close()
 if old.poll() is None:old.terminate();old.wait()
root2,script2=fixture('Kukiprev-unknown',4191)
(root2/'README.md').write_text((root2/'README.md').read_text()+'\nNO_CAMBIAR\n');before=run('git','-C',str(root2),'status','--porcelain')
unknown=subprocess.Popen(['python3','-m','http.server','4191','--bind','127.0.0.1'],cwd=base,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(.3)
try:
 r=subprocess.run(['bash',str(script2)],cwd=root2,capture_output=True,text=True)
 assert r.returncode!=0 and unknown.poll() is None
 assert run('git','-C',str(root2),'status','--porcelain')==before
finally:unknown.terminate();unknown.wait()
root3,script3=fixture('Kukiprev-ignored',4192)
with (root3/'.git/info/exclude').open('a') as f:f.write('\nrecovery.html\n')
(root3/'recovery.html').write_text('ARCHIVO_IGNORADO_CONSERVAR')
r=subprocess.run(['bash',str(script3)],cwd=root3,capture_output=True,text=True)
assert r.returncode!=0 and (root3/'recovery.html').read_text()=='ARCHIVO_IGNORADO_CONSERVAR'
assert run('git','-C',str(root3),'branch','--show-current')=='main'
result={'pinned_remote_commit_served':active,'main_local_commits_preserved':True,'tracked_and_untracked_changes_saved_in_stash':True,'recognized_server_restarted':True,'unknown_server_not_stopped':True,'ignored_collision_not_overwritten':True}
print(json.dumps(result))

"""Exercise updater transactions in local clones; never use the shared app port.

--candidate-ref selects committed candidate source (default HEAD). Fixture guards
are derived from that candidate, so release bumps do not require editing tests.
The production updater's release/hash pins remain unchanged by this test.
"""
import argparse
import json
import os
import re
import signal
import socket
import subprocess
import tempfile
import time
import urllib.request
from pathlib import Path

parser=argparse.ArgumentParser()
parser.add_argument('--candidate-ref',default='HEAD')
args=parser.parse_args()
repository=Path(__file__).resolve().parents[1]
base=Path(tempfile.mkdtemp(prefix='decidobien-git-update-'))
remote=base/'remote.git'
branch='implementation/correa-phaser-demo'
opener=urllib.request.build_opener(urllib.request.ProxyHandler({}))
source=(repository/'scripts/update-codespace.sh').read_text()
processes=[]
roots=[]


def run(*command,cwd=None):
    return subprocess.check_output(command,cwd=cwd,text=True,stderr=subprocess.PIPE).strip()


def git(root,*command):
    return run('git','-C',str(root),*command)


def replace_assignment(script,name,value):
    script,count=re.subn(r'^'+name+r'=.*$',name+'='+repr(value),script,flags=re.MULTILINE)
    assert count==1,name
    return script


def wait_for(check,timeout=15):
    deadline=time.monotonic()+timeout
    while time.monotonic()<deadline:
        try:
            value=check()
            if value:return value
        except (OSError,ValueError):pass
        time.sleep(.1)
    raise AssertionError('Timed out waiting for fixture; logs in '+str(base))


def request(port,path='/'):
    with opener.open('http://127.0.0.1:'+str(port)+path,timeout=.5) as response:
        return response.read()


def fixture(name,port,project=False):
    root=base/name
    run('git','clone','--branch','main',str(remote),str(root))
    if project:
        git(root,'switch','--detach','origin/'+branch)
        git(root,'branch','-f','main','HEAD')
        git(root,'switch','main')
    git(root,'config','user.name','Prueba local')
    git(root,'config','user.email','test@example.invalid')
    script=replace_assignment(source,'PORT',port)
    script=replace_assignment(script,'START_COMMAND',['npm','start','--','--port',str(port)])
    script=replace_assignment(script,'EXPECTED_RELEASE',expected['release'])
    script=replace_assignment(script,'EXPECTED_SOURCE_HASH',expected['source_hash'])
    path=base/(name+'.sh')
    path.write_text(script)
    roots.append((root,port))
    return root,path


def start_previous(root,port,project=False):
    command=['python3','server.py','--port',str(port)] if project else ['python3','-m','http.server',str(port),'--bind','127.0.0.1']
    process=subprocess.Popen(command,cwd=root,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,start_new_session=True)
    processes.append(process)
    wait_for(lambda:request(port))
    return process


def add_local_changes(root):
    (root/'commit-local.txt').write_text('COMMIT_LOCAL_CONSERVAR\n')
    git(root,'add','commit-local.txt')
    git(root,'commit','-m','Local commit to preserve')
    original=git(root,'rev-parse','main')
    with (root/'README.md').open('a') as file:file.write('\nEDICION_STAGED\n')
    git(root,'add','README.md')
    with (root/'README.md').open('a') as file:file.write('\nEDICION_UNSTAGED\n')
    (root/'nota-local.txt').write_text('ARCHIVO_SIN_SEGUIMIENTO\n')
    with (root/'.git/info/exclude').open('a') as file:file.write('\nprivado-local.txt\n')
    (root/'privado-local.txt').write_text('IGNORADO_NO_COLISIONA\n')
    return original


def assert_stash(root,original):
    assert git(root,'rev-parse','main')==original
    assert 'EDICION_STAGED' in git(root,'show','stash@{0}^2:README.md')
    assert 'EDICION_UNSTAGED' not in git(root,'show','stash@{0}^2:README.md')
    assert 'EDICION_UNSTAGED' in git(root,'show','stash@{0}:README.md')
    assert 'ARCHIVO_SIN_SEGUIMIENTO' in git(root,'show','stash@{0}^3:nota-local.txt')
    assert not (root/'nota-local.txt').exists()
    assert 'EDICION_UNSTAGED' not in (root/'README.md').read_text()
    assert (root/'privado-local.txt').read_text()=='IGNORADO_NO_COLISIONA\n'


def state(root):
    return (git(root,'rev-parse','HEAD'),git(root,'branch','--show-current'),
            git(root,'status','--porcelain=v1','--untracked-files=all'),
            git(root,'diff','--binary'),git(root,'diff','--cached','--binary'))


def rejected(root,script,old,port,message):
    before=state(root)
    content=(root/'README.md').read_bytes()
    previous=request(port)
    result=subprocess.run(['bash',str(script)],cwd=root,capture_output=True,text=True,timeout=30)
    (base/(root.name+'.log')).write_text(result.stdout+result.stderr)
    assert result.returncode!=0,result.stdout+result.stderr
    assert message in result.stderr,result.stderr
    assert 'Preflight completo' not in result.stdout,result.stdout
    assert old.poll() is None
    assert state(root)==before
    assert (root/'README.md').read_bytes()==content
    assert request(port)==previous
    assert git(root,'stash','list')==''
    return result


def stop_fixture(root,port):
    # Only terminate listeners whose cwd is this temporary clone; never a shared service.
    result=subprocess.run(['lsof','-nP','-t','-iTCP:'+str(port),'-sTCP:LISTEN'],capture_output=True,text=True)
    for raw in result.stdout.split():
        pid=int(raw)
        try:
            assert (Path('/proc')/raw/'cwd').resolve()==root
            os.kill(pid,signal.SIGTERM)
        except ProcessLookupError:pass
    for process in processes:
        if process.poll() is None:
            try:os.killpg(process.pid,signal.SIGTERM)
            except ProcessLookupError:pass
        try:process.wait(timeout=5)
        except subprocess.TimeoutExpired:pass


try:
    for port in range(4190,4197):
        with socket.socket() as probe:
            probe.setsockopt(socket.SOL_SOCKET,socket.SO_REUSEADDR,1)
            probe.bind(('127.0.0.1',port))
    run('git','clone','--bare',str(repository),str(remote))
    candidate=git(repository,'rev-parse',args.candidate_ref)
    run('git','--git-dir',str(remote),'update-ref','refs/heads/'+branch,candidate)
    run('git','--git-dir',str(remote),'update-ref','refs/heads/main','844bc05')
    seed=base/'candidate'
    run('git','clone','--branch',branch,str(remote),str(seed))
    expected=json.loads(run('python3','server.py','--diagnose',cwd=seed))
    assert expected['commit']==candidate and not expected['modified'],expected

    root,script=fixture('success',4190)
    original=add_local_changes(root)
    old=start_previous(root,4190)
    log_path=base/'success.log'
    with log_path.open('w') as log:
        process=subprocess.Popen(['bash',str(script)],cwd=root,stdout=log,stderr=log,start_new_session=True)
    processes.append(process)
    def updated():
        if process.poll() is not None:raise AssertionError(log_path.read_text())
        active=json.loads(request(4190,'/__runtime.json'))
        return active if active.get('commit')==candidate else None
    active=wait_for(updated)
    wait_for(lambda:'"actualizacion": "verificada"' in log_path.read_text())
    assert active['release']==expected['release'] and active['source_hash']==expected['source_hash']
    assert active['branch']==branch and not active['modified']
    assert_stash(root,original)
    assert old.poll() is not None
    stop_fixture(root,4190)

    root,script=fixture('unknown',4191)
    (root/'README.md').write_text((root/'README.md').read_text()+'\nNO_CAMBIAR\n')
    (base/'index.html').write_text('SERVICIO_DESCONOCIDO_CONSERVAR')
    unknown=start_previous(base,4191)
    rejected(root,script,unknown,4191,'Proceso desconocido')
    unknown.terminate();unknown.wait(timeout=5)

    root,script=fixture('ignored',4192)
    original=add_local_changes(root)
    with (root/'.git/info/exclude').open('a') as file:file.write('\nrecovery.html\n')
    (root/'recovery.html').write_text('ARCHIVO_IGNORADO_CONSERVAR')
    old=start_previous(root,4192)
    rejected(root,script,old,4192,'ignorado colisiona')
    assert git(root,'rev-parse','main')==original
    assert (root/'recovery.html').read_text()=='ARCHIVO_IGNORADO_CONSERVAR'
    assert (root/'nota-local.txt').read_text()=='ARCHIVO_SIN_SEGUIMIENTO\n'
    assert (root/'privado-local.txt').read_text()=='IGNORADO_NO_COLISIONA\n'
    stop_fixture(root,4192)

    root,script=fixture('recovery',4193,project=True)
    original=add_local_changes(root)
    old=start_previous(root,4193,project=True)
    # Inject a failure only into this fixture, after npm's child is serving.
    script.write_text(script.read_text().replace('value=runtime_ready(sha,new_server);verified=True;',
        "value=runtime_ready(sha,new_server);raise RuntimeError('FALLO_CONTROLADO_TRAS_ARRANQUE');verified=True;"))
    result=subprocess.run(['bash',str(script)],cwd=root,capture_output=True,text=True,timeout=40)
    (base/'recovery.log').write_text(result.stdout+result.stderr)
    assert result.returncode!=0,result.stdout+result.stderr
    assert 'FALLO_CONTROLADO_TRAS_ARRANQUE' in result.stderr,result.stderr
    assert 'Preflight completo' in result.stdout
    report=next(json.loads(line) for line in result.stderr.splitlines() if line.startswith('{"recuperacion"'))
    assert report['recuperacion']=='base_anterior_verificada',report
    assert report['head']==original and report['rama']=='main',report
    assert report['comandos_reiniciados']==[['python3','server.py','--port','4193']],report
    assert report['stash_no_reaplicado']==git(root,'rev-parse','refs/stash')
    assert report['ediciones_locales_reaplicadas'] is False
    recovered=json.loads(request(4193,'/__runtime.json'))
    assert recovered['commit']==original and recovered['branch']=='main' and not recovered['modified'],recovered
    assert report['servidor']==recovered
    assert old.poll() is not None
    assert_stash(root,original)
    assert (root/'commit-local.txt').read_text()=='COMMIT_LOCAL_CONSERVAR\n'
    stop_fixture(root,4193)

    root,script=fixture('divergent',4194)
    git(root,'switch','-c',branch,'origin/'+branch)
    (root/'divergent.txt').write_text('NO_SOBRESCRIBIR\n')
    git(root,'add','divergent.txt');git(root,'commit','-m','Divergent local review commit')
    divergent=git(root,'rev-parse','HEAD');git(root,'switch','main')
    old=start_previous(root,4194)
    rejected(root,script,old,4194,'commits divergentes')
    assert git(root,'rev-parse',branch)==divergent
    stop_fixture(root,4194)

    root,script=fixture('invalid-candidate',4195)
    script.write_text(replace_assignment(script.read_text(),'EXPECTED_SOURCE_HASH','invalid-fixture-hash'))
    old=start_previous(root,4195)
    rejected(root,script,old,4195,'huella del candidato')
    assert len(git(root,'worktree','list','--porcelain').split('worktree '))==2
    stop_fixture(root,4195)

    root,script=fixture('pending-operation',4196)
    (root/'.git/MERGE_HEAD').write_text(candidate+'\n')
    old=start_previous(root,4196)
    rejected(root,script,old,4196,'operación Git pendiente')
    assert (root/'.git/MERGE_HEAD').read_text()==candidate+'\n'
    stop_fixture(root,4196)

    print(json.dumps({'candidate':candidate,'release':expected['release'],'source_hash':expected['source_hash'],
        'success_commit_served':True,'main_local_commits_preserved':True,'staged_unstaged_untracked_stashed':True,
        'ignored_noncollision_preserved':True,'unknown_server_preserved':True,'ignored_collision_server_online':True,
        'post_start_failure_previous_base_restarted':True,'stash_not_reapplied':True,'divergent_review_preserved':True,
        'invalid_candidate_rejected_online':True,'pending_git_operation_rejected_online':True,'evidence':str(base)}))
finally:
    for root,port in roots:stop_fixture(root,port)

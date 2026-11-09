"""HTTP and filesystem abuse checks, using a separate temporary root and ephemeral port."""
import sys,tempfile,threading,http.client,json
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]));import server
with tempfile.TemporaryDirectory() as tmp:
 root=Path(tmp);server.ROOT=root;(root/'index.html').write_text('<!doctype html><title>Review</title>');(root/'release.json').write_text('{"release":"test"}');(root/'private.txt').write_text('PRIVATE_FIXTURE')
 (root/'app.js').symlink_to(root/'private.txt')
 (root/'assets').symlink_to(Path('/tmp'))
 http_server=server.ThreadingHTTPServer(('127.0.0.1',0),server.Handler);thread=threading.Thread(target=http_server.serve_forever,daemon=True);thread.start();port=http_server.server_address[1]
 def req(method,path):
  c=http.client.HTTPConnection('127.0.0.1',port);c.request(method,path,body='IGNORED' if method=='POST' else None);r=c.getresponse();out=(r.status,dict(r.getheaders()),r.read());c.close();return out
 assert req('GET','/')[0]==200
 assert req('GET','/app.js')[0]==404 # A public filename must not expose another file through a symlink.
 assert req('GET','/assets/correa-revision.json')[0]==404
 for path in ['/.git/config','/../private.txt','/%2e%2e/private.txt','/docs/secret.md','//private.txt','/app.js/../private.txt']:
  r=req('GET',path);assert r[0]==404 and b'PRIVATE_FIXTURE' not in r[2]
 for path in ['/%00','/%ff']:
  assert req('GET',path)[0]==400
 for method in ['POST','PUT','DELETE','PATCH','OPTIONS']:
  r=req(method,'/');assert r[0]==405 and r[1]['Allow']=='GET, HEAD' and r[2]==b'Request rejected'
 r=req('GET','/<script>ATTACK</script>');assert r[0]==404 and b'ATTACK' not in r[2] and 'Python' not in r[1]['Server']
 assert req('HEAD','/')[2]==b''
 r=req('GET','/');assert "form-action 'none'" in r[1]['Content-Security-Policy'] and r[1]['Cross-Origin-Resource-Policy']=='same-origin'
 http_server.shutdown();thread.join();http_server.server_close()
print(json.dumps({'symlinks_and_private_files':'rejected','encoded_and_raw_traversal':'rejected','malformed_paths':'400','write_methods':'405','error_reflection_and_version_disclosure':'absent','HEAD_and_headers':'passed'}))

"""Review server: fixed root, declared public files, no trusted enterprise records."""
import argparse,hashlib,json,mimetypes,subprocess
from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit,unquote
ROOT=Path(__file__).resolve().parent
PUBLIC={'motion.css','vendor/PHASER-LICENSE.md','vendor/PDF-LIB-LICENSE.md','phaser-scene.js','phaser-board.js','phaser-demo.css','scene-layers.js','participant.js','certificate.js','certificate-policy.json','vendor/phaser-3.90.0.min.js','vendor/pdf-lib-1.17.1.min.js','index.html','app.js','mission-scene.js','experience.js','model.js','scenes.js','version-client.js','recovery.js','recovery.html','style.css','mission-scene.css','manifest.webmanifest','sw.js','release.json'}
ASSETS={'assets/correa-revision.json','assets/kuky.png','assets/icon.svg','assets/icon-192.png','assets/icon-512.png',*(f'assets/kuky/{x}.png' for x in ['atento','motivador','feliz']),*(f'assets/audio/{x}.wav' for x in ['select','confirm','discover','complete']),*(f'assets/escenas/esc-01-{x}.webp' for x in ['base','consecuencia'])}
CSP="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self' blob:; connect-src 'self'; worker-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'; form-action 'none'; frame-src 'none'"
def git(*args):
 try:return subprocess.check_output(['git','-C',str(ROOT),*args],stderr=subprocess.DEVNULL,text=True).strip()
 except Exception:return 'unavailable'
def public_file(name):
 if name not in PUBLIC|ASSETS:return None
 try:
  candidate=ROOT/name;parts=Path(name).parts
  if any((ROOT.joinpath(*parts[:i])).is_symlink() for i in range(1,len(parts)+1)):return None
  candidate.resolve(strict=True).relative_to(ROOT.resolve())
  return candidate if candidate.is_file() else None
 except (OSError,ValueError,RuntimeError):return None

def runtime():
 h=hashlib.sha256()
 for name in sorted(PUBLIC|ASSETS):
  file=public_file(name)
  if file:h.update(name.encode()+file.read_bytes())
 return {'release':json.loads((ROOT/'release.json').read_text())['release'],'commit':git('rev-parse','HEAD'),'branch':git('branch','--show-current'),'modified':bool(git('status','--porcelain','--untracked-files=normal')),'source_hash':h.hexdigest()[:16]}
class Handler(BaseHTTPRequestHandler):
 def version_string(self):return 'DecidoBien'
 def do_HEAD(self):self.respond(head=True)
 def do_GET(self):self.respond()
 def do_POST(self):self.send_error(405)
 do_PUT=do_DELETE=do_PATCH=do_OPTIONS=do_POST
 def write_response(self,status,data,kind,head=False,no_store=False):
  self.send_response(status);self.send_header('Content-Type',kind+('; charset=utf-8' if kind in {'text/html','application/json','application/javascript','text/javascript','text/css','text/plain'} else ''))
  self.send_header('Content-Length',str(len(data)));self.send_header('Cache-Control','no-store' if no_store else 'no-cache')
  self.send_header('X-Content-Type-Options','nosniff');self.send_header('Referrer-Policy','no-referrer');self.send_header('Permissions-Policy','camera=(), microphone=(), geolocation=()')
  self.send_header('Cross-Origin-Resource-Policy','same-origin');self.send_header('Content-Security-Policy',CSP)
  if status==405:self.send_header('Allow','GET, HEAD')
  self.end_headers()
  if not head:self.wfile.write(data)
 def send_error(self,code,message=None,explain=None):
  # Never reflect request targets, arbitrary input or implementation details in errors.
  self.close_connection=True
  self.write_response(code,b'Request rejected','text/plain',head=getattr(self,'command','')=='HEAD',no_store=True)
 def respond(self,head=False):
  try:path=unquote(urlsplit(self.path).path,errors='strict').lstrip('/') or 'index.html'
  except (ValueError,UnicodeError):return self.send_error(400)
  if '\x00' in path:return self.send_error(400)
  if path=='__runtime.json':
   try:data=json.dumps(runtime()).encode()
   except (OSError,ValueError):return self.send_error(503)
   return self.write_response(200,data,'application/json',head,no_store=True)
  file=public_file(path)
  if not file:return self.send_error(404)
  try:data=file.read_bytes()
  except OSError:return self.send_error(404)
  self.write_response(200,data,mimetypes.guess_type(path)[0] or 'application/octet-stream',head)
 def log_message(self,*args):pass # URLs may carry private query parameters.
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=4173);parser.add_argument('--diagnose',action='store_true');args=parser.parse_args()
 if args.diagnose:print(json.dumps({**runtime(),'root':str(ROOT),'port':args.port},indent=2))
 else:
  print(json.dumps({'serving':str(ROOT),'port':args.port,**runtime()}),flush=True)
  ThreadingHTTPServer(('0.0.0.0',args.port),Handler).serve_forever()

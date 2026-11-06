"""Development/review server with a fixed root and an explicit public surface."""
import argparse,hashlib,json,mimetypes,subprocess
from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit,unquote
ROOT=Path(__file__).resolve().parent
PUBLIC={'index.html','app.js','experience.js','model.js','scenes.js','version-client.js','recovery.js','recovery.html','style.css','manifest.webmanifest','sw.js','release.json'}
ASSETS={'assets/correa-revision.json','assets/kuky.png','assets/icon.svg','assets/icon-192.png','assets/icon-512.png',*(f'assets/kuky/{x}.png' for x in ['atento','motivador','feliz']),*(f'assets/audio/{x}.wav' for x in ['select','confirm','discover','complete']),*(f'assets/escenas/esc-01-{x}.webp' for x in ['base','consecuencia'])}
def git(*args):
 try:return subprocess.check_output(['git','-C',str(ROOT),*args],stderr=subprocess.DEVNULL,text=True).strip()
 except Exception:return 'unavailable'
def runtime():
 files=sorted(PUBLIC|ASSETS);h=hashlib.sha256()
 for name in files:
  file=ROOT/name
  if file.is_file():h.update(name.encode()+file.read_bytes())
 return {'release':json.loads((ROOT/'release.json').read_text())['release'],'commit':git('rev-parse','HEAD'),'branch':git('branch','--show-current'),'modified':bool(git('status','--porcelain','--untracked-files=no')),'source_hash':h.hexdigest()[:16]}
class Handler(BaseHTTPRequestHandler):
 def do_HEAD(self):self.respond(head=True)
 def do_GET(self):self.respond()
 def respond(self,head=False):
  path=unquote(urlsplit(self.path).path).lstrip('/') or 'index.html'
  if path=='__runtime.json':data=json.dumps(runtime()).encode();kind='application/json';status=200
  elif path in PUBLIC|ASSETS and (ROOT/path).is_file():data=(ROOT/path).read_bytes();kind=mimetypes.guess_type(path)[0] or 'application/octet-stream';status=200
  else:data=b'Not found';kind='text/plain';status=404
  self.send_response(status);self.send_header('Content-Type',kind+'; charset=utf-8' if kind in {'text/html','application/json','application/javascript','text/javascript','text/css','text/plain'} else kind)
  self.send_header('Content-Length',str(len(data)));self.send_header('Cache-Control','no-store' if path=='__runtime.json' else 'no-cache')
  self.send_header('X-Content-Type-Options','nosniff');self.send_header('Referrer-Policy','no-referrer');self.send_header('Permissions-Policy','camera=(), microphone=(), geolocation=()')
  self.send_header('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self' blob:; connect-src 'self'; worker-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'")
  self.end_headers()
  if not head:self.wfile.write(data)
 def log_message(self,format,*args):
  # Request URLs can carry private query parameters; do not log them.
  pass
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=4173);parser.add_argument('--diagnose',action='store_true');args=parser.parse_args()
 if args.diagnose:print(json.dumps({**runtime(),'root':str(ROOT),'port':args.port},indent=2))
 else:
  print(json.dumps({'serving':str(ROOT),'port':args.port,**runtime()}),flush=True)
  ThreadingHTTPServer(('0.0.0.0',args.port),Handler).serve_forever()

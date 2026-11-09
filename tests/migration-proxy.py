"""Isolated historical-PWA fixture. Never run this as the actual application server."""
import http.client,io,subprocess,tarfile
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
LEGACY=Path('/tmp/decidobien-legacy');LEGACY.mkdir(exist_ok=True)
blob=subprocess.check_output(['git','-C',str(ROOT),'archive','a590956'])
with tarfile.open(fileobj=io.BytesIO(blob)) as archive:archive.extractall(LEGACY,filter='data')
BASELINE=Path('/tmp/decidobien-baseline');BASELINE.mkdir(exist_ok=True)
with tarfile.open(fileobj=io.BytesIO(subprocess.check_output(['git','-C',str(ROOT),'archive','844bc05']))) as archive:archive.extractall(BASELINE,filter='data')
REVIEW=Path('/tmp/decidobien-review-base');REVIEW.mkdir(exist_ok=True)
with tarfile.open(fileobj=io.BytesIO(subprocess.check_output(['git','-C',str(ROOT),'archive','24bb4af']))) as archive:archive.extractall(REVIEW,filter='data')
IMPLEMENTATION=Path('/tmp/decidobien-implementation-base');IMPLEMENTATION.mkdir(exist_ok=True)
with tarfile.open(fileobj=io.BytesIO(subprocess.check_output(['git','-C',str(ROOT),'archive','2f8275d']))) as archive:archive.extractall(IMPLEMENTATION,filter='data')
mode=Path('/tmp/decidobien-migration-mode');mode.write_text('old')
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(LEGACY),**kwargs)
 def do_GET(self):
  if mode.read_text() in {'old','v6','review','implementation'}:
   self.directory=str({'old':LEGACY,'v6':BASELINE,'review':REVIEW,'implementation':IMPLEMENTATION}[mode.read_text()]);return super().do_GET()
  connection=http.client.HTTPConnection('127.0.0.1',4173);connection.request('GET',self.path);response=connection.getresponse();data=response.read();self.send_response(response.status)
  for key,value in response.getheaders():
   if key.lower() not in {'connection','server','date','transfer-encoding'}:self.send_header(key,value)
  self.end_headers();self.wfile.write(data);connection.close()
 def log_message(self,*args):pass
ThreadingHTTPServer(('127.0.0.1',4175),Handler).serve_forever()

from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import re
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(Path(__file__).resolve().parent),**kwargs)
 def do_GET(self):
  p=Path(self.translate_path(self.path))
  if p.is_file() and p.suffix=='.mp4':
   size=p.stat().st_size;start=0;end=size-1;partial=False
   match=re.match(r'bytes=(\d+)-(\d*)',self.headers.get('Range',''))
   if match:start=int(match[1]);end=min(int(match[2]) if match[2] else end,end);partial=True
   if start>=size:self.send_error(416);return
   self.send_response(206 if partial else 200)
   self.send_header('Content-Type','video/mp4');self.send_header('Accept-Ranges','bytes');self.send_header('Content-Length',str(end-start+1));self.send_header('Cache-Control','no-cache')
   if partial:self.send_header('Content-Range',f'bytes {start}-{end}/{size}')
   self.end_headers()
   try:
    with p.open('rb') as f:
     f.seek(start);remaining=end-start+1
     while remaining:
      b=f.read(min(65536,remaining));self.wfile.write(b);remaining-=len(b)
   except (BrokenPipeError,ConnectionResetError):pass
  else:super().do_GET()
 def log_message(self,*args):pass
ThreadingHTTPServer(('127.0.0.1',8000),Handler).serve_forever()

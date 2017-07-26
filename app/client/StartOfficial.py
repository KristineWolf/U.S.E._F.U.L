from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
import SocketServer

replacements = {'localhost:8000':'server.nopunkgames.space:8000'}
lines = []
with open('js/src/models/Connect.js') as infile:
    for line in infile:
        for src, target in replacements.iteritems():
            line = line.replace(src, target)
        lines.append(line)
with open('js/src/models/Connect.js', 'w') as outfile:
    for line in lines:
        outfile.write(line)

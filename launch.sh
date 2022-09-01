#!/bin/bash
# Open 'index.html' in Chrome with web security disabled (to disable same-origin policy, to enable scripting of audio context from video file)
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --disable-web-security --user-data-dir="./tmp" -–allow-file-access-from-files  --try-supported-channel-layouts --new-window ./index.html

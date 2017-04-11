#!/usr/bin/env node

'use strict'

var childProcess = require('child_process')

var up = childProcess.spawn('/bin/sh', ['-c', "HOST_IP=$(ifconfig | awk '/broadcast/ { print $2 }') docker-compose up --build"], {
  stdio: 'pipe',
  env: Object.assign({LOG_LEVEL: 'DEBUG'}, process.env)
})

up.stderr.on('data', data => {
  console.error(data.toString().replace(/\n*$/, ''))
})

var port = process.env.PORT || process.argv[2] || 9229
var portMask = new RegExp(`:${port}/`)

var opened = false
up.stdout.on('data', data => {
  var s = data.toString()
  console.log(s.replace(/\n*$/, ''))

  if (!opened) {
    var debugUrl = s.split('\n').find(c => /chrome-devtools/.test(c) && portMask.test(c))
    if (debugUrl) {
      childProcess.exec(`osascript <<EOB
set theURL to "${debugUrl.split(' ').pop()}"
tell application "Google Chrome"
 if windows = {} then
  make new window
  set URL of (active tab of window 1) to theURL
 else
  make new tab at the end of window 1 with properties {URL:theURL}
 end if
 activate
end tell
EOB`)
      opened = true
    }
  }
})

var downed = false
function down () {
  if (!downed) {
    downed = true
    childProcess.spawn('/bin/sh', ['-c', 'docker-compose down'], {
      stdio: 'inherit'
    })
  }
}

process.on('exit', down)
process.on('SIGINT', down)

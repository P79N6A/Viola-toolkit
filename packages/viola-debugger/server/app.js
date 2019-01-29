var express = require('express')
const path = require('path')
var app = express()

const WebSocket = require('ws');

var expressWs = require('express-ws')(app);

const port = 3000

app.use(express.static(path.resolve(__dirname, '../static')))

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/getBundle', (req, res) => {
  res.sendFile('/Users/ronktsang/Desktop/viola/framework-env/dist/bundle.js')
})

let count = 0

let nativePeer = null
let webPeer = null
app.ws('/fromNative', function(ws, req) {
  nativePeer = ws
  console.log('from Native')
  ws.on('message', function(msg) {
    console.log('callJS', msg)
    webPeer && webPeer.send(msg)
  });
  ws.on('close', () => {
    console.log('close')
  })
});

app.ws('/native', function(ws, req) {
  webPeer = ws
  ws.on('message', function(msg) {
    console.log('callNative', msg)
    nativePeer && nativePeer.send(msg)
  });
  ws.on('close', () => {
    console.log('close')
  })
});

app.ws('/debugger', function(ws, req) {
  const wsToHeadless = new WebSocket('ws://localhost:9222/devtools/page/6A99386EE24A60D5C7E3913DF233C868');
  let isConnecting = false
  wsToHeadless.on('open', function open() {
    console.log('connect to Headless')
    isConnecting = true
  });

  wsToHeadless.on('message', function incoming(msg) {
    ws.send(msg)
  });

  ws.on('message', function(msg) {
    wsToHeadless.send(msg)
    console.log('from Devtool', msg);
  });

  ws.on('close', () => {
    isConnecting = false
    wsToHeadless.close()
  })
  // console.log('socket', req.testing);
});



app.listen(port, () => console.log(`Example app listening on port ${port}!`))
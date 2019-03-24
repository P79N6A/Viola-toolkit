class WS {
  constructor ({
    url,
    on
  }) {
    this.url = url
    this.on = on
    this.init()
    return this
  }

  init () {
    const socket = new WebSocket(this.url)
    this.socket = socket
    socket.sendTask = function (type, data) {
      this.send(JSON.stringify({
        type, data
      }))
    }
    this._listen()
  }

  _listen () {
    const socket = this.socket
    socket.addEventListener('open', (event) => {
      this.on['open'] && this.on['open'](socket, event)
    });

    // Listen for messages
    socket.addEventListener('message', (msg) => {
      this.on['msg'] && this.on['msg'](socket, JSON.parse(msg.data))
      console.log('Message from server ', msg.data);
    });

    socket.addEventListener('close', (msg) => {
      this.on['close'] && this.on['close'](socket, msg)
    });
  }
}

export default WS
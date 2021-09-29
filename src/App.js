import './App.css';
import { Component } from 'react';
import Gun from 'gun';
import 'gun/lib/ipfs';

const Ipfs = require('ipfs');

class App extends Component {
  state = { messages: {} };

  componentDidMount() {
    Ipfs.create({
      config: {
        Addresses:{
          Swarm:[
            '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
            '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
          ]
        }
      },
    }).then(ipfs => {
      window.ipfs = ipfs;
      this.gun = new Gun({ipfs});
      this.gun.get('messages').map().on((msg, id) => {
        const messages = this.state.messages;
        messages[id] = msg;
        this.setState({messages});
      });

      setInterval(() => {
        ipfs.pubsub.peers('gundb').then(peers => {
          document.getElementById('topic-peers').innerText = 'Pubsub topic peers: ' + peers.length;
        });
        document.getElementById('network-peers').innerText = 'Network peers: ' + ipfs.libp2p.metrics.peers.length;
      }, 1000);
    });
  }

  onSubmit(e) {
    e.preventDefault();
    const el = document.getElementById('msg-input');
    if (el.value && this.gun) {
      this.gun.get('messages').set(el.value);
      el.value = '';
    }
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Chat over Gun & IPFS Pubsub</h1>
          <a className="App-link" href="https://github.com/mmalmi/gun-ipfs-chat">Source</a>
          <div id="network-peers">
            Network peers: 0
          </div>
          <div id="topic-peers">
            Pubsub topic peers: 0
          </div>
          <small>Usually takes a while to find topic peers</small>
          <br/>
          <form onSubmit={e => this.onSubmit(e)}>
            <input id="msg-input" placeholder="Type a message" />
            <input type="submit" value="Send" />
          </form><br/>
          {Object.keys(this.state.messages).map(key =>
            <div key={key}>{this.state.messages[key]}</div>
          ).reverse()}
        </header>
      </div>
    );
  }
}

export default App;

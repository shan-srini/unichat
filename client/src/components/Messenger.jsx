import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import io from 'socket.io-client';

export default function Messenger() {
  const [messages, setMessages] = useState([]);
  const [typedMsg, setTypedMsg] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // TODO: maybe move this to a hook if the same socket needs to be used in multiple places
    const sock = io.connect('http://localhost:5000');
    sock.on('message', (msg) => {
      console.log('got message', msg);
      setMessages(m => [...m, msg]);
    });
    setSocket(sock);
  }, []);

  const onSendMsg = () => {
    if (typedMsg !== '') {
      socket.emit('message', typedMsg);
      setTypedMsg('');
    }
  };


  return (
    <div className="messenger">
      <div className="sentMessages">
        {messages.map((msg) => {
          // TODO: replace the key w/ a unique id
          return (
            <div key={msg}>
              <p>{msg}</p>
            </div>
          );
        })}
      </div>
      <div className="messageComposer">
        <TextField
          id="outlined-basic"
          label="Type a message..."
          variant="outlined"
          value={typedMsg}
          onChange={(e) => setTypedMsg(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={onSendMsg}>
          Send
        </Button>
      </div>
    </div>
  );
}

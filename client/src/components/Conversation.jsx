import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import styled from 'styled-components';

const Container = styled.div`
  flex-grow: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const SentMessages = styled.div`
  flex-grow: 1;
`;
const CompositionArea = styled.div`
  margin-bottom: 20px;
  display: flex;
  display: flex;
  width: 90%;
`;

/**
 * View of a single group chat
 */
export default function Conversation({ group, socket }) {
  const [messages, setMessages] = useState([]); // TODO: request init msgs for this group
  const [typedMsg, setTypedMsg] = useState('');

  useEffect(() => {
    socket &&
      socket.on('message', (msg) => {
        // TODO: check if the msg is for this group.
        // probably change the cb each time groupID changes, alongside requesting past msgs
        console.log('got message', msg);
        setMessages((m) => [...m, msg]);
      });
  }, [socket]);

  const onSendMsg = () => {
    if (typedMsg !== '') {
      socket.emit('message', typedMsg);
      setTypedMsg('');
    }
  };

  return (
    <Container>
      {group === null ? (
        <p>Join a group to start sending messages</p>
      ) : (
        <>
          <h1>{group}</h1>
          <SentMessages>
            {messages.map((msg) => {
              // TODO: replace the key w/ a unique id
              return (
                <div key={msg}>
                  <p>{msg}</p>
                </div>
              );
            })}
          </SentMessages>
          <CompositionArea>
            <TextField
              id="outlined-basic"
              label="Type a message..."
              variant="outlined"
              value={typedMsg}
              onChange={(e) => setTypedMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSendMsg()}
              style={{flexGrow: 1}}
            />
            <Button variant="contained" color="primary" onClick={onSendMsg} style={{ marginLeft: '10px' }}>
              Send
            </Button>
          </CompositionArea>
        </>
      )}
    </Container>
  );
}

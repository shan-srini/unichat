import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import styled from 'styled-components';
import Divider from '@material-ui/core/Divider';
import Message from './Message';
const axios = require('axios');

const Container = styled.div`
  width: 60%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 10px 0px;
`;
const SentMessages = styled.div`
  flex-grow: 1;
  overflow: auto;
  width: 100%;
`;
const CompositionArea = styled.div`
  margin-bottom: 20px;
  margin-top: 10px;
  display: flex;
  display: flex;
  width: 90%;
`;

/**
 * View of a single group chat
 */
export default function Conversation({ group, socket, user, userLang }) {
  const [messages, setMessages] = useState([]);
  const [typedMsg, setTypedMsg] = useState('');

  useEffect(() => {
    if (socket) {
      socket.off('message');
      socket.on('message', (msg) => {
        // TODO: check if the msg is for this group.
        if (msg.convo === group) {
          setMessages((m) => [...m, msg]);
        }
      });
    }
    // TODO: request init msgs for this group
    axios.get(`http://localhost:5000/conversation/${group}/${userLang}`)
      .then((res) => {
        setMessages(res.data.messages);
      })
  }, [socket, group]);

  const onSendMsg = () => {
    if (typedMsg !== '') {
      socket.emit('message', { conversation_id: group, message: typedMsg, sent_by: user, language: userLang });
      setTypedMsg('');
    }
  };

  return (
    <Container>
      {group === undefined ? (
        <p>Join a group to start sending messages</p>
      ) : (
        <>
          <h1 style={{ margin: '10px' }}>{group}</h1>
          <Divider variant="middle" style={{ width: '95%' }} />

          <SentMessages>
            {messages.map((msg, idx) => {
              return <Message msg={msg} isYours={msg.sender === user} key={msg.id} />;
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
              style={{ flexGrow: 1 }}
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

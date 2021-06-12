import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Conversation from './Conversation';
import Groups from './Groups';
import styled from 'styled-components';
import Divider from '@material-ui/core/Divider';

const Container = styled.div`
  height: 100vh;
  display: flex;
  min-width: 0; 
  min-height: 0;
`;

export default function Messenger() {
  const [socket, setSocket] = useState(null);
  const [groups, setGroups] = useState(['group1', 'group two']);
  //TODO:  should really start as empty, should have both name and id
  const [currGroup, setCurrGroup] = useState(0);

  useEffect(() => {
    const sock = io.connect('http://localhost:5000');
    setSocket(sock);
  }, []);

  const onAddGroup = (g) => {
    setGroups([...groups, g]);
    setCurrGroup(groups.length);
  }

  return (
    <Container>
      <Groups
        groups={groups}
        onAddGroup={onAddGroup}
        onSelectGroup={setCurrGroup}
      />
      <Divider orientation="vertical" flexItem />
      <Conversation group={groups[currGroup]} socket={socket} />
    </Container>
  );
}

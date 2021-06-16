import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Conversation from './Conversation';
import Groups from './Groups';
import User from "./User"
import styled from 'styled-components';
import Divider from '@material-ui/core/Divider';

const Container = styled.div`
  height: 100vh;
  display: flex;
  min-width: 0; 
  min-height: 0;
`;

const GroupHeader = styled.h1`
  margin: 2.5% 200px;
  color: #49A2F4;
`;

export default function Messenger() {
  const [socket, setSocket] = useState(null);
  const [groups, setGroups] = useState([]);
  const [user, setUser] = useState("");
  const [lang, setLang] = useState("");
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

  const onSetUser = (u) => {
    setUser([u]);
  }

  const onSetUserLang = (l) => {
    setLang([l]);
  }

  return (
    <Container>
        {user === "" ? (
        <User
        username={user}
        userLang={lang}
        onSetUser={onSetUser}
        onSetUserLang={onSetUserLang}
        
        />

      ) : (
      <Groups
        groups={groups}
        selectedGrpIdx={currGroup}
        onAddGroup={onAddGroup}
        onSelectGroup={setCurrGroup}
      />)}


      {user === "" ? (
        <></>
      ) : (
      <Divider orientation="vertical" flexItem />
          )}

      {user === "" ? (
        <></>
      ) : (
      <Conversation group={groups[currGroup]} socket={socket}/>
        )}

    </Container>
  );
}

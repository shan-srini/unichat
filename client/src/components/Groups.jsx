import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import styled from 'styled-components';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
const axios = require('axios');

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: 10px 0px;
  height: 100vh;
  min-width: 0;
  min-height: 0;
  width: 40%;
`;
const GroupHeader = styled.h1`
  margin: 10px;
`;
const GroupName = styled(ListItemText)`
  text-align: center;
`;
const ButtonRow = styled.div`
  display: flex;
  width: 90%;
  padding: 10px 20px;
  align-items: center;
  justify-content: space-between;
`;
const StyledButton = styled(Button)`
  width: 48%;
  height: 42px;
`;
const StyledList = styled(List)`
  padding: 0px 16px;
  overflow: auto;
`;
const StyledTextField = styled(TextField)`
  width: 90%;
  margin-top: 16px !important;
  align-self: center;
`;

/**
 * All groups a user is in, and controls to join/create groups
 */
export default function Groups({ groups, selectedGrpIdx, onAddGroup, onSelectGroup, socket, userLang }) {
  const [errMsg, setErrMsg] = useState(null);
  const [inputGroup, setInputGroup] = useState('');

  const joinGroup = () => {
    // TODO: make request to join group
    axios.get(`http://localhost:5000/conversation/${inputGroup}/exists`)
      .then((res) => {
        socket.emit('joinRoom', {conversation_id: inputGroup, language: userLang});
        setInputGroup('');
        onAddGroup(inputGroup); // should really be called w/ POST result
        setErrMsg(null);
      })
      .catch((err) => {
        // error case
        setErrMsg('Group name not found!');
      })
  };

  const createGroup = () => {
    axios
      .post('http://localhost:5000/conversation', { groupId: inputGroup })
      .then(function (response) {
        socket.emit('joinRoom', {conversation_id: inputGroup, language: userLang});
        onAddGroup(inputGroup); // should really be called w/ POST result
        setInputGroup('');
        setErrMsg(null);
      })
      .catch(function (error) {
        setErrMsg('Group name already in use!');
      });
  };

  return (
    <Container>
      <GroupHeader>Groups</GroupHeader>

      <Divider variant="middle" />
      <StyledList component="nav" aria-label="secondary mailbox folders" style={{ padding: '0px 16px' }}>
        {groups.map((g, idx) => (
          <ListItem button divider key={g} selected={selectedGrpIdx === idx} onClick={() => onSelectGroup(idx)}>
            <GroupName primary={g} />
          </ListItem>
        ))}
      </StyledList>

      <StyledTextField
        id="outlined-basic"
        label="Join or Create Group"
        variant="outlined"
        value={inputGroup}
        onChange={(e) => setInputGroup(e.target.value)}
        style={{}}
        error={errMsg}
        helperText={errMsg || 'Enter unique group name'}
      />
      <ButtonRow>
        <StyledButton variant="contained" color="primary" onClick={joinGroup}>
          Join
        </StyledButton>
        <StyledButton variant="contained" color="secondary" onClick={createGroup}>
          Create
        </StyledButton>
      </ButtonRow>
    </Container>
  );
}

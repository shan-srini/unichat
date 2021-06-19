import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import styled from 'styled-components';
import Divider from '@material-ui/core/Divider';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: 10px 0px;
  height: 100vh;
  min-width: 0;
  min-height: 0;
  width: 100%;
`;
const GroupHeader = styled.h1`
  margin: 10px;
`;

const ButtonRow = styled.div`
  display: flex;
  width: 50%;
  padding: 10px 30px;
  align-items: center;
  justify-content: space-between;
`;
const StyledButton = styled(Button)`
  width: 48%;
  height: 42px;
`;

const StyledTextField = styled(TextField)`
  width: 90%;
  margin-top: 16px !important;
  align-self: center;
`;

const StyledSelect = styled.select`
  width: 90%;
  margin-top: 16px !important;
  align-self: center;
  height: 50px;
`;

/**
 * All groups a user is in, and controls to join/create groups
 */
export default function User({ username, userLang, onSetUser, onSetUserLang }) {
  const [errMsg, setErrMsg] = useState(null);
  const [inputName, setInputName] = useState('');
  const [inputLang, setInputLang] = useState('');

  const setUsername = () => {
    onSetUser(inputName);
    setInputName('');
    setErrMsg(null);
    // error case
    // setErrMsg('Username already exists!')
  };

  const setUserLang = () => {
    onSetUserLang(inputLang);
    setInputLang('');
    setErrMsg(null);
    // error case
  };

  const setUser = () => {
    setUsername();
    setUserLang();
  };

  return (
    <Container>
      <GroupHeader>Create User</GroupHeader>

      <Divider variant="middle" />

      <StyledTextField
        id="outlined-basic"
        label="Username"
        variant="outlined"
        value={inputName}
        onChange={(e) => setInputName(e.target.value)}
        style={{}}
        error={errMsg}
        helperText={errMsg || 'Enter unique username'}
      />

      <StyledSelect
        className="form-control margin-bottom-10px"
        onChange={(e) => setInputLang(e.target.value)}
        value={inputLang}
      >
        <option> Enter your Preferred Language: </option>
        <option value={'en'}>Current Browser Language: {navigator.language}</option>
        {/* TODO: use correct lang value */}
        <option value={'en'}>English</option>
        <option value={'zh'}> Chinese </option>
        <option value={'hi'}> Hindi</option>
        <option value={'es'}> Spanish </option>
        <option value={'fr'}> French</option>
      </StyledSelect>

      <ButtonRow>
        <StyledButton variant="contained" color="secondary" onClick={setUser}>
          Create
        </StyledButton>
      </ButtonRow>
    </Container>
  );
}

import styled from 'styled-components';
import Box from '@material-ui/core/Box';

const Container = styled.div`
  margin: 20px;
  text-align: left;
`;
const Nametag = styled(Box)`
  margin: 3px 0px;
  font-weight: 600;
`;
const Text = styled(Box)`
  margin: 0 0 0 10px;
`;

/**
 * A single message in a conversation
 */
export default function Message({ msg, isYours }) {
  return (
    <Container>
      <Nametag component="p" color={isYours ? 'secondary.main' : 'primary.main'}>
        NAME
      </Nametag>
      {/* TODO: extract name from message obj */}
      <Text component="p">{msg}</Text>
    </Container>
  );
}

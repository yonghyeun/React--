import { ReactNode } from 'react';

const Container: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <div>{children}</div>;
};

const Title: React.FC<{ text: string }> = ({ text }) => {
  return <h1>{text}</h1>;
};

function App() {
  return (
    <Container>
      <Title text='안녕하세요~!' />
    </Container>
  );
}

export default App;

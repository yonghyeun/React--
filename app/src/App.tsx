const FirstComponent = ({ content }: { content: string }) => {
  return <h1>{content}</h1>;
};

const SecondComponent = ({ text }: { text: string }) => {
  return <h2>{text}</h2>;
};

const App = () => {
  return (
    <div>
      <FirstComponent content='하이~!' />
      <SecondComponent text='방가루' />
    </div>
  );
};

console.log(App());

export default App;

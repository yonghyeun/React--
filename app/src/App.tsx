import { memo, useEffect, useState } from 'react';

type Props = {
  counter: number;
};

const Component = memo((props: Props) => {
  useEffect(() => {
    console.log('Component has been re-rendered!');
  });

  return <h1>{props.counter}</h1>;
});

type DeepProps = {
  counter: {
    counter: number;
  };
};

const DeepComponent = memo((props: DeepProps) => {
  useEffect(() => {
    console.log('Deep Component has been re-rendered!');
  });

  return <h1>{props.counter.counter}</h1>;
});

function App() {
  const [, setCounter] = useState(0);

  const handleClick = () => {
    setCounter((prev) => prev + 1);
  };

  return (
    <div>
      <Component counter={100} />
      <DeepComponent counter={{ counter: 100 }} />
      <button onClick={handleClick}>+</button>
    </div>
  );
}



export default App;

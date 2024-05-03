import React, { ReactNode, useState } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  // return (
  //   <div>
  //     <h1 style={{ color: 'red' }}>안녕하세요!</h1>
  //   </div>
  // );

  return {
    type: 'div',
    prols: null,
    children: {
      type: 'h1',
      props: { style: { color: 'red' } },
      children: '안녕하세요!',
    },
  };

  // return React.createElement(
  //   'div',
  //   null,
  //   React.createElement('h1', { style: { color: 'red' } }, '안녕하세요!'),
  // );
}

function Form({ children }) {
  return <form>{children}</form>;
}

function Button({ buttonText, color }) {
  return <button style={{ color }}>{buttonText}</button>;
}

function FormArea() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [buttonText, setButtonText] = useState('');

  if (!isSubmitted) {
    return (
      <Form>
        <Button buttonText={buttonText} />
      </Form>
    );
  }
}

export default App;

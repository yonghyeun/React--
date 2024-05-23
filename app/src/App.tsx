import { useState } from 'react';

const makeInitalValue = () => {
  console.log('나 실행됨!');
  return 0;
};

const App = () => {
  const [state, setState] = useState<number>(makeInitalValue());

  return (
    <div>
      <h1>{state}</h1>
      <button
        onClick={() => {
          setState(state + 1);
        }}
      >
        Click Me !
      </button>
    </div>
  );
};

export default App;

// 컴포넌트의 state 값은 어디에서 받는가 ?
// 우리의 생각
// useState(..)
// 맨 처음엔 initalValue 를 뱉고
// 리렌더링 때는 변경된 state 를 그냥 받는구나 <- 이 변경된 state 는 어디에 저장되는데 ?

const fiberNode = {
  type: App,
  memoizedState: {
    state: 0, // Initial state value from `makeInitialValue`
    queue: { pending: null }, // Queue of state updates
    next: null, // Next hook in the list (if there are more hooks)
  },
  // Other properties of the fiber node
};

// State update
fiberNode.memoizedState.queue.pending = {
  action: counter + 1, // Direct new state value
  next: null,
};

let newState = fiberNode.memoizedState.state; // Start with the current state
let update = fiberNode.memoizedState.queue.pending; // Get the pending update

// Process the update queue
while (update) {
  if (typeof update.action === 'function') {
    newState = update.action(newState); // Functional update
  } else {
    newState = update.action; // Direct value update
  }
  update = update.next;
}

// Update the state in the fiber node
fiberNode.memoizedState.state = newState;
fiberNode.memoizedState.queue.pending = null; // Clear the queue after processing

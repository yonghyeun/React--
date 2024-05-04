# `Recap`

---

이전 `docs` 에서 반환하는 값이 `JSX` 로 표현된 컴포넌트의 경우

`Babel` 의 경우 `React.createElement` 로 컴파일 되어 `React.Element` 객체를 생성한다는 내용을 배웠다.

예를 들어

```tsx
<Container>
  <Title text='Hello~!' />
</Container>
```

다음과 같은 `JSX` 문법은

```tsx
React.createElement(
  Container,
  null,
  React.createElement(Title, { text: 'Hello~!' }),
);
```

다음과 같이 컴파일 되며

`React.createElement` 함수들의 호출값으로 반환된 `Reac된.Element` 객체는 다음과 같은 모습이라 하였다.

```tsx
{
  "type": Container,
  "props": {
    "children": {
      "type": Title,
      "props": {
        "text": "Hello~!",
        "children": null
      },
      "key": null,
      "ref": null
    }
  },
  "key": null,
  "ref": null
}
```

그럼 이번엔 리액트 공식문서를 통해 `React.Element` 와 `React.createElement` 내부 코드를 살펴보자

---

# `React.createElement`

---

https://github.com/yonghyeun/react/blob/main/packages/react/src/jsx/ReactJSXElement.js

`React.createElement` 함수를 살펴보면 다음과 같다.

매우 긴 코드이기 때문에 하나씩 나눠 살펴보도록 하자

> 다만 개발 환경에서만 필요한 코드이거나
> 전체 흐름을 파악하는데 불필요한 경우 // 생략으로 표기하거나, 임의로 제거한 부분도 존재한다.

### `React.createElement` - `type` 설정

---

```jsx
export function createElement(type, config, children) {
  if (__DEV__) {
    if (!isValidElementType(type)) { // 올바르지 않은 타입의 경우 오류를 발생 시킨다.
    ... // 생략
    }
    else { // 인수로 들어온 type 이 올바른 타입이라면 `children` 에 존재하는
           // Element들의 `type` 들을 검사한다.
      for (let i = 2; i < arguments.length; i++) { // arguments 의 2번째 인덱스부턴 children
        validateChildKeys(arguments[i], type);
      }
    }
  }
  ...
```

`isValidElementType` 과 `validateChildKeys` 함수는 동일한 파일인 `ReactJSXElement` 내부에 정의되어 있다.

`ElementType` 이 적합한지는 다른 파일에 `Symbol` 객체로 생성해둔 여러 `React.ElementType` 들에 대해 올바른지 검정한다.

### `React.createElement` - `props` 생성

---

```jsx
export function createElement(type, config, children) {
  ...
  let propName;
  const props = {};

  let key = null;
  let ref = null;

  if (config != null) {
    if (__DEV__) {
      // 생략
    }
    if (hasValidRef(config)) {
      //  생략
      //  enableRefAsProps , disalbeStringRefs 는 기본 설정으로 true 로 되어있는 boolean 값이다.
      //  만약 기본 설정을 변경한 특수한 경우에 대한 처리인데
      //  특수한 상황을 제외하고 생각하도록 하자
      if (!enableRefAsProp) {
        ...
    }

      if (__DEV__ && !disableStringRefs) {
        ...
    }
    if (hasValidKey(config)) {
      // config 객체 내부의 key 가 유효하다면
      key = '' + config.key;
    }

    for (propName in config) {
      if (
        hasOwnProperty.call(config, propName) &&
        propName !== 'key' &&
        (enableRefAsProp || propName !== 'ref') &&
        propName !== '__self' &&
        propName !== '__source'
      ) {
        // key 와 ref 를 제외한 config 의 프로퍼티들을 props 라는 객체에 담아주도록 한다.
        // config 내부의 key , ref 는 지역 변수 key , ref 에 할당되어 있는 상태
        props[propName] = config[propName];
      }
    }
  }
```

`React.createElement` 의 두 번째 인수로 전달하는 `config` 에서 `key , ref` 는 지역 변수로 저장하고

나머지 프로퍼티들은 `props` 객체 내부에 저장해주는 모습을 볼 수 있다.

### `React.crateElement` - `children` 배열 생성

---

```jsx
export function createElement(type, config, children) {
  ...
  const childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    //  children 객체가 하나라면 props.children 에 할당
    props.children = children;
  } else if (childrenLength > 1) {
    // children 이 2개 이상이라면  배열에 children 들을 담아주고 `
    const childArray = Array(childrenLength);
    for (let i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    // props.chdilren 에 배열을 할당한다.
    props.children = childArray;
  }
```

### `React.createElement` - `default Props` 처리

---

```jsx
 ...
// Resolve default props
if (type && type.defaultProps) {
  // 만약 type 이 React.element 이면서 설정되어 있는 props 가 있다면
  const defaultProps = type.defaultProps;
  for (propName in defaultProps) {
    // 그리고 새로 생성되는 React.Element Props 에 해당 props 가 없다면
    if (props[propName] === undefined) {
      // defaultProps 를 새로 생성되는 React.Element Props 에 할당
      props[propName] = defaultProps[propName];
    }
  }
}
```

위 코드는 다음과 같이 `type` 인수로 들어온 `React.Element` 의 `props` 가 정적으로 이미 할당되어 있는 경우

새로 생성되는 `React.Element` 의 `props` 에 해당 `props` 가 없는 경우 `props` 를 새로 생성해주는 뢱을 의미한다.

다음과 같은 경우를 생각하면 좋다.

```jsx
function MyComponent(props) {
  return <div>{props.text}</div>;
}

MyComponent.defaultProps = {
  text: 'Hello, world!',
};

// props.text는 'Hello, world!'가 됩니다.
const element = React.createElement(MyComponent);
```

### `React.createElement` - `React.Element` 생성

---

```jsx
export function createElement(type, config, children) {
  ...
  const element = ReactElement(
    type,
    key,
    ref,
    undefined,
    undefined,
    getOwner(),
    props,
  );

  if (type === REACT_FRAGMENT_TYPE) {
    validateFragmentProps(element);
  }

  return element;
}
```

위의 일련의 과정을 통해 `key , ref , props` 객체를 생성해주었다면

`ReactElement` 함수를 호출하여 `element` 객체를 생성하고 생성된 `element` 객체를 반환한다.

# `ReactElement` 함수

---

`ReactElement` 는 `ReactElement` 객체를 생성하는 함수로

함수 내부에 여러 조건에 따라 조금씩 다르게 객체를 생성하지만 하는 역할은 결국 자바스크립트 객체를 반환하는 함수이다.

```jsx
function ReactElement(type, key, _ref, self, source, owner, props) {
  let ref;
  if (enableRefAsProp) {
    const refProp = props.ref;
    ref = refProp !== undefined ? refProp : null;
  } else {
    ref = _ref;
  }

    //  ... 여러 부분 생략
  element = {
      $$typeof: REACT_ELEMENT_TYPE, // Symbol 객체
      type,
      key,
      ref,
      props,
    };
  }

  return element;
}
```

`ReactElement` 는 여러 인수들을 받아 `element` 객체를 생성한다.

이렇게 생성된 `React.Element` 객체들은

상태값을 저장하는 자료구조 혹은 본인의 부모 , 형제 , 자식 노드들과 같이

`Virtual DOM` 을 `reconciliaton` 하는 과정에서 도움을 줄 수 있는 다양한 정보가 담긴 인스턴스인

`Fiber node` 로 변경된 후 `Virtaul DOM` 을 생성하고 , `Actual DOM` 에 마운팅 되는 과정을 거친다.

다음 게시글부턴 `Fiber Node` 에 대해 공부하도록 한다.

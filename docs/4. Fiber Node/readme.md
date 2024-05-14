# `Fiber` 란

이전 `docs` 에서 리액트에서 `JSX` 는 `Babel` 을 통해

`createElement` 메소드로 변경해 `ReactElement` 를 생성한다는 것을 배웠다.

이렇게 생성된 `ReactElement` 들은 `type ,key , props` 등에 대한 정보를 담고 있지만

여전히 충분한 정보를 가지고 있지 않다.

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

# 공부 동기

---

리액트를 배운지 3달 정도가 되었고

그 중 몇가지 훅들을 이용한 토이프로젝트들도 생성해봤다.

그럼에도 불구하고 , 내가 리액트를 잘 알고 있는가 ? 라는 물음에

내가 자신있게 답 할 수 있나라는 의문이 들었다.

자신있게 답을 못하는 이유는 내가 `React` 가 어떻게 돌아가는지에 대해서

완벽하게 이해하고 있는 것이 아니라 아주 얕게 알고 있기 때문이라는 결론이 들어

리액트가 어떻게 동작하는지에 대해 좀 더 면밀히 살펴보기로 하였다.

때 마침 아주 좋은 유튜브 시리즈가 있어서 해당 시리즈와 , 여러 문서들을 읽어보려 한다.

> 주로 참고한 유튜브 시리즈는 리액트 톺아보기 시리즈이다.
> https://www.youtube.com/watch?v=9OjyQ2rB0zg&list=PLpq56DBY9U2B6gAZIbiIami_cLBhpHYCA&index=4

# `React` 에서 사용하는 `Virtual DOM` 에 대한 간략한 정의

리액트에서 정의하는 `Virtual DOM` 은 다음의 정의는 다음과 같다.

> The virtual DOM (VDOM) is a programming concept where an ideal, or “virtual”, representation of a UI is kept in memory and synced with the “real” DOM by a library such as ReactDOM. This process is called reconciliation.
>
> https://legacy.reactjs.org/docs/faq-internals.html

`UI` 를 구성하는 `Actual DOM` 의 모습을 모방하여 메모리에 저장되는 객체를 의미하며

`Virtual DOM` 은 **`reconciliation` 이라는 과정을 거쳐 `Actual DOM` 과 동기화** 한다.

`Virtual DOM` 은 `React element` 와 관련되어 있으며

`Virtual DOM` 은 `Virtual DOM` 의 정보를 담고 있는 `internal objects` 인 `fibers` 를 이용하여 작동한다.

_좀 더 각 내용들에 대한 자세한 정의는 추후 설명하도록 한다._

# `Actual DOM` 을 조작하여 컴포넌트를 만드는 예시

---

`React` 와 같이 `Virtual DOM` 을 사용하기 전 , `Actual DOM` 을 조작하는 예시를 들어 `Actual DOM` 을 사용 할 때의 불편함을 알아보자

전통적인 `UI` 모델에서는 `UI` 를 구성하는 컴포넌트를 만들 때

직접적으로 `Actual DOM` 을 조작하도록 설계되었다.

```jsx
class Form extends TraditionalObjectOrientedView {
  render() {
    // Read some data passed to the view
    const { isSubmitted, buttonText } = this.attrs;

    if (!isSubmitted && !this.button) {
      // Form is not yet submitted. Create the button!
      this.button = new Button({
        children: buttonText,
        color: 'blue',
      });
      this.el.appendChild(this.button.el);
    }

    if (this.button) {
      // The button is visible. Update its text!
      this.button.attrs.children = buttonText;
      this.button.render();
    }

    if (isSubmitted && this.button) {
      // Form was submitted. Destroy the button!
      this.el.removeChild(this.button.el);
      this.button.destroy();
    }

    if (isSubmitted && !this.message) {
      // Form was submitted. Show the success message!
      this.message = new Message({ text: 'Success!' });
      this.el.appendChild(this.message.el);
    }
  }
}
```

전통적인 `UI` 모델에서 `Form` 컴포넌트를 렌더링 하는 로직을 담은 슈도 코드이다.

전통적인 `UI` 모델에서는 `Class` 를 이용하여 컴포넌트를 정의하고

컴포넌트를 생성 할 때는 `new` 연산자를 이용해 메모리에 담을 인스턴스 생성과 동시에 `Actual DOM` 에 추가한다.

컴포넌트를 변경 할 때엔 생성해둔 인스턴스를 변경함과 동시에 `Actual DOM` 을 조작하는 모습을 볼 수 있다.

해당 전통적인 모델이 가지는 몇 가지 문제가 존재하는데 이는 다음과 같다.

## `Traditional UI Model` 의 문제점

---

### 성능 저하 문제

---

`DOM` 을 조작하는 행위는 비용이 많이 드는 작업이다.

`Actual DOM` 에서 변경이 일어나면 브라우저는 `paint -> layout -> render` 등 여러 계산을 유발한다.

전통적인 `UI model` 에서는 컴포넌트 (인스턴스) 의 변화가 있을 때 마다 매번 `Actual DOM` 을 조작하도록 설계되어 있기 때문에

서로 관련이 되어있는 컴포넌트에는 `N` 번의 변경이 일어나게 된다면 `N` 번의 `Actual DOM` 조작이 일어난다.

> 예를 들어 `Form` 컴포넌트에서 제출 이벤트가 발생하면
> `Form` 컴포넌트에선 `loading` 중이란 문구가 뜨고
> `Form` 컴포넌트 내부의 버튼은 `OK` 라고 글자가 바뀌도록 설계했다고 생각해보자
>
> 전통적인 모델에선 `Actual DOM` 를 `loading` 이란 문구가 뜨도록 조작하고
> 이후 `OK` 라는 글자가 뜨도록 한 번 더 `Actual DOM` 조작이 일어날 것이다.

### 비효율적인 업데이트

---

```jsx
...
if (isSubmitted && this.button) {
  // Form was submitted. Destroy the button!
  this.el.removeChild(this.button.el);  // actualDOM 조작
  this.button.destroy(); // 메모리에 존재하는 정보 조작
}
```

위 코드에서 볼 수 있듯 `Actual DOM` 에서 `button` 을 제거하기 위해

`Actual DOM` 조작과 , 메모리에서 기억되는 컴포넌트 (인스턴스) 에서도 해당 내용을 동기화 시켜주기 위해

중복적인 동작이 두 번 정의 된 모습을 볼 수 있다.

### 유지보수의 어려움

---

전통적인 `UI` 모델에서는 상태 변화에 따른 `Actual DOM` 과 메모리 내에 존재하는 컴포넌트를 모두 업데이트 해줘야 했다.

이는 상태 관리를 어렵게 할 뿐더러

서로 종속성이 존재하는 컴포넌트들이 존재 할 경우 메모리 내에서 각 컴포넌트 내의 예기치 못한 충돌로 인해

`Actual DOM` 의 모습과 다르도록 예기치 못한 문제가 발생 할 수 있다.

또한 중복된 로직의 코드로 가독성이 떨어지는 것은 덤이다.

### 재사용성 저하

---

또 각 컴포넌트들은 본인이 정의된 클래스 내부에서 , 상태 변화에 따른 동작이 이미 정해져있기 때문에

다른 컴포넌트에서 사용하는 것이 불가능하다.

```jsx
if (isSubmitted && !this.message) {
  // Form was submitted. Show the success message!
  this.message = new Message({ text: 'Success!' });
  this.el.appendChild(this.message.el);
}
```

위 컴포너트의 일부 로직인데, 만약 `Form` 컴포넌트가 다른 곳에서 사용 될 때

`message` 가 `Success` 가 아니라 다른 문구를 사용하고 싶다면

해당 컴포넌트를 새롭게 정의한 채로 생성해야 할 것이다.

이미 동작이 컴포넌트 내부에 모두 정의되어 있기 때문이다.

## `Tranditional UI Model` 의 문제 요약

요약해서 이야기해보자면

`Tranditinal UI model` 은 `Actual DOM` 의 `Node` 역할을 할 컴포넌트를 메모리 상에 만들어두고

해당 노드가 `Actual DOM` 에서 일어날 모든 일들을 **노드 내부 동작 방식에 모두 정의해두는 형식으로 사용** 되었다.

이로 인해 컴포넌트의 동작이 정의되는 형태로만 일어나도록 하여 **확장성이 매우 낮았으며**

컴포넌트의 변화가 `Actual DOM` 에서의 변화와 동기화 되기 위해

컴포넌트의 변화가 일어나면 매번 `Actual DOM` 을 조작하도록 설계되어

매번 변화가 일어날 때 마다 값 비싼 동작인 `Actual DOM` 조작이 필연적으로 일어났다.

# `React` 의 `Virtual DOM` 은 이 문제를 어떻게 해결했는가

---

### 컴포넌트의 변화마다 `Actual DOM` 조작이 일어났던 경우

`Traditional UI model` 은 컴포넌트가 `Actual DOM` 에 영향을 직접적으로 미치도록 설계되어 있기 때문에

개별 컴포넌트의 변화마다 `Actual DOM` 의 조작이 일어나야 했다.

이에 `React` 에서는 컴포넌트의 변화가 `Actual DOM` 에 직접적으로 영향을 미치는 것이 아니라

메모리에 존재하는 `Virtual DOM` 을 생성해 `Virtual DOM` 자체간의 차이를 계산하여

차이가 나는 부분만 일괄적으로 `Actual DOM` 을 한 번에 조작하도록 변경하였다.

10개의 개별적인 컴포넌트들의 변화가 있을 때

`Tranditional UI model` 은 10번의 `Actual DOM` 조작이 있었다면

`React` 는 10개의 컴포넌트 변화가 있을 때 `Virtual DOM` 을 생성하고

> `Virtual DOM` 을 생성하는 행위 자체는 그저 단순히 자바스크립트 객체를 생성하는 단계라 더욱 빠르다.

이전 `Virtual DOM` 과의 차이를 비교하여 차이가 나는 부분만 일괄적으로 모아 단 번에 `Actual DOM` 을 조작하였다.

### 코드의 가독성 문제 : 명령형에서 선언형으로

```jsx
class Form extends TraditionalObjectOrientedView {
  render() {
    const { isSubmitted, buttonText } = this.attrs;

    if (!isSubmitted && !this.button) {
      // 1. 제출되지 않고 버튼이 존재하지 않는다면
      this.button = new Button({ // 2. 버튼 컴포넌트를 만들고
        children: buttonText,
        color: 'blue',
      });
      this.el.appendChild(this.button.el); // 3. Actual DOM 에 추가해라
    }

    if (this.button) {
      // The button is visible. Update its text!
      this.button.attrs.children = buttonText;
      this.button.render();
    }
  ...
```

다음과 같이 컴포넌트들의 동작을 명령형으로 컴포넌트 내부에 모두 정의해두는 방식에서

컴포넌트들의 동작을 컨트롤 하는 라이브러리를 정의해두고

컴포넌트들은 상태에 따른 모습을 렌더링 하도록 선언해두는 방식으로 변경되었다.

```jsx
function Form({ children }) {
  return <form>{children}</form>;
}

function Button({ buttonText, color }) {
  return <button style={{ color }}>{buttonText}</button>;
}
```

미리 컴포넌트들의 모습을 선언해둔 후

```jsx
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
  ...
}
```

컴포넌트들의 상태에 따라 다른 컴포넌트들의 조합을 반환하도록 설계해둔다.

이 반환 값들은 `Actual DOM` 에 영향을 미치는 것이 아닌

`React` 의 `Virtual DOM` 을 조작하고

`Actual DOM` 조작은 `React` 에서 설계해둔 외부 라이브러리가 알아서 하도록 한다.

이로 인해 우리의 코드에서는 `Actual DOM` 을 조작하는 로직을 신경 쓸 필요가 없어 코드가 더욱 간결해질 수 있다.

`Actual DOM` 을 조작하는 명령적인 로직인 라이브러리에서 책임지게 하였고

컴포넌트의 생김새를 각 컴포넌트들을 조작하는 것이 아닌 ,

미리 선언해둔 컴포넌트들을 배치시키는 선언형을 통해 코드를 더욱 간결하게 유지시켰다.

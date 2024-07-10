import logo from './logo.svg';
import React from 'react';
import './App.css';
import Title from './components/Title'; // 컴포넌트 분리 맛보기
// . 뜻 : 동일 폴더

const jsonLocalStorage = {
          setItem: (key, value) => {
            localStorage.setItem(key, JSON.stringify(value));
          },
          getItem: (key) => {
            return JSON.parse(localStorage.getItem(key));
          },
        };

        // 네트워크 요청(api) 받아오는 api
        const fetchCat = async (text) => {
            const OPEN_API_DOMAIN = "https://cataas.com";
            const response = await fetch(`${OPEN_API_DOMAIN}/cat/says/${text}?json=true`);
            const responseJson = await response.json();
            return `${OPEN_API_DOMAIN}/cat/${responseJson._id}/says/${text}`; // NOTE: API 스펙 변경으로 강의 영상과 다른 URL로 변경했습니다.
          };

      

      const Form = ({ updateMainCat }) => {
        const includesHangul = (text) => /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/i.test(text);
        const [value, setValue] = React.useState('');
        const [errorMessage, setErrorMessage] = React.useState('');

        function handleInputChange(e) {
          const userValue = e.target.value;

          setErrorMessage(""); // 초기값을 이걸로 시작해서, else구문 스킵하기
          if (includesHangul(userValue)) {
            setErrorMessage("한글은 입력할 수 없습니다.");
          }
          setValue(userValue.toUpperCase());
          // 이벤트의 target의 밸류값이 찍힘
        }

        function handleFormSubmit(e) {
          e.preventDefault();
          setErrorMessage(""); // 초기값을 이걸로 시작해서, else구문 스킵하기

          if (value == "") {
            setErrorMessage("빈 값으로 만들 수 없습니다.");
            return; // 에러가 떴는데 업데이트를 하면 안됨. 함수가 여기서 끝나야만 하기에 추가
          }
          updateMainCat(value);
        }

        // form 태그의 onSubmit 인자에 event가 처음으로 들어오고 그 event를 preventDefault()가 1초 지난후 사라지는 것을 막아줌
        return (
          <form onSubmit={handleFormSubmit}>
            <input
              type="text"
              name="name"
              placeholder="영어 대사를 입력해주세요" 
              value={value} // 입력 창에 해당 프로퍼티가 계속 박혀있음
              onChange={handleInputChange} // input에 값이 바뀔때마다 함수를 부르는 내장 API
              />
            <button type="submit">생성</button>
            <p style={{color: "red"}}>{errorMessage}</p> //
          </form>
        );
      };

      function CatItem(props) {
        console.log(props);
          return (
            <li>
              {props.title}
              <img src={props.img} style={{width: "150px"}}/> 
            </li>
          );
        }

     

      function Favorites({favorites}) {
        if (favorites.length == 0) {
          return <div>사진 위 하트를 눌러 고양이 사진을 저장해봐요!</div>;
        }

        return (
          <ul className="favorites">
            {favorites.map(cat => ( // map은 배열을 순회하는 api
              <CatItem img={cat} key= {cat}/> // key값이 있어야 배열값을 잘 구분해서 화면에 잘 나타낼 수 있음
            ))}
          </ul>
        );
      }

      const Maincard = ({ img, onHeartClick, alreadyFavorite }) => {
        const heartIcon = alreadyFavorite ? "💖" : "🤍";
        return (
          <div className="main-card">
            <img
              src= {img} alt="고양이" width="400" />
            <button 
              onClick={onHeartClick}
            >{heartIcon}</button>
          </div>
        );
      }
 
      // 상태 끌어올리기 - 부모 컴포넌트에서 저으이하고 자식 컴포넌트에서 사용
      const App = () => {
        const CAT1 = "https://cataas.com/cat/HSENVDU4ZMqy7KQ0/says/react";
        const CAT2 = "https://cataas.com/cat/BxqL2EjFmtxDkAm2/says/inflearn";
        const CAT3 = "https://cataas.com/cat/18MD6byVC1yKGpXp/says/JavaScript";

        // React.useState(); : 상태의 초기값을 설정하는 함수
        const [counter, setCounter] = React.useState(() => { 
          return jsonLocalStorage.getItem('counter'); // localStorage의 value는 string 타입으로 저장되므로 우리가 쓸땐 필요시 타입 변환이 필요
        }); // 처음 앱 실행할 때 한번만 접근하도록 초기화
        // const counter = counterState[0];
        // const setCounter = counterState[1];
        // console.log("카운터", counter);

        const [mainCat, setMainCat] = React.useState(CAT1);
        const [favorites, setFavorites] = React.useState(() => {
          return jsonLocalStorage.getItem('favorites') || []; // null exception 처리: null이면 빈 배열로 처리
        });

        const alreadyFavorite = favorites.includes(mainCat);
        // JS 배열에 내장되어 있는 API, 배열 value 중 mainCat에 해당하는 값이 있는지 반환

        async function setInitialCat() {
          const newCat = await fetchCat('First cat');
          console.log(newCat);
          setMainCat(newCat);
        }

        React.useEffect(() => {
          setInitialCat();
        }, []); // [] -> 
        // setInitialCat(); - 이렇게 호출하면 영원히 호출함

        async function updateMainCat(value) {
          const newCat = await fetchCat(value);
          setMainCat(newCat); // api 콜에서 받은 응답값으로 세팅
          const nextCounter = counter + 1;
          
          // prev : 기존 값, 생성 연타했을 때, counter와 setCounter가 가르키는 값이 달라서 발생하는 문제 해결
          setCounter((prev) => {
            const nextCounter = prev + 1;
            jsonLocalStorage.setItem("counter", nextCounter);
            return nextCounter;
          });
        }

        function handleHeartClick() {
          const nextFavorites = [...favorites, mainCat];
          setFavorites(nextFavorites); // JS 문법 : ...변수명 - 변수 안의 value값들을 자동 나열
          // == setFavorites([CAT1, CAT2, CAT3]);
          jsonLocalStorage.setItem('favorites', nextFavorites);
        }

        const counterTitle = counter == null ? "" : counter + "번째 ";

        return (
          <div>
            <Title>{counterTitle}고양이 가라사대</Title>
            <Form updateMainCat={updateMainCat}/>
            <Maincard img={mainCat} onHeartClick={handleHeartClick} alreadyFavorite = {alreadyFavorite}/>
            <Favorites favorites={favorites}/>
          </div>
        )
      }

export default App;
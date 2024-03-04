import React, { useEffect, useState } from 'react';
import Cookies from 'universal-cookie';
import "../styles/ChessBoard.css"
import Chess from '../ChessLibrary';
import Menu from "../components/Menu"
let chess; 
const cookies = new Cookies();
let i = 0;


function addEvents(color){  
  let placement={
    0:"r",
    1:"n",
    2:"b",
    3:"q",
    4:"k",
    5:"b",
    6:"n",
    7:"r",
    8:"p"
  }

  // слага се евент лисънър за полетата без фигури
  for(let i = 2; i < 6; i++){
    for(let j = 0; j < 8; j++){
      let empty_square=document.getElementById(`e${i}${j}`)
      empty_square.addEventListener("click",()=>{
        chess.emptySpace(empty_square)
      })
    }
  }

  // слагане на евент лисънъри за противниковите пешки и фигури.
  for(let i = 0; i<8; i++){
    let enemyColor = "w"
    if(color == "w")
      enemyColor = "b"
    
    let enemyPawn = document.getElementById(`${enemyColor}p${i}`)
    enemyPawn.addEventListener("click",()=>{
      chess.emptySpace(enemyPawn)
    })

    let enemyPiece = document.getElementById(`${enemyColor}${placement[i]}${i}`)
    enemyPiece.addEventListener("click", ()=>{
      chess.emptySpace(enemyPiece)
    })
  }

  for(let j = 0; j < 8; j++){
    //слагане на евент лисънъри за собствените пешки и фигури  
    
    //фигури
    let id = `${color}${placement[j]}${j}`
    let piece = document.getElementById(id)
    chess.addEventListenerToPieces(piece,placement[j])
    
    //пешки
    document.getElementById(`${color}p${j}`).addEventListener("click",()=>{
      chess.PawnMove(`${color}p${j}`); 
    })
  }
}

const color = localStorage.getItem("color")

function surrender(){
  console.log("predaam sa")
}

function draw(){
  console.log("remi")
}

let counter = 60

const ChessBoard = () => {
  const [pieces, setPieces] = useState([]);
  const [board, setBoard] = useState([]);
  const [minutes, setMinutes] = useState(15);
  const [seconds, setSeconds] = useState(0);
  const [enemyMinutes,setEnemyMinutes] = useState(15);
  const [enemySeconds, setEnemySeconds] = useState(0);

  useEffect(() => {
    const intervalID = setInterval(decreaseTime, 1000);
  }, []);

  function decreaseTime() {
    
      setMinutes(currentMinutes => {
        let mins = currentMinutes
        setSeconds(currentSeconds =>{
          let totalTime = mins * 60 + currentSeconds - 1
          return totalTime % 60 
        })

        if(counter == 60){
          counter = 0
          return currentMinutes-1
        }

        counter++ 

        return currentMinutes
      });
  }

  useEffect(()=>{
    //оказва къде се намира ws сървърът
    const ws = new WebSocket('ws://localhost:3002')
    chess = new Chess(ws)

    //установява връзка с ws сървър като задава основните параметри на играча
    ws.onopen = ()=>{
      let initialMessage={
        type:"initial",
        color:color,
        game_id:localStorage.getItem("game_id")
      }
      ws.send(JSON.stringify(initialMessage))
    }

    //главна функция, която обработва преместването на фигури по дъската
    ws.onmessage = (message) => {
      //съхраняване на основна информация за заявките, които се пращат
      let parsedMessage = JSON.parse(message.data)
      let type = parsedMessage["type"]
      let piece = document.getElementById(parsedMessage["pieceMoved"])

      if(type == "connection"){
        let checkedPlaces = chess.checkedPlaces(color)
        localStorage.setItem("checkedPlaces",checkedPlaces)
      }

      //съхранява кординати, свързани с фигурата, която се мести
      let currentCords = parsedMessage["currentCords"]
      let destinationCords = parsedMessage["destinationCords"]
      let destination_square = document.getElementsByClassName(destinationCords)[0] 
      
      // обработва обикновени ходове като местене и взимане на фигура
      if(type === "move"){
        //премества визуално фигурата
        chess.swapPlaces(destination_square,piece)

        //дава статут на поле, на което може да бъде преместена фигура
        destination_square = chess.removeAllEventListeners(destination_square)
        destination_square.addEventListener("click",()=>{
          chess.emptySpace(destination_square)
        })

        //проверява дали пешка може да бъде взета ан пасан
        if(currentCords[0] == "1" && destinationCords[0] == "3" && destination_square.classList[3] == "wp"){
          destination_square.setAttribute("ep","true")
        }
        if(currentCords[0] == "6" && destinationCords[0] == "4" && destination_square.classList[3] == "bp"){
          destination_square.setAttribute("ep","true")
        }

        let checkedPlaces = chess.checkedPlaces(color)
        localStorage.setItem("checkedPlaces",checkedPlaces)
      }

      // обработва специфично ан пасан ходове
      if(type == "ep"){
        //събира основна информация за хода
        let enPassantCords = parsedMessage["enPassantCords"]
        let requestColor = parsedMessage["color"]
        let enemyColorPawn = chess.getEnemyColor(requestColor) + "p"

        //определя коя фигура трябва да се премести и коя да се премахне
        let piece = document.getElementById(parsedMessage["pieceMoved"])
        let enPassantSquare = document.getElementsByClassName(enPassantCords)[0]

        //премахва пешката взета ан пасан
        chess.enPassant(enPassantSquare,enemyColorPawn)

        //премества фигурата и я прави достъпна за взимане от другите фигури
        chess.swapPlaces(destination_square,piece)
        destination_square.addEventListener("click",() => {
          chess.emptySpace(destination_square)
        })
      }

      //запазва id-то на връзката за да има достъп до сървъра
      if(type === "connection"){
        localStorage.setItem("connection",parsedMessage["ws"])
      }
    }

    //приготвя игралното поле
    setBoard(chess.makeGrid())
    setPieces(chess.renderPieces(color))
    
    //премахва данни, които евентуално може да са останали от минала партия
    localStorage.removeItem("checked")
    localStorage.removeItem("checkedPlaces")
    localStorage.removeItem("checkingPiece")
    localStorage.removeItem("lastPiece");
    localStorage.removeItem("possibleMoves")
  },[])

  useEffect(()=>{
    i++
    if(i == 2){
      //добавя всички нужни евент лисънъри
      addEvents(color)
    }
  })

  return (
    <div id="container-chessboard">
      <Menu/>
      <div className="grid-container">
        <div class="grid grid1">      
        {pieces}
        </div>
        <div class="grid grid2">
          {board}
        </div>
        <div className = 'timer-container'>
          <div className = 'enemy-timer'>{enemyMinutes}</div>
          <div className = 'own-timer'>{minutes}:{seconds}</div> 
        </div>
      </div>
      
      


      <div></div>
      <div></div>

    </div>
  );    
}
export default ChessBoard;



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


class Chess{
  //запазва връзката, която е дадена в началото 
  constructor(ws) {
    this.ws = ws;
  }

  findKing(color){
    let king = document.getElementById(`${color}k4`)

    if(king == null){
      king = document.getElementById(`${color}k4n`)
    }

    return king
  }

  getEnemyColor(color){
    if(color == "w"){
      return "b"
    }
    return "w"
  }

  removeAllEventListeners(element) {
    const clone = element.cloneNode(true); //прави точен клонинг на предоставения елемент
    element.replaceWith(clone); // заменя стария елемент с новия клонинг, който няма евент лисънър
    return clone;
  }

  getPieceColor(piece){
    if(piece.classList[3] === "empty"){
      return "empty"
    }
    // видът на фигурата винаги се пази във формат цвят фигура номер (пример wr0) и е на 4 позиция в масива.
    return piece.id[0]
  }

  getPieceCords(piece){
    let location = piece.classList[0]
    // кординатите са във формат xy
    return [parseInt(location[0]) , parseInt(location[1])]
  }
  
  getNewEmptyId(){
    for(let i = 0; i < 100; i++){
      if(document.getElementById(`e${i}`) == undefined){
        return `e${i}`
      }
    }
  }

  PawnMove(pawnID){
    //намира пешката, която е кликната и запазва кординатите й в променливи
    let pawn = document.getElementById(pawnID)
    
    let color = pawn.id[0]
    let x = this.getPieceCords(pawn)[0]
    let y = this.getPieceCords(pawn)[1]
    let possibleMoves = [];
    let possibleForChecks = [];

    let left; // ляво поле което може да бъде взето
    let right;

    //проверява дали е първи ход на пешката и добавя възможните ходове напред към масив
    if(color === "w"){

      if(x === 1){
        for(let i = 1; i < 3; i++){
          if(document.getElementsByClassName(`${x+i}${y}`)[0].id[0] === "e"){
            possibleMoves.push(`${x+i}${y}`)
          }
        }
      }

      else if(x !== 1){
        if(document.getElementsByClassName(`${x+1}${y}`)[0].id[0] === "e"){
          possibleMoves.push(`${x+1}${y}`)
        }
      }

      //проверка за възможен ан пасан
      if(x == 4){
        //полетата в ляво и дясно от избраната пешка
        let left = document.getElementsByClassName(`${x}${y+1}`)[0]
        let right = document.getElementsByClassName(`${x}${y-1}`)[0]

        //проверка дали пешките, които евентуално са открити имат пропърти true
        if(this.getPieceColor(left) === "b" && left.getAttribute("ep") == "true"){
          possibleMoves.push(`${x+1}${y+1}`)
        }
        else if(this.getPieceColor(right) === "b" && right.getAttribute("ep") == "true"){
          possibleMoves.push(`${x+1}${y-1}`)
        }
      }

      left = document.getElementsByClassName(`${x+1}${y-1}`)[0] // ляво поле което може да бъде взето
      right = document.getElementsByClassName(`${x+1}${y+1}`)[0] 
    }

    else if(color == "b"){
      if(x === 6){
        for(let i = 1; i < 3; i++){
          if(document.getElementsByClassName(`${x-i}${y}`)[0].id[0] === "e"){
            possibleMoves.push(`${x-i}${y}`)
          }
        }
      }

      else if(x !== 6){
        if(document.getElementsByClassName(`${x-1}${y}`)[0].id[0] === "e"){
          possibleMoves.push(`${x-1}${y}`)
        }
      }

      if(x == 3){
        let left = document.getElementsByClassName(`${x}${y+1}`)[0]
        let right = document.getElementsByClassName(`${x}${y-1}`)[0]
        
        if(this.getPieceColor(left) === "w" && left.getAttribute("ep") === "true"){
          possibleMoves.push(`${x-1}${y+1}`)
        }
        else if(this.getPieceColor(right) === "w" && right.getAttribute("ep") === "true"){
          possibleMoves.push(`${x-1}${y-1}`)
        }
      }

      left = document.getElementsByClassName(`${x-1}${y+1}`)[0] // ляво поле което може да бъде взето
      right = document.getElementsByClassName(`${x-1}${y-1}`)[0] 
    }
    
    //взимане на противникова фигура 
    if(left !== undefined){
      possibleForChecks.push(left.classList[0])
      if(this.getPieceColor(left) !== color && this.getPieceColor(left) !== "empty" ){
        possibleMoves.push(left.classList[0])
      }
    }
    if(right != undefined){
      possibleForChecks.push(right.classList[0])
      if(this.getPieceColor(right) != color && this.getPieceColor(right) != "empty" ){
        possibleMoves.push(right.classList[0])
      }
    }
    
    localStorage.setItem("lastPiece",pawn.id)
    localStorage.setItem("possibleMoves",possibleMoves)
    return possibleForChecks
  }

  swapPlaces(destinationSquare,piece){
    let pieceID = piece.id
    let pieceClass = piece.classList[3]

    // премахва фигурата от предишното й място и го превръща в празно
    piece.classList.remove(pieceClass) 
    piece.classList.add("empty")

    // добавя индикатор че фигурата не може повече да се ползва за рокадо.
    if((piece.id[1] === "k" || piece.id[1] == "r") && pieceID.length == 3){
      piece.id = destinationSquare.id
      destinationSquare.id = pieceID + "n"
    }

    // дава ид на квадратчетата, които се превръщат в празни при взимане на фигура
    else if(destinationSquare.id[0] !== "e"){
      piece.id = this.getNewEmptyId()
      destinationSquare.id = pieceID
    }

    else{
      piece.id = destinationSquare.id
      destinationSquare.id = pieceID
    }
    
    //превръща избраното поле в поле с фигура в него
    destinationSquare.classList.add(pieceClass)
    destinationSquare.classList.remove(destinationSquare.classList[3])
    
    // изкарва панел за избор на фигура, в която пешка, стигнала до края на дъската, може да се превърне
    if(destinationSquare.classList[0][0] === "7" && pieceClass === "wp"){
      this.makePromotePanelAppear(destinationSquare.id,"w")
    }
    if(destinationSquare.classList[0][0] === "0" && pieceClass === "bp"){
      this.makePromotePanelAppear(destinationSquare.id,"b")
    }
  }

  addEventListenerToPieces(piece,pieceClass){
    let functionList = {
      "p": (pieceId) => this.PawnMove(pieceId),
      "n": (pieceId) => this.knightMove(pieceId),
      "b": (pieceId) => this.bishopMove(pieceId),
      "r": (pieceId) => this.rookMove(pieceId),
      "q": (pieceId) => this.queenMove(pieceId),
      "k": (pieceId) => this.kingMove(pieceId)  
    }

    //слага нов евент лисънър за съответната фигурата
    piece.addEventListener("click",() => {
      functionList[pieceClass](piece.id);
    });
  }

  addEventListeners(emptySquare,piece){
    //маха стари евент лисънъри от този обект
    let newPiece = this.removeAllEventListeners(piece)

    //определя каква е фигурата
    let pieceClass = piece.classList[3][1]

    //слага евент лисънъра
    this.addEventListenerToPieces(newPiece,pieceClass)

    //слага евент лисънър на новото празно поле
    let formerPiece = this.removeAllEventListeners(emptySquare)
    formerPiece.addEventListener("click",() =>{
      this.emptySpace(formerPiece)
    })
  }

  knightMove(knightID){
    //намира коня и кординатите му
    let knight = document.getElementById(knightID)
    let x = this.getPieceCords(knight)[0]
    let y = this.getPieceCords(knight)[1]
    let possibleMoves = []
     
    for(let i = 2; i > 0; i--){
      let x1 = x-i
      let x2 = x+i

      let y1;
      let y2;
      
      if(i == 2){
        y1 = y-1
        y2 = y+1
      }
      if(i == 1){
        y1 = y-2
        y2 = y+2
      }
      if((x1 >= 0)){
        if(y1 >= 0 ){
          possibleMoves.push(`${x1}${y1}`)
        }
        if(y2 < 8){
          possibleMoves.push(`${x1}${y2}`)
        }
      }
      if(x2 < 8){
        if(y1 >= 0 ){
          possibleMoves.push(`${x2}${y1}`)
        }
        if(y2 < 8){
          possibleMoves.push(`${x2}${y2}`)
        }
      }
    }

    // всички възможни ходове на един кон:
    //x+2 y-1 
    //x+2 y+1
    //x+1 y-2
    //x+1 y-2  
    //x-1 y+2
    //x - 1 y+2 
    //x - 2 y-1 
    //x-2 y+1
    // x1 започва от -2, а x1 от +2 след което намаляват до -1/+1
    // y1 и y2 са на същия принцип и се сменят спрямо x-овете, защото когато x е -2/+2 y винаги е -1/+1 и същото е вярно когато x e -1/+1

    localStorage.setItem("lastPiece",knightID)
    localStorage.setItem("possibleMoves",possibleMoves)
    return possibleMoves
  }

  bishopMove(bishopID){
    //намира офицера и кординатите му
    let bishop = document.getElementById(bishopID);
    let color = this.getPieceColor(bishop)
    let x = this.getPieceCords(bishop)[0]
    let y = this.getPieceCords(bishop)[1]

    let possibleMoves = this.bishopPossibleMoves(x,y,color)

    localStorage.setItem("possibleMoves",possibleMoves)
    localStorage.setItem("lastPiece",bishopID)
    return possibleMoves
  }

  rookMove(rookID){
    //намира топа и кординатите му
    let rook = document.getElementById(rookID);
    let color = this.getPieceColor(rook)
    let x = this.getPieceCords(rook)[0]
    let y = this.getPieceCords(rook)[1]

    let possibleMoves = this.rookPossibleMoves(x,y,color);

    localStorage.setItem("possibleMoves",possibleMoves)
    localStorage.setItem("lastPiece",rookID)
    return possibleMoves
  }

  rookPossibleMoves(x,y,color){
    let possibleMoves = []
    
    //нагоре 
    for(let i = 1; i < 8; i++){
      if(x+i > 7){
        break;
      }

      let nextSquareInLine = document.getElementsByClassName(`${x+i}${y}`)[0]

      if(this.getPieceColor(nextSquareInLine) !== "empty"){
        if(color !== this.getPieceColor(nextSquareInLine)){
          possibleMoves.push(`${x+i}${y}`)
        } 
        break;
      }

      possibleMoves.push(`${x+i}${y}`)
    }

    //надолу
    for(let i = 1; i < 8; i++){
      if(x-i < 0){
        break;
      }

      let nextSquareInLine = document.getElementsByClassName(`${x-i}${y}`)[0]

      if(this.getPieceColor(nextSquareInLine) !== "empty"){
        if(color !== this.getPieceColor(nextSquareInLine)){
          possibleMoves.push(`${x-i}${y}`)
        } 
        break;
      }

      possibleMoves.push(`${x-i}${y}`)
    }

    // надясно
    for(let i = 1; i < 8; i++){
      if(y+i > 7){
        break;
      }

      let nextSquareInLine = document.getElementsByClassName(`${x}${y+i}`)[0]

      if(this.getPieceColor(nextSquareInLine) !== "empty"){
        if(color !== this.getPieceColor(nextSquareInLine)){
          possibleMoves.push(`${x}${y+i}`)
        } 
        break;
      }

      possibleMoves.push(`${x}${y+i}`)
    }

    //наляво 
    for(let i = 1; i < 8; i++){
      if(y-i < 0){
        break;
      }

      let nextSquareInLine = document.getElementsByClassName(`${x}${y-i}`)[0]

      if(this.getPieceColor(nextSquareInLine) !== "empty"){
        if(color !== this.getPieceColor(nextSquareInLine)){
          possibleMoves.push(`${x}${y-i}`)
        } 
        break;
      }

      possibleMoves.push(`${x}${y-i}`)
    }
    return possibleMoves
  }
  bishopPossibleMoves(x,y,color){
    let possibleMoves=[]

    //горе дясно
    for(let i = 1;i<8;i++){
      if(x+i > 7 || y+i > 7){
        break;
      }

      let nextSquareInLine = document.getElementsByClassName(`${x+i}${y+i}`)[0]

      if(this.getPieceColor(nextSquareInLine) !== "empty"){
        if(color !== this.getPieceColor(nextSquareInLine)){
          possibleMoves.push(`${x+i}${y+i}`)
        } 
        break;
      }

      possibleMoves.push(`${x+i}${y+i}`)
    }

    //горе ляво
    for(let i = 1; i < 8; i++){
      if(x + i > 7 || y - i < 0){
        break;
      }

      let nextSquareInLine = document.getElementsByClassName(`${x+i}${y-i}`)[0]

      if(this.getPieceColor(nextSquareInLine) !== "empty"){
        if(color !== this.getPieceColor(nextSquareInLine)){
          possibleMoves.push(`${x+i}${y-i}`)
        } 
        break;
      }

      possibleMoves.push(`${x+i}${y-i}`)
    }
    //долу дясно
    for(let i = 1;i < 8; i++){
      if(x - i < 0 || y + i > 7){
        break;
      }

      let nextSquareInLine = document.getElementsByClassName(`${x-i}${y+i}`)[0]

      if(this.getPieceColor(nextSquareInLine) !== "empty"){
        if(color !== this.getPieceColor(nextSquareInLine)){
          possibleMoves.push(`${x-i}${y+i}`)
        } 
        break;
      }

      possibleMoves.push(`${x-i}${y+i}`)
    }
    //долу ляво
    for(let i = 1; i < 8; i++){
      if(x - i < 0 || y - i < 0){
        break;
      }

      let nextSquareInLine = document.getElementsByClassName(`${x-i}${y-i}`)[0]

      if(this.getPieceColor(nextSquareInLine) !== "empty"){
        if(color !== this.getPieceColor(nextSquareInLine)){
          possibleMoves.push(`${x-i}${y-i}`)
        } 
        break;
      }

      possibleMoves.push(`${x-i}${y-i}`)
    } 
    return possibleMoves
  }

  queenMove(queenID){
    //намира дамата и кординатите й
    let queen = document.getElementById(queenID);
    let color = this.getPieceColor(queen)
    let x = this.getPieceCords(queen)[0]
    let y = this.getPieceCords(queen)[1]

    //взима възможните ходове на топ и офицер
    let rookMoves = this.rookPossibleMoves(x,y,color)
    let bishopMoves = this.bishopPossibleMoves(x,y,color)

    let possibleMoves = rookMoves.concat(bishopMoves)

    localStorage.setItem("possibleMoves",possibleMoves)
    localStorage.setItem("lastPiece",queenID)
    return possibleMoves
  }

  kingMove(kingID){
    let kingColor = kingID[0]
    let king = this.findKing(kingColor)
    
    let x = this.getPieceCords(king)[0]
    let y = this.getPieceCords(king)[1]
    let possibleMoves = []

    //първия for цикъл контролира x и минава 3 пъти като съответно прибавя -1 0 1
    //втория минава през всяка вариация на y идентично на x
    //възможни ходове на царя:
    //x+1 y-1|x+1  y|x+1 y+1|
    //x   y-1|  xy  |x   y+1|
    //x-1 y-1|x-1  y|x-1 y+1|

    for(let i = -1; i < 2; i++ ){
      for(let j = -1; j < 2; j++){
        if((x+i >= 0 && x+i < 8) && (y+j >= 0 && y+j < 8)){
          let square = document.getElementsByClassName(`${x+i}${y+j}`)[0]

          if(square && (square.classList.contains("empty") || square.classList[3][0] != kingColor )){
            possibleMoves.push(`${x+i}${y+j}`)
          }
        }
      }
    }

    // проверява дали лявата страна е свободна и може да се рокира
    function checkLeftSideCastle(numberOfSpaces,color){
      //перспективата на черните е различна и в лявата част вместо 00 кординатите са 77
        if(color == "b"){
          for(let i = 1; i <= numberOfSpaces; i++){
            if(!document.getElementsByClassName(`7${7-i}`)[0].classList.contains("empty")){
              return false;
            }
          }
        }

        else{
          for(let i = 1; i <= numberOfSpaces; i++){
            if(!document.getElementsByClassName(`0${i}`)[0].classList.contains("empty")){
              return false;
            }
          }
        }
      return true
    }

    // проверява дали дясната страна е свободна и може да се рокира
    function checkRightSideCastle(numberOfSpaces,color){
      //перспективата на черните е различна и в лявата част вместо 07 кординатите са 70
      if(color == "b"){
        for(let i = 1; i <= numberOfSpaces; i++){
          if(!document.getElementsByClassName(`7${i}`)[0].classList.contains("empty")){
            return false;
          }
        }
      }

      else{
        for(let i = numberOfSpaces; i > 0; i--){
          if(!document.getElementsByClassName(`0${7-i}`)[0].classList.contains("empty")){
            return false;
          }
        }
      }
      return true;
    }

    let canCastleShort = false;
    let canCastleLong = false;

    if(kingID == "bk4"){
      //проверяват се дали топовете са мърдани или не и ако не са се вика функция за проверка дали местата са празни.
      if(document.getElementById("br7")){
        // числото показва колко полета трябва да се проверят
        canCastleShort = checkLeftSideCastle(2,"b");
      }

      if(document.getElementById("br0")){
        canCastleLong = checkRightSideCastle(3,"b");
      }
      
      //ако се е установило че може да се рокира ходовете, позволяващи рокадо се добавят към възможните ходове
      if(canCastleShort){
        possibleMoves.push(`76`)
      }

      if(canCastleLong){
        possibleMoves.push("72")
      }
    }

    if(kingID == "wk4"){
      if(document.getElementById("wr0")){
        canCastleLong = checkLeftSideCastle(3,"w");
      }

      if(document.getElementById("wr7")){
        canCastleShort = checkRightSideCastle(2,"w");
      }

      if(canCastleLong){
        possibleMoves.push(`02`)
      }

      if(canCastleShort){
        possibleMoves.push("06")
      }
    }

    localStorage.setItem("lastPiece",kingID)
    localStorage.setItem("possibleMoves",possibleMoves)
    return possibleMoves 
  }

  castleKing(rookID,cords){
    //намира топа и празното поле, на което той трябва да се премести
    let rook = document.getElementById(rookID)
    let color = rook.id[0]

    let newPlaceForRook = document.getElementsByClassName(cords)[0]
    let newPlaceForRookID = newPlaceForRook.id

    //разменят се ид-тата на див-овете
    newPlaceForRook.id = rook.id
    rook.id = newPlaceForRookID

    //слагат се нови класове
    newPlaceForRook.classList.remove("empty")
    newPlaceForRook.classList.add(`${color}r`)

    rook.classList.remove(`${color}r`)
    rook.classList.add("empty")

    //добавя нови евент лисънъри спрямо новите функции на квадратчетата
    rook.addEventListener("click", () => { 
      this.emptySpace(rook)
    })
  
    newPlaceForRook.addEventListener("click",() => {
      this.rookMove(newPlaceForRook)
    })
  }

  enPassant(enPassanSquare,enemyColor){
   
    //премахва класа на фигурата и го прави празно поле
    enPassanSquare.classList.remove(enemyColor)
    enPassanSquare.classList.add("empty")

    //слага функция, която го прави празно поле официално 
    enPassanSquare = this.removeAllEventListeners(enPassanSquare)
    enPassanSquare.addEventListener("click",() => {
      this.emptySpace(enPassanSquare)
    })

    //взима се ново ид за новонаправеното празно поле
    enPassanSquare.id = this.getNewEmptyId()

    //премахва се възможността за ан пасан
    enPassanSquare.removeAttribute("ep")
  }

  enPassanCheck(color,emptySquareCords,piece){
    //намира полетата, които трябва да бъдат премахнати при евентуално взимане ан пасан и за двата цвята 
    let enPassanCords;
    let enPassanSquare;
    let enPassantPlayed = false
    if(color == "w"){
      enPassanCords = `${parseInt(emptySquareCords[0])-1}${emptySquareCords[1]}`
      enPassanSquare = document.getElementsByClassName(enPassanCords)[0]
    }
    else if(color == "b"){
      enPassanCords = `${parseInt(emptySquareCords[0])+1}${emptySquareCords[1]}`
      enPassanSquare = document.getElementsByClassName(enPassanCords)[0]
    }

    if(piece.classList[3] == "wp" && enPassanSquare.classList[3] == "bp" && enPassanSquare.getAttribute("ep") == "true"){
      enPassantPlayed = true
      this.enPassant(enPassanSquare,"bp")
    }

    else if(piece.classList[3] == "wp" && enPassanSquare.classList[3] == "bp" && enPassanSquare.getAttribute("ep") == "true"){
      enPassantPlayed = true
      this.enPassant(enPassanSquare,"wp")
    }

    
    if(enPassantPlayed){
      //когато се установи взимане ан пасан се праща специална заявка и действието се изпълнява
      let infoAboutMove = {
        type:"ep",
        color:color,
        enPassantCords:enPassanCords,
        destinationCords:emptySquareCords,
        game_id:localStorage.getItem("game_id"),
        pieceMoved:piece.id,
      }
      return infoAboutMove
    }
    return false
  }

  isCastlePossible(piece,emptySquareCords){
    if(piece.id == "bk4" && emptySquareCords == "76"){
      this.castleKing("br7","75")
    }
    if(piece.id == "bk4" && emptySquareCords == "72"){
      this.castleKing("br0","73")
    }
    if(piece.id == "wk4" && emptySquareCords == "02"){
      this.castleKing("wr0","03")
    }
    if(piece.id == "wk4" && emptySquareCords == "06"){
      this.castleKing("wr7","05")
    }
  }

  emptySpace(emptySquare){
    //намира фигурата която е извършилa движението, както и кординатите на празното поле + всички възможни ходове на намерената фигура и цвета на фигурата
    let piece = document.getElementById(localStorage.getItem("lastPiece"))
    let emptySquareCords = emptySquare.classList[0]
    let possibleMoves = localStorage.getItem("possibleMoves").split(",")
    let color = piece.id[0]
    let ws = this.ws
    
    let checked = localStorage.getItem("checked")
    let checkingPiece = localStorage.getItem("checkingPiece")

    //ако царят е в шах се проверява на кои полета фигурите могат да застанат, за да предотвратят шах
    if(checked == "true" && piece.id[1] != "k"){
      let newPossibleMoves = []
      let possibleMovesToPreventCheck = this.checkPath(checkingPiece)

      //проверява дали фигурата, която е селектирана може да прикрие шаха
      for(let i = 0; i < possibleMoves.length; i++){
        //изключваме царя,защото той не може да прикрие шах
        if(possibleMovesToPreventCheck.includes(possibleMoves[i])){
          newPossibleMoves.push(possibleMoves[i])
        }
      }
      possibleMoves = newPossibleMoves
    }

    //проверяваме за свързани фигури и техните възможни ходове
    let possibleMovesForPinnedPieces = []
    let pinnedPieces = []
    
    //result е във формат [свързана фигура,възможни ходове]
    let results = this.isPinned(color)
    for(let i = 0;i < results.length;i++){
      possibleMovesForPinnedPieces.push(results[i][1]) 
      pinnedPieces.push(results[i][0])
    }
    
    //проверява дали селектирана фигура е свързана или не 
    let pinnedPieceIndex = pinnedPieces.indexOf(localStorage.getItem("lastPiece"))

    if(pinnedPieceIndex != -1){
      //ако са свързани им задава възможните ходове 
      let newPossibleMoves = []
      for(let i = 0;i < possibleMoves.length;i++){
        if(possibleMovesForPinnedPieces[pinnedPieceIndex].includes(possibleMoves[i])){
          newPossibleMoves.push(possibleMoves[i])
        }
      }
      possibleMoves = newPossibleMoves
    }

    //минаваме през всички възможни ходове докато не намерим съответсвие и ако има такова извършваме действието
    for(let i = 0; i < possibleMoves.length; i++){
      if(emptySquareCords == possibleMoves[i]){

        //събира нужната за направа на ход информация
        let infoAboutMove;
        
        //проверки за рокадо
        this.isCastlePossible(piece, emptySquareCords)

        //проверява дали ходът е бил ан пасан
        let isEnPassantPossible = this.enPassanCheck(color,emptySquareCords,piece)
        if(isEnPassantPossible != false){
          infoAboutMove = isEnPassantPossible
        }
        
        //премахва възможността царя да отиде в бито поле
        let checkedPlaces = localStorage.getItem("checkedPlaces")
        if(!checkedPlaces.includes(emptySquareCords) || piece.id[1] != "k"){
          infoAboutMove = {
            type:"move",
            color:color,
            destinationCords:emptySquareCords,
            currentCords:piece.classList[0],
            pieceMoved:piece.id,
            game_id:localStorage.getItem("game_id"), 
          }

          this.swapPlaces(emptySquare,piece)
          this.addEventListeners(piece,emptySquare)
        }
        else{
          break;
        }

        //преценява дали има шах и обновява информацията в съобщението
        let checkingPieces = this.isChecked(color)
        if(checkingPieces != false){
          infoAboutMove["checked"] = "true"
          infoAboutMove["checkingPieces"] = checkingPieces
        }

        //изпраща информацията на другия играч
        if(ws.readyState == 1){
          ws.send(JSON.stringify(infoAboutMove))
        }

        //премахване на ирелевантна информация
        localStorage.removeItem("lastPiece")
        localStorage.removeItem("possibleMoves")
        break
      }
    }
  }

  makePromotePanelAppear(pawnID,color){
    let pieces={
      0:"q",
      1:"r",
      2:"b",
      3:"n"
    }

    //намираме панела за повишаване на пешка 
    let promotingPanel = document.getElementById("promoting-panel")

    //цикъл, който слага евент лисънъри за панела за повишаване
    for (let i = 0; i < promotingPanel.childNodes.length; i++) {
      //всяка фигура, която е намерена в панела получава евент лисънър, който повишава пешката във съответната фигура
      let piece = promotingPanel.childNodes[i];

      piece.addEventListener("click",() => {
        this.promotePawn(pawnID,pieces[i],color)
      })
    }

    //променяне на дисплей пропърти така че да се вижда
    promotingPanel.style.display = "flex";
  }

  promotePawn(pawnID,promotePiece,color){
    //намираме нужната пешка
    let promotingPawn=document.getElementById(pawnID);

    if(promotingPawn){
      //премахваме ненужните класове и евент лисънъри и добавяме класа на новата фигура
      promotingPawn = this.removeAllEventListeners(promotingPawn)
      promotingPawn.classList.remove(`${color}p`)
      promotingPawn.classList.add(`${color}${promotePiece}`)
    
      //проверяваме свободните id-та и записваме фигурата с най-ниското възможно
      for(let i = 0; i < 9; i++){
        if(document.getElementById(`${color}${promotePiece}${i}`) == null){
          promotingPawn.id=`${color}${promotePiece}${i}`
          break;
        }
      }
    
      //слага евент лисънър спрямо избраната фигура
      this.addEventListenerToPieces(promotingPawn,promotePiece)

      //премахва панела за повишаванe
      let promotingPanel = document.getElementById("promoting-panel")
      promotingPanel.style.display = "none";
    }
  }

  makeGrid(){
    let chessBoard = []
    for (let i = 0; i < 8; i++) {
      //в зависимост от номера на реда първия цвят се редува
        if(i % 2 == 0){
          for(let j = 0; j < 8; j++ ){
            chessBoard.push(
              <div className={j % 2 === 0 ? "white grid-item" : "black grid-item"}></div>
            );
          }
        }

        if(i % 2 == 1){
          for(let k = 0; k < 8; k++ ){
            chessBoard.push(
              <div className={k % 2 === 1 ? "white grid-item" : "black grid-item"}></div>
            );
          }
        }
      }
    return chessBoard;
  }
  
  renderPieces(color){
    let piecesArray = []
    if(color === "w"){
      //създава черните фигури 
      piecesArray.push(this.createPieces(7,placement,"b",0))
      piecesArray.push(this.createPawns(6,"b",0))

      //създава празните полета
      for(let k = 5; k > 1; k--){
        piecesArray.push(this.createEmptySpaces(k,"w"))
      }

      //създава белите фигури
      piecesArray.push(this.createPawns(1,"w",0))
      piecesArray.push(this.createPieces(0,placement,"w",0))
    }

    if(color === "b"){
      piecesArray.push(this.createPieces(0,placement,"w",1))
      piecesArray.push(this.createPawns(1,"w",1))

      for(let k = 2; k < 6; k++){
        piecesArray.push(this.createEmptySpaces(k,"b"))
      }

      piecesArray.push(this.createPawns(6,"b",1))
      piecesArray.push(this.createPieces(7,placement,"b",1))
    }

    return piecesArray;
  } 

  findAllActivePiecesAndPawns(color){
    let pawns = []
    let pieces = []
    for(let i = 0; i < 8; i++){
      let pawnID = `${color}p${i}`
      let pawn = document.getElementById(pawnID) 

      if(pawn !== undefined){
        pawns.push(pawnID)
      }

      let pieceID = `${color}${placement[i]}${i}`
      let piece = document.getElementById(pieceID)

      if(piece !== undefined){
        pieces.push(pieceID)
      }
    }
    return [pawns,pieces]
  }
  
  checkedPlaces(color){
    let functionList = {
      "p": (pieceId) => this.PawnMove(pieceId),
      "n": (pieceId) => this.knightMove(pieceId),
      "b": (pieceId) => this.bishopMove(pieceId),
      "r": (pieceId) => this.rookMove(pieceId),
      "q": (pieceId) => this.queenMove(pieceId),
      "k": (pieceId) => this.kingMove(pieceId)  
    }

    let allCheckedPlaces = []
    let enemyColor = this.getEnemyColor(color)
    let allPieces = this.findAllActivePiecesAndPawns(enemyColor)
    let pawns = allPieces[0]
    let pieces = allPieces[1]
      
    for(let i = 0; i < pawns.length; i++){
      let checkedPlaces = this.PawnMove(pawns[i])
      for(let j = 0; j < checkedPlaces.length; j++){
        if(!allCheckedPlaces.includes(checkedPlaces[j])){
          allCheckedPlaces.push(checkedPlaces[j])
        }
      }
    }
    
    for(let i = 0; i < pieces.length; i++){
      let pieceClass = pieces[i][1]
      
      let checkedPlaces = functionList[pieceClass](pieces[i])
      for(let j = 0; j < checkedPlaces.length; j++){
        if(!allCheckedPlaces.includes(checkedPlaces[j])){
          allCheckedPlaces.push(checkedPlaces[j])
        }
      }
    }
    return allCheckedPlaces 
  }

  isChecked(color){
    let functionList = {
      "p": (pieceId) => this.PawnMove(pieceId),
      "n": (pieceId) => this.knightMove(pieceId),
      "b": (pieceId) => this.bishopMove(pieceId),
      "r": (pieceId) => this.rookMove(pieceId),
      "q": (pieceId) => this.queenMove(pieceId),
      "k": (pieceId) => this.kingMove(pieceId)  
    }

    let enemyColor = this.getEnemyColor(color)
    let enemyKing = this.findKing(enemyColor)
    let kingCords = enemyKing.classList[0]

    let checkingPieces = []
    let allPieces = this.findAllActivePiecesAndPawns(color)
    let pawns = allPieces[0]
    let pieces = allPieces[1]

    
    for(let i = 0; i < pawns.length; i++){
      let checkedPlaces = this.PawnMove(pawns[i])
      if(checkedPlaces.includes(kingCords)){
        checkingPieces.push(pawns[i])
      }
    }

    for(let i = 0; i < pieces.length; i++){
      let pieceClass = pieces[i][1]
      let checkedPlaces = functionList[pieceClass](pieces[i])
      if(checkedPlaces.includes(kingCords)){
        checkingPieces.push(pieces[i])
      }
    }

    if(checkingPieces.length > 0){
      return [checkingPieces]
    }

    return false
  }

  checkPath(chekingPieceID){
    let checkingPiece = document.getElementById(chekingPieceID)
    
    let color = checkingPiece.id[0]
    let checkingCords = this.getPieceCords(checkingPiece)
    let x1 = checkingCords[0]
    let y1 = checkingCords[1]

    let enemyColor = this.getEnemyColor(color)
    let enemyKing = this.findKing(enemyColor)


    let kingCords = enemyKing.id[0]
    let x2 = kingCords[0]
    let y2 = kingCords[1]
    
    let possibleMoves = []
    if(x1 > x2 && y1 == y2){
      for(let i = x2+1; i <= x1; i++){
        possibleMoves.push(`${i}${y1}`)
      } 
      // gore
    }
    else if(x1 < x2 && y1 == y2){
      for(let i = x1; i < x2; i++){
        possibleMoves.push(`${i}${y1}`)
      } 
      //dolu 
    }
    else if(x1 == x2 && y1 > y2){
      for(let i = y2+1; i <= y1; i++){
        possibleMoves.push(`${x1}${i}`)
      }
      //dqsno 
    }
    else if(x1 == x2 && y1 < y2){
      for(let i = y1; i < y2; i++){
        possibleMoves.push(`${x1}${i}`)
      } 
      // lqvo
    }
    else if(x1 > x2 && y1 < y2){
      for(let i = 0; i < x1-x2;i++){
        possibleMoves.push(`${x1-i}${y1+i}`)
      }
       // gore lqvo
    }
    else if(x1 > x2 && y1 > y2){
      for(let i = 1; i <= x1-x2;i++){
        possibleMoves.push(`${x2+i}${y2+i}`)
      }
       // gore dqsno
    }
    else if(x1 < x2 && y1 < y2){
      for(let i = 1; i < y2-y1;i++){
        possibleMoves.push(`${x1+i}${y1+i}`)
      }
       // dolu lqvo
    }
    else if(x1 < x2 && y1 > y2){
      for(let i = 1; i < y1-y2;i++){
        possibleMoves.push(`${x1+i}${y1-i}`)
      }
      // dolu dqsno
    }
    return possibleMoves
  }

  isPinned(color){
    let king = this.findKing(color)
    
    //кординати на царя
    let kingCords = this.getPieceCords(king)
    let kingX = kingCords[0]
    let kingY = kingCords[1]

    function checkforPin(x,y,color,dx,dy,pieceClass){
      let pinnedPiece
      let piecesontheWay = 0 
      let isPinnable = false
      let possibleMoves = []

      for(let i = 1; i < 8; i++){  
        let nextSquare = document.getElementsByClassName(`${x+(i*dx)}${y+(i*dy)}`)[0]

        if(nextSquare == undefined){
          break;
        }

        possibleMoves.push(nextSquare.classList[0])
        if(nextSquare.id[0] != "e" ){
          if(nextSquare.id[0] != color && pieceClass.includes(nextSquare.id[1])){
            isPinnable = true
            break
          }

          if(nextSquare.id[0] == color){
            piecesontheWay++;
            pinnedPiece = nextSquare.id
          }

          else if(nextSquare.id[0] != color){
            isPinnable = false
            break;
          }
        }

        if(piecesontheWay > 1){
          isPinnable = false
          break;
        }
      }
      
      if(isPinnable){
        return [pinnedPiece,possibleMoves]
      }

      else{
        return [false]
      }
    }

    const directions = [
      [0, -1, ["r", "q"]], // up
      [0, 1, ["r", "q"]],  // down
      [1, 0, ["r", "q"]],  // right
      [-1, 0, ["r", "q"]], // left
      [-1, -1, ["b", "q"]], // up-left
      [1, 1, ["b", "q"]],   // down-right
      [-1, 1, ["b", "q"]],  // up-right
      [1, -1, ["b", "q"]]   // down-left
    ]

    let resultsArray = []
    for (const [dx, dy, pieceTypes] of directions) {
      const result = checkforPin(kingX, kingY, color, dx, dy, pieceTypes);
      if (result[0]) {
        resultsArray.push(result);
      }
    }
    
    return resultsArray
  }

  isMated(checkingPieceID,checkedPlaces){
    let checkingPiece = document.getElementById(checkingPieceID)
    let friendlyColor = this.getEnemyColor(checkingPiece.id[0])

    let functionList = {
      "p": (pieceId) => this.PawnMove(pieceId),
      "n": (pieceId) => this.knightMove(pieceId),
      "b": (pieceId) => this.bishopMove(pieceId),
      "r": (pieceId) => this.rookMove(pieceId),
      "q": (pieceId) => this.queenMove(pieceId),
      "k": (pieceId) => this.kingMove(pieceId)  
    }

    let possibleMovesToBlockCheck = this.checkPath(checkingPieceID)
    let possibleKingMoves = this.kingMove(`${friendlyColor}k4`)

    for(let i = 0; i < 8; i++){
      let pieceID
      if(i != 4){
        pieceID = `${friendlyColor}${placement[i]}${i}`
      }

      let pawnID = `${friendlyColor}p${i}`
      let piece = document.getElementById(pieceID)
      let pawn = document.getElementById(pawnID)

      if(piece != null){
        let possibleMovesofPiece = functionList[piece.id[1]](pieceID)
        if(possibleMovesToBlockCheck.includes(possibleMovesofPiece)){
          return false
        }
      }

      if(pawn != null){
        let possibleMovesofPiece = this.PawnMove(pawnID)
        if(possibleMovesToBlockCheck.includes(possibleMovesofPiece)){
          return false
        }
      }
    }

    for(let i = 0; i < possibleKingMoves; i++){
      if(!checkedPlaces.includes(possibleKingMoves[i])){
        return false
      }
    }
    return true
  }

  createPieces(i,placement,color,a){
    //създава фигури според даден цвят и подредба
    let temp=[]
    if(a == 1){
      for(let j = 7; j >= 0; j--){
        temp.push(
        <div id={`${color}${placement[j]}${j}`} className={`${i}${j} grid-element baseStyle ${color}${placement[j]}`}></div>
        )
      }
    }

    if(a == 0){
      for(let j=0;j<8;j++){
        temp.push(
        <div id={`${color}${placement[j]}${j}`} className={`${i}${j} grid-element baseStyle ${color}${placement[j]}`}></div>
        )
      }
    }
    return temp
  }

  createPawns(i,color,a){
    //създава пешки по цвят
    let temp=[]
    if(a == 1){
      for(let j=7;j>=0;j--){
        temp.push(
        <div id={`${color}p${j}`} className={`${i}${j} grid-element baseStyle ${color}p`}></div>
        )
      }
    }

    if(a == 0){
      for(let j=0;j<8;j++){
        temp.push(
        <div id={`${color}p${j}`} className={`${i}${j} grid-element baseStyle ${color}p`}></div>
        )
      }
    }
    
    return temp
  }

  createEmptySpaces(k,color){
    //създава празни места
    let temp=[]

    if(color == "w"){
      for(let j = 0; j < 8; j++){
        temp.push(
        <div id={`e${k}${j}`} className={`${k}${j} grid-element baseStyle empty`}></div>
        )
      }
    }

    else if(color == "b"){
      for(let j = 7; j >= 0; j--){
        temp.push(
        <div id={`e${k}${j}`} className={`${k}${j} grid-element baseStyle empty`}></div>
        )
      }
    }
    
    return temp
  }  
}

export default Chess;

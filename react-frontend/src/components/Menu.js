import React, { useEffect } from 'react';
import "../styles/Menu.css"
import Logo from "../chess-pieces/logo.png";
import ChessImg from '../chess-pieces/chess.png';


function openLanguageMenu(){
  let menu = document.getElementsByClassName("language-menu")[0]
  console.log(menu.style.display == "none" )
  if(menu.style.display == "none" || menu.style.display == ""){
    console.log(menu.style.display)
    menu.style.display = "flex"
    console.log(menu.style.display)
  }
  if(menu.style.display == "flex" || menu.style.display == ""){
    menu.style.display = "none"
  }
}

function Menu() {
  useEffect(()=>{
    document.querySelector('.placeholder').style.height = document.querySelector('#container-menu').offsetHeight + 'px';
  })
  return (
    <>
    <div className = 'placeholder'></div>
    <div id = 'container-menu'>
      {localStorage.getItem("accessToken") != undefined &&(
        <a className='logo-container' href='/play'>
        <img className ='logo' src = {Logo}/>
        <img className ='logo' src={ChessImg} />
        </a>
      )}

      {localStorage.getItem("accessToken") == undefined &&(
        <a className='logo-container' href='/'>
        <img className ='logo' src = {Logo}/>
        <img className ='logo' src={ChessImg} />
        </a>
      )}
      

      <a href= "/play">
        <div className='tab'>Играй</div>
      </a>
      
      <a href= "/forum">
        <div className='tab'>Форум</div>
      </a>
     
      
      
   </div> 
   </>
  );
}

export default Menu;
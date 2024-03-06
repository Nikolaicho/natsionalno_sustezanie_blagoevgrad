import React, { useEffect } from 'react';
import "../styles/Menu.css"
import Logo from "../chess-pieces/logo.png";
import ChessImg from '../chess-pieces/chess.png';
import { Link } from "react-router-dom";
import Hamburger from "../chess-pieces/hamburger.png"

function openHamburgerMenu(){
  document.getElementsByClassName("mobile-menu")[0].style.display = "block"
}
function closeHamburgerMenu(){
  document.getElementsByClassName("mobile-menu")[0].style.display = "none"
}

function Menu() {
  useEffect(()=>{
    document.querySelector('.placeholder').style.height = document.querySelector('#container-menu').offsetHeight + 'px';
  })
  return (
    <>
    <div className = 'hamburger' onClick = {openHamburgerMenu}>☰</div>
    {/*placeholder има същите размери като менюто като това държи менюто фиксирано */}
    <div className = 'placeholder'></div>

    <div id = 'container-menu'>
      {localStorage.getItem("accessToken") != undefined &&(
        <Link className='logo-container' to ='/play'>
          <img className ='logo' src = {Logo}/>
          <img className ='logo' src={ChessImg} />
        </Link>
      )}

      {localStorage.getItem("accessToken") == undefined &&(
        <Link className='logo-container' to = '/'>
          <img className = 'logo' src = {Logo} />
          <img className = 'logo' src = {ChessImg}/>
        </Link>
      )}
      
      <Link to = "/play">
        <div className='tab'>Играй</div>
      </Link>
      
      <Link to = "/forum">
        <div className = 'tab'>Форум</div>
      </Link>

      
   </div> 
   
   <div className='mobile-menu'>
    <div className = 'hamburger' onClick = {closeHamburgerMenu}>☰</div>
        <Link to = "/">
          <div className = 'tab'>Начало</div>
        </Link>
        <Link to = "/play">
          <div className = 'tab'>Играй</div>
        </Link>
      
        <Link to = "/forum">
          <div className = 'tab'>Форум</div>
        </Link>
        
    </div>
   </>
  );
}

export default Menu;
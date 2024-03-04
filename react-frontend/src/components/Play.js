import React from 'react';
import "../styles/Play.css"
import Menu from './Menu'
import axios from "axios"
import Cookies from 'universal-cookie';
const cookie = new Cookies();

function triggerError(errorMessage){
    //IT - Invalid time
    //NC - No color
    //IC - invalid code 
    let error = document.getElementsByClassName("error")[0]
    if(errorMessage == "IT"){
        error.textContent = "Невалидни времеви граници"
    }

    if(errorMessage == "NC"){
        error.textContent = "Изберете цвят"
    }

    if(errorMessage == "IC"){
        error.textContent = "Невалиден код"
    }
}

function activeColor(color){
    let active = document.getElementsByClassName("active")[0]

    if(active != undefined){
        active.classList.remove("active")
    }

    document.getElementsByClassName(color+"-tile")[0].classList.add("active")
}

function createGame(){
    let error = false 
    let color = document.getElementsByClassName("active")[0]
    if(color != null){
        color = color.classList[0]
        if(color == "random"){
            let randomNumber = Math.floor(Math.random() * 10) + 1;
            if(randomNumber % 2 == 0){
                color = "black"
            }
    
            else{
                color = "white"
            }
        }
    }
    else{
        triggerError("NC")
        error = true
    }
    
    let minutes = document.getElementsByClassName("minutes")[0].value
    let seconds = document.getElementsByClassName("seconds")[0].value
    

    if(minutes.length == 0 || (parseInt(minutes) < 0 || parseInt(minutes) > 200)){
        triggerError("IT")
        error = true
    }

    if(seconds.length < 0 || (parseInt(seconds) < 0 || parseInt(seconds) > 60)){
        triggerError("IT")
        error = true
    }

   

    if(!error){
        axios.post("/api/create-new-game",{
            //promeni s biskvitka
            color:color,
            token:localStorage.getItem("accessToken"),
            minutes:minutes,
            seconds:seconds,
            
        }).then((res)=>{
            const codePanel = document.getElementsByClassName('game-code-panel')[0]
            codePanel.textContent += res.data
            codePanel.style.display = "block"
        })
    }
    
} 

function joinGame(){
    let code = document.getElementsByClassName("game-code")[0].value
    axios.post("/api/join-game",{
        //promeni s biskvitka
        token:localStorage.getItem("accessToken"),
        code:code,
    }).then((res)=>{
        if(res.data != "IC"){
            localStorage.setItem("color",res.data.color)
            localStorage.setItem("game_id",code)
            //res.data.time дава масив във формат [минути,секунди,инкремент]
            let totalTime = res.data.time[0]*60 + res.data.time[1]
            localStorage.setItem("totalTime",totalTime)
        }
        else {
            triggerError("IC")
        }
    })
    setTimeout(() => {
        window.location.href = '/game';
    }, 500);
    
}


function Play(){
    
    return (
        <div className='container'>
            <Menu/>
            <div className='subcontainer'>
                
                <div className='create-game-form'>
                    <h3>Създай игра</h3>
                    <div className = 'error'></div> 
                    <div className='chooseColor'>
                        <p>Предпочитан цвят:</p>
                        <div onClick ={()=>{activeColor("black")}}className='black-tile color-option'><p className='tick'>V</p></div>
                        <div onClick ={()=>{activeColor("white")}}className='white-tile color-option'><p className='tick'>V</p></div>
                        <div onClick ={()=>{activeColor("random")}}className='random-tile color-option'><p className='tick'>?</p></div>
                    </div>
                    
                    <div className='time-constraints'>
                        <div>Времеви граници:</div>
                        <input className = "minutes" placeholder='Минути'></input>
                        <input className = "seconds" placeholder='Секунди'></input>
                    </div>
                    <p className = "create-game-button" onClick = {createGame}> СЪЗДАЙ ИГРА</p>
                    <div className = 'game-code-panel'>Код за достъп към игра: </div>
                    <div className='join-game-panel'>
                        <h3>Имаш код?</h3>
                        <input className='game-code'></input>
                        <p className = "create-game-button" onClick={joinGame}>Влез</p>
                    </div>
                    
                </div>
                
                
            </div>
            <div className="third item to make the main one in the center"></div>
        </div>
    )
}
export default Play;
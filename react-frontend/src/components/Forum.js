import axios from "axios"
import React, { useEffect, useState } from 'react';
import "../styles/Forum.css"
import Menu from './Menu'
import { Link } from 'react-router-dom';
import Comment from "../chess-pieces/comment-icon.png"
import  Search  from "../chess-pieces/search-loop.png";
const url = "http://localhost:3000"
function createForumPost(){
    let title = document.getElementsByClassName("title1")[0].value
    let content = document.getElementsByClassName("content")[0].value
    let cat = document.getElementsByClassName("cat-dropdown")[0].value
    axios.post(url + "/api/create-post",{
        title:title,
        content:content,
        cat:cat,
        token:localStorage.getItem("accessToken"),
    })
}

function openFormPanel(){
    let panel = document.getElementsByClassName("forum-form")[0]
    if(panel.style.display == "flex"){
        panel.style.display = "none"
    }
    else{
        panel.style.display = "flex"
    }
}

function closePanel(){
    let panel = document.getElementsByClassName("forum-form")[0];
    panel.style.display = "none"
}

async function search(){
    let title = document.getElementsByClassName("search-bar")[0].value
    let res = await axios.post(url + "/api/post-info",{
        title:title
    })
    if(res.data != 404){
        window.location.href = `/forum/${res.data._id}`
    }
    else{
        window.location.href = `/not-found`
    }
}

function Forum(){
    const [recentOpening, setRecentOpening] = useState([])
    const [recentAnalysis, setRecentAnalysis] = useState([])
    const [recentOther, setRecentOther] = useState([])
    useEffect( ()=>{
        async function FetchData(){
            let opening = []
            let analysis = []
            let other = []
    
            let res = await axios.get( url + "/api/last-published")
    
            for(let i = 0; i < 4; i++){
                opening.push(
                    <Link className = "post-container" to={`/forum/${res.data.opening[i]._id}`}>
                            <div className = "thread-link-and-cat-container">
                                <p className = "thread" to={`/forum/${res.data.opening[i]._id}`}>
                                    {res.data.opening[i].title}
                                </p>
                                <p className = "mini-cat">{res.data.opening[i].cat}</p>
                            </div>
                            <div className = "comments-number">
                                <h5>{res.data.opening[i].comments.length}</h5>
                                <img className = "comment" src = {Comment}/>
                            </div>
                    </Link>
                        
                    
                )
                analysis.push(
                    <Link className = "post-container" to={`/forum/${res.data.analysis[i]._id}`}>
                        <div className = "thread-link-and-cat-container">
                            <p className = "thread" to={`/forum/${res.data.analysis[i]._id}`}>
                                {res.data.analysis[i].title}
                            </p>
                        <p className = "mini-cat">{res.data.analysis[i].cat}</p>
                        </div>
                        <div className = "comments-number">
                            <h5>{res.data.analysis[i].comments.length}</h5>
                            <img className = "comment" src = {Comment}/>
                        </div>

                    </Link>
                    
                )
                other.push(
                    <Link className = "post-container" to={`/forum/${res.data.other[i]._id}`}>
                        <div className = "thread-link-and-cat-container">
                            <p className = "thread" to={`/forum/${res.data.other[i]._id}`}>
                                {res.data.other[i].title}
                            </p>
                            <p className = "mini-cat">{res.data.other[i].cat}</p>
                        </div>
                        <div className = "comments-number">
                            <h5>{res.data.other[i].comments.length}</h5>
                            <img className = "comment" src = {Comment}/>
                        </div>
                    </Link>
                )
            }
            setRecentAnalysis(analysis)
            setRecentOpening(opening)
            setRecentOther(other)
        } 
        FetchData()
        
    },[])

    return (
        <>
        <div className="forum-container">
            <Menu/>
            <div className="forum-form">
                <div onClick = {closePanel} className="close">X</div>

                <h3>Създай публикация</h3>

                <input placeholder="Заглавие" className=" title1 item"></input>

                <textarea className="text-box item content" placeholder="Съдържание"></textarea>

                <select className="cat-dropdown item">
                    <option value="Дебюти">Дебюти</option>
                    <option value="Анализи">Анализи</option>
                    <option value="Други">Други</option>
                </select>

                <button className = "create-thread" onClick={createForumPost}>Създай</button>
            </div>

            <div className = "contents-container">
            <div className = "search-container" onSubmit = {search}>
                        <input className = "search-bar" placeholder = "Потърси"></input>
                        <img className = "search-img"  src = {Search}/>
                        <h5 className = "arrow" onClick = {search}> {">"} </h5>
                    </div>
                

                <h2>Наскоро добавени:</h2>

                <div className = "opening-cat cat">
                    {recentOpening.map((item, index) => (
                        <p className = "thread-container">{item}</p>
                    ))}   
                </div>

                <div className="analysis-cat cat">
                    {recentAnalysis.map((item, index) => (
                        <p className = "thread-container">{item}</p>
                    ))}   
                </div>

                <div className="other-cat cat">
                    {recentOther.map((item, index) => (
                        <p className = "thread-container">{item}</p>
                ))}   
                </div>    
            </div>

            <div className = "button-container">
                <button onClick={openFormPanel} className = "create-thread">Създай публикация</button>
            </div>  
        </div>
        
        </>
    )    
}
export default Forum;

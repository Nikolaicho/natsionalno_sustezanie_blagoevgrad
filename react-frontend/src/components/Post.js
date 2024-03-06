import axios from "axios"
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Menu from './Menu'
import "../styles/Post.css"
import Bin from "../chess-pieces/bin.png"

const url = "http://localhost:3000"
function Post(){
    const {id} = useParams();
    const [title,setTitle] = useState()
    const [content,setContent] = useState()
    const [comments,setComments] = useState([])
    const [author,setAuthor] = useState()

    function createComment(){
        let comment = document.getElementsByClassName("text-box")[0].value
        axios.post(url + "/api/create-comment",{
            id:id,
            comment:comment,
            token:localStorage.getItem("accessToken")
        })
        setTimeout(()=>{
            
            window.location.reload()
        },200)
    }

    function deleteComment(commentID){
        axios.post(url + "/api/delete-comment",{
            commentID:commentID,
            forumID:id,
            token:localStorage.getItem("accessToken")
        })
        setTimeout(()=>{
            
            window.location.reload()
        },200)
        
    }
    function deleteThread(id){
        axios.post(url + "/api/delete-thread",{
            id:id,
            token:localStorage.getItem("accessToken")
        })
        window.location.href = "/forum"
    }

    function breakUpText(resComments){
        //komentari
        let width = Math.ceil(window.innerWidth/15)
        let comments = resComments;
        let formatedContent = ""
        for(let i = 0; i < comments.length;i++){
            if(comments[i].content.length < 50){
                formatedContent += comments[i]
            }
            else{
                let temp = ""
                for(let j = 0; j < comments[i].content.length;j++){
                    temp += comments[i].content[j]
                    if(j % width == 0 && j >0){
                        console.log("aaaaa",j)
                        temp += "\n"
                    }
                }
                comments[i].content = temp
                formatedContent += comments[i]
            }
        }
        return formatedContent
    }
    
    function breakUpContent(resContent){
        let width = Math.ceil(window.innerWidth/15)
        let content = resContent;
        let formatedContent = ""
        for(let i = 0; i < content.length;i++){
            formatedContent += content[i]
            if(i % width == 0 && i >0){
                
                formatedContent += "\n"
            }
        }
        return formatedContent
    }

    function breakUpTitle(resTitle){
        let width = 25
        let title = resTitle
        let newTitle = ""
        if(title.length < 20){
            return title;
        }
        else{
            for(let i = 0; i < title.length;i++){
                newTitle += title[i]
                if(i % width == 0 && i > 0){
                    newTitle += "\n" 
                }
            }
        }
        
        return newTitle;
    }

    useEffect(()=>{
        async function FetchData(){
            let res = await axios.post(url + "/api/post-info",{id:id})
            if(res == "404"){
                console.log("qsha")
            }

            else{
                breakUpText(res.data.comments)
                let content = breakUpContent(res.data.content)
                breakUpTitle(res.data.title)

                setTitle(res.data.title)
                setContent(content)
                setComments(res.data.comments)
                setAuthor(res.data.author)
            }
        }
        
        FetchData();
      
    },[])
return (
    <>
    <div className = "post-container">
        <Menu/>
        <div className = "content-container">

            <div className = "title-container-post">
                <div>
                    <h2 className = "title">{title} <br/> </h2>
                    <p className = "author">Автор:{author}</p>
                </div>
                
                {(author === localStorage.getItem("username") || localStorage.getItem("role") == "true") && (
                    <img src = {Bin}  className = "delete-thread" onClick = {()=>{deleteThread(id)}}/>
                )}
                
            </div>
            
            
            
                <div className = "content">{content}</div>
                <h4>{comments.length} коментара</h4>
            
            

            <textarea className = "text-box" placeholder="напиши коментар"></textarea>
            <button className = "create-comment-button"onClick={createComment}>СЪЗДАЙ</button>

            {comments.map(comment => (
                <div className="comment-container">
                    <div>{comment.author}</div>
                    <div className = "comment-content">{comment.content}</div>
                    {(comment.author === localStorage.getItem("username") || localStorage.getItem("role") == "true") && (
                        <img className = "delete" src={Bin} onClick = {()=>{deleteComment(comment.id,id)}}/>
                    )}
                </div>
            ))}

        </div>
    </div>
    </>
  )    
}
export default Post;
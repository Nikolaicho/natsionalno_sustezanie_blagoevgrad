const express = require("express");
const app= express();

const cors = require('cors');
app.use(cors());

const bodyParser = require('body-parser');
app.use(bodyParser.json());

require('dotenv').config();

const { MongoClient } = require("mongodb");
const mongoUrl = `mongodb+srv://chess:${process.env.DB_PASSWORD}@cluster0.unabrut.mongodb.net/?retryWrites=true&w=majority`
const mongoClient = new MongoClient(mongoUrl);
mongoClient.connect();
const db = mongoClient.db('chess');

const User = require(__dirname+"/userModel");
const Game = require(__dirname+"/gameModel")
const Forum = require(__dirname+"/forumModel")
const gameCollection = db.collection("games")
const forums = db.collection("forum")

const users = db.collection("users")

const crypto = require('crypto');

const uuid = require("uuid")

const path = require('path');
app.use(express.static(path.join(__dirname, "build")));


//връзка за WebSocket сървър
const WebSocket = require('ws');
const wss = new WebSocket.Server({port:3002});

// хаш мап за двойките, които в момента играят. 
let couples = new Map()

//хаш мап за ид-та, които сочат към конкретна връзка.
let clients = new Map()


//дава id-то на връзката на противниковия играч
function getEnemyConnection(wsId,game_id){
    let connections=couples.get(game_id)

    if(wsId == connections[0])
        return connections[1]

    return connections[0]
}

//функция за вкарване на нови връзки в хаш мапа и изпращането им на потребителите.
function newConncetion(ws){
    let wsId = createID()
    clients.set(wsId,ws)

    let wsJSON={
        "type":"connection",
        "ws":wsId
    }
    
    ws.send(JSON.stringify(wsJSON))
    return wsId;
}

//главната функция на WS съръра, който поема целия трафик за live игри.
wss.on('connection', (ws) => {
    //създава нова връзка и я праща на потребителя, когато се свърже към сървъра.
    let wsId = newConncetion(ws)

    //функция, която слуша за съобщения от потребителя
    ws.on('message', (message) => {
        
        //прави приетото от клиента съобщение в JSON обект и извлича основната информация
        let parsedMessage = JSON.parse(message)
        let type = parsedMessage["type"]
        let game_id = parsedMessage["game_id"]
        let color = parsedMessage["color"]
        let connectionString = `${color} ${wsId}`
        
        //занимава се с установяване на връзка между противниците
        if(type == "initial"){    

            //ако вече 1 от участниците е вписан се вписва другия.
            if(couples.has(game_id) && couples.get(game_id).length <2){
                let exsitingConnection = couples.get(game_id)
                exsitingConnection.push(connectionString) 
            }

            //ако все още няма вписана игра с даденото id се вписва с първия участник, който е направил заявка
            else if(couples.has(game_id) == false){
                couples.set(game_id,[connectionString])
            }

            //ако всички участници са вписани се очаква, че се е стигнало до тук защото е имало някакъв проблем с връзката.
            //заменя се предишната връзка с нова и се изпраща на потребителя
            else if(couples.has(game_id) && couples.get(game_id).length == 2){
                let existingConnections = couples.get(game_id)

                //намира се старата връзка според цвета на фигурите, който се използва по време на играта и се заменя с нова 
                if(existingConnections[0][0] == color){
                    existingConnections[0] = connectionString
                }
                
                else{
                    existingConnections[1] = connectionString
                }

                //запазват се промените
                couples.set(game_id,existingConnections)
            }
        }

        //ако заявката е от тип ход или ан пасан се намира връзката на противникът и се изпраща информация за хода, който е направен
        if(type == "move" || type == "ep"){
            // има .substring(2) защото връзката се пази във формат c connectionString, където c е цветът на фигурите на човекът, към който е насочена връзката 
            let wsConncectionID = getEnemyConnection(connectionString,game_id).substring(2)
            let enemyConnection = clients.get(wsConncectionID)   
            enemyConnection.send(JSON.stringify(parsedMessage))
        }
    });
  });


//тайни ключове, с които се създават jwt токени за връзка
const jwt= require("jsonwebtoken");
const accessSecretKey = process.env.ACCESS_SECRET_KEY
const refreshSecretKey = process.env.REFRESH_SECRET_KEY


function createID(){
    let id = uuid.v4()
    return id.substring(0,15)
}

function HashPassword(password){
    return crypto.createHash('sha256').update(password).digest('hex');
}

function getUserInfo(id){
    users.findOne({_id:id})
    return users.name
}

function generateTokens(userInfo){
    let refreshTokenInfo={
        id:userInfo['ID']
    }

    let fiveMinutes = 60*5
    let oneHour = 60
    const accessToken = jwt.sign(userInfo,accessSecretKey,{expiresIn:fiveMinutes})
    const refreshToken = jwt.sign(refreshTokenInfo,refreshSecretKey,{expiresIn:oneHour})
    return {
        accessToken:accessToken,
        refreshToken:refreshToken
    }
}

const verifyToken = (req, res, next) => {
    const accessToken = req.body.accessToken
    const refreshToken = req.body.refreshToken 
    if(accessToken == null){
        if(refreshToken == null){
            res.sendStatus(401)
        }
        else{
            const decoded=jwt.verify(refreshToken,refreshSecretKey)
            if(decoded.exp >= Date.now() / 1000){
                res.send({
                    accessToken:regenToken(refreshToken)
                });
            }
            else{
                res.sendStatus(401)
            }
           
        }
    }
    next();
}; 

function regenToken(refreshToken){
    const decoded = jwt.verify(refreshToken,refreshSecretKey)
    const info = getUserInfo(decoded.id)
    const newAccessToken = jwt.sign({id:info},refreshSecretKey,{expiresIn:"1m"})
    return newAccessToken
}


app.post("/api/register",(req,res)=>{
    const _id = createID();
    let newUser= new User({
        _id:_id,
        username:req.body.username,
        email:req.body.email,
        password:HashPassword(req.body.password),
        admin:false,
    });
    users.insertOne(newUser);

    let userInfo={
        ID:_id,
        admin:false
    }

    const tokens = generateTokens(userInfo,accessSecretKey)
    const accessToken = tokens["accessToken"]
    const refreshToken = tokens["refreshToken"]
    res.send({
        accessToken:accessToken,
        refreshToken:refreshToken,
        admin:false,
        username:req.body.username
    })
});


app.post('/api/log-in',async(req,res)=>{
    //търси потребители по имейл или потребителско име
    
    const response = await users.findOne({
        $or: [
            {username:req.body.identifier},
            {email: req.body.identifier}
          ]
    });
    
    //ако намери резултат от търсенето хешира дадената паролата и проверява дали съвпада с хаша в DB и стартира сесия 
    if(response.password == HashPassword(req.body.password)){
        let userInfo = {
            "ID":response._id,
            "username":response.username,
            "admin":response.admin,
        }

        const tokens = generateTokens(userInfo,accessSecretKey)
        const accessToken = tokens["accessToken"]
        const refreshToken=tokens["refreshToken"]

        res.send({
            accessToken:accessToken,
            refreshToken:refreshToken,
            admin:response.admin,
            username:response.username,
        }) 
    }
    else{
        res.send("FL")
    }
    })

app.post("/api/create-new-game",(req,res)=>{
    const decoded = jwt.decode(req.body.token);
    let white_id = "";
    let black_id = "";
    if(req.body.color.split("-")[0] == "white"){
        white_id = decoded.ID
    }

    else{
        black_id = decoded.ID
    }
    
    let id = createID();
    let game = new Game({
        _id:id,
        white_id:white_id,
        black_id:black_id,
        minutes:req.body.minutes,
        seconds:req.body.seconds,
        increment:req.body.increment
    })
    
    gameCollection.insertOne(game)
    res.send(id)
})

app.post("/test",(req,res)=>{
    forums.deleteMany({});
})

app.post("/api/join-game",async (req,res)=>{
    const decoded = jwt.decode(req.body.token)
    let result = await gameCollection.findOne({_id:req.body.code})
    if(result != null){
        if(result.white_id == decoded.ID ||(result.white_id == "" && result.black_id != decoded.ID)){
            res.send({
                color:"w",
                time:[result.minutes,result.seconds,result.increment]
            })
        }
        else if(result.black_id == decoded.ID ||(result.black_id == "" && result.white_id != decoded.ID)){
            res.send({
                color:"b",
                time:[result.minutes,result.seconds,result.increment]
            })
        }
    }
    else{
        res.send("IC")
    }
    
})

app.post("/api/create-post",(req,res)=>{
    let author = jwt.decode(req.body.token).username
    let id = createID();
    let forum = new Forum({
    _id:id,
    title:req.body.title,
    cat:req.body.cat,
    content:req.body.content,
    comments:[],
    author:author
    })
    forums.insertOne(forum)
})

app.get("/api/last-published",async (req,res)=>{
    const opening = await forums.find({cat:"Дебюти"}).sort({ _id: -1 }).limit(4).toArray();
    const analysis = await forums.find({cat:"Анализи"}).sort({ _id: -1 }).limit(4).toArray();
    const other = await forums.find({cat:"Други"}).sort({ _id: -1 }).limit(4).toArray();
    res.send({
        opening:opening,
        analysis:analysis,
        other:other
    })
})

app.post("/api/post-info",async(req,res)=>{
    
    let result ;
    if(req.body.id == undefined){
        result = await forums.findOne({title:req.body.title})
    }

    else{
        result = await forums.findOne({_id:req.body.id})
    }

    if(result != null){
        console.log("--------")
        console.log("dai")
        console.log(result)
        res.send(result)
    }
    else{
        res.send("404")
    }
})

app.post("/api/create-comment",async (req,res)=>{
    let result = await forums.findOne({_id:req.body.id})
    let decoded = jwt.decode(req.body.token)
    if(result != null){
        if(req.body.comment.length >0){
            let newComments = {
                id:createID(),
                author:decoded.username,
                content:req.body.comment,
            }
            
            forums.updateOne({ _id: req.body.id },{ $push: { comments: newComments } })
        }
    }
})

app.post("/api/delete-comment",async(req,res)=>{
    let thread = await forums.findOne({_id:req.body.forumID})
    let decoded = jwt.decode(req.body.token)
    const commentToBeDeleted = thread.comments.filter(obj => obj.id == req.body.commentID);
    if(decoded.admin == true || commentToBeDeleted[0].author == decoded.username){
        const filteredData = thread.comments.filter(obj => obj.id !== req.body.commentID);
        forums.updateOne({ _id: req.body.forumID },{ $set: { comments: filteredData} })
    }
    
})

app.post("/api/delete-thread",async(req,res)=>{
    let decoded = jwt.decode(req.body.token)
    let thread = await forums.findOne({
        _id:req.body.id
    })

    if(decoded.admin == true || thread.author == decoded.username){
        forums.deleteOne({_id: req.body.id})
    }
})

let port = process.env.PORT || 3000
app.listen(port)

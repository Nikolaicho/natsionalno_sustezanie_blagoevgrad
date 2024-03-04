import React from 'react';
import ReactDOM from 'react-dom/client';
import WelcomePage from './components/WelcomePage';
import Play from "./components/Play"
import ChessBoard from "./components/ChessBoard"
import { BrowserRouter as Router } from 'react-router-dom';
import { Route, Routes } from 'react-router-dom';

import Forum from './components/Forum';
import Post from './components/Post';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <>

    <Router>
      <Routes>
        <Route path = "/" element = {<WelcomePage/>} />
        <Route path = "/play" element = {<Play/>} />
        <Route path = "/game" element = {<ChessBoard/>} />
        <Route path = "/forum" element = {<Forum/>}/>
        <Route path = "/forum/:id" element = {<Post/>} />
      </Routes>
    </Router>
    </>
);

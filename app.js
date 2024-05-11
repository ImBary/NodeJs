const express = require('express');
const app = express();
const api = require('./api')
const cookieParser = require('cookie-parser');
const session = require('express-session');
app.use(cookieParser());
app.use(express.json());
app.use(session({
    secret: 'verySecretValue',
    resave: false,
    saveUninitialized: true,
    cookie:{ secure: false}
}));


app.set('view engine','ejs');

app.use(express.urlencoded( {extended: true}));



app.get('/',async (req,res)=>{
    let userName = 'Nieznajomy';

    if(req.session.user){
        userName = req.session.user;
    }else if(req.cookies.userName){
        userName = req.cookies.username;
        req.session.user = userName;
    }
    try{
        const posts = await api.getPosts();
        res.render('index',{posts,userName});
    }catch(err){
        console.error(err);
        res.status(500).send('Błąd serwera DUPA');
    }
});

app.post('/posts', async (req,res)=>{
    let usrName = 'nieznajomy'
    if(req.session.user){
        usrName = req.session.user;
    }else if(req.cookies.userName){
        usrName = req.cookies.usrname;
        req.session.user = usrName;
    }

    const {title, content} = req.body;
    
    try{
        const userId = await api.getUserIdByUsersName(usrName);
        if(userId.length===0){
            return res.redirect('/login')
        }
        
        const usrPost = {title:title,content:content,userId:userId[0].id};
        await api.createPost(usrPost);
        res.redirect('/');
    }catch(err){
        console.error(err);
        res.status(500).send('Error adding user');
    }
});

app.get('/login',(req,res)=>{
    res.render('login');
});

app.get('/register',(req,res)=>{
    res.render('register');
});

app.post('/register',async (req,res)=>{
    const {username,code} = req.body;
    console.log("UserName: "+username);
    console.log("code: "+code);
    req.session.user = username;
    const isInBase = await api.getUserIdByUsersName(username);
    console.log(isInBase);
    if(isInBase.length>0){
        res.redirect('/login');
    }else{
        const us = {name:username,code:code};
        await api.createUsers(us);
        res.cookie('username',username,{maxCode: 9999, httpOnly: true});
        res.redirect('/');
    }
    
});

app.post('/login',async (req,res)=>{
    const {username,code} = req.body;
    
    req.session.user = username;
    const isInBase = await api.getUserIdByUsersName(username);
    console.log("login "+isInBase);
    if(isInBase.length<1){
        res.redirect('/register');
    }else{
        let theCode = {};
        theCode = await api.getCodeByUserName(username);
        //theCode = JSON.stringify(theCode);
        console.log("db code: "+JSON.stringify(theCode)+ " body code: "+code);

        if(theCode[0].code == code){
            res.cookie('username',username,{maxCode: 9999, httpOnly: true});
            res.redirect('/');
        }else{
            res.status(400).send("Błędne Hasło");
        }
        
    }
    
    
});

app.get('/logout',(req,res)=>{
    req.session.destroy((err=>{
        if(err){
            console.error('Błąd podczas niszczenia sesji',err);
            return res.status(500).send('Nie udało się wylogować');
        }
        res.clearCookie('username');
        res.clearCookie('connect.sid');
        res.redirect('/');
    }));
});

app.delete('/comments/:id', async (req, res) => {
    const commentId = req.params.id;

    try {
        await api.deleteCommentById(commentId);
        res.sendStatus(200);
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.sendStatus(500);
    }
});


app.get('/posts/:id', async (req,res)=>{
    const postId = req.params.id;
    let usrName = 'nieznajomy'
    if(req.session.user){
        usrName = req.session.user;
    }else if(req.cookies.userName){
        usrName = req.cookies.usrname;
        req.session.user = usrName;
    }
    try{
        const user = await api.getUserIdByUsersName(usrName);
        const dbPost = await api.getPostById(postId);
        const dbComments = await api.getCommentsByPostId(postId);
        if(!dbPost || dbPost===1){
            return res.redirect('/')
        }
        const post = dbPost[0];
        if(usrName!=='nieznajomy'){
            let loggedInUserId = user[0].id;
            console.log(JSON.stringify(dbComments));
            res.render('post',{post:post,dbComments,loggedInUserId});
        }else if (usrName==='nieznajomy'){
            let loggedInUserId = 0;
            console.log(JSON.stringify(dbComments));
            res.render('post',{post:post,dbComments,loggedInUserId});
        }
        
    }catch(err){
        throw new Error(err);
    }
    
})

app.post('/post/:id', async (req, res) => {
    const postId = req.params.id;
    console.log("comment postId: " + postId);
    const { comment } = req.body;
    console.log("comment: " + comment);
    let usrName = 'nieznajomy';
    if (req.session.user) {
        usrName = req.session.user;
    } else if (req.cookies.userName) {
        usrName = req.cookies.usrname;
        req.session.user = usrName;
    }
    const user = await api.getUserIdByUsersName(usrName);
    console.log("comment userId: " + usrName);

    try {
        if (usrName === 'nieznajomy' && comment != null && comment.length >= 1) {
            const comN = { UserId: 0, comment: comment, PostId: postId, userName: usrName };
            await api.createCommentToPost(comN);
        } else if (usrName !== 'nieznajomy' && comment != null && comment.length >= 1) {
            const com = { UserId: user[0].id, comment: comment, PostId: postId, userName: usrName };
            await api.createCommentToPost(com);
        }

        res.sendStatus(200); 
    } catch (error) {
        console.error("Error creating comment:", error);
        res.sendStatus(500); 
    }
});

app.delete('/posts/:id', async (req, res) => {
    const postId = req.params.id;
    let usrName = 'nieznajomy'
    if(req.session.user){
        usrName = req.session.user;
    }else if(req.cookies.userName){
        usrName = req.cookies.usrname;
        req.session.user = usrName;
    }
    const postToDelete = await api.getPostById(postId);
    const user = await api.getUserIdByUsersName(usrName);
    console.log("postToDelete: "+postToDelete[0]);
    console.log("user "+user[0].id);
    try {

        if(user[0].id===postToDelete[0].userId){
                const isDeleted = await api.deletePostById(postId);
            if (isDeleted) {
                console.log("bylem tu")
                res.redirect('/');
            } else {
                res.status(500).send("Failed to delete post");
            }
        }else{
            res.redirect('/');
        }
        
        
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting post");
    }
});

app.put('/post/:id',async (req,res)=>{
    const postId = req.params.id;
    console.log("update post ID: "+postId);
    const { content,title} = req.body;
    //console.log("req body1 "+req.body);
    //console.log("req body "+req.body.content);
    let userName = 'Nieznajomy';
    //console.log("content: "+content);
    if(req.session.user){
        userName = req.session.user;
    }else if(req.cookies.userName){
        userName = req.cookies.username;
        req.session.user = userName;
    }
    const postToUpdate = await api.getPostById(postId);
    const userFromDb = await api.getUserIdByUsersName(userName); // corrected variable name
    //console.log("update:",postToUpdate[0] );
    //console.log("user:", userFromDb[0].id);
    try {

        if(userFromDb[0].id===postToUpdate[0].userId){
            const isUpdated = await api.updatePostByUserId(postId,content,title);
            if(isUpdated){
                res.redirect('/');
            }else{
                res.status(500).send('udpating error');
            }

        }else{
            res.redirect('/');
        }
        
        
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting post");
    }
})


app.listen(3000,()=>{console.log("server on 3000");});
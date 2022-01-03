const express = require('express')
const fileUpload = require('express-fileupload');
const app = express()
const accountFunctions = require('./account')
const movieFunctions = require('./movies')
const {json} = require("express");
const port = 3000

app.use(fileUpload());

//Login & Signup requests
app.get('/signup', async (req, res) => {
    let date = new Date();
    let timestamp = ` -- ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()} --`
    console.log(timestamp, "Case de signup")
    const jsonResponse = await accountFunctions.createAccount(req.query.name, req.query.password, req.query.email_address,req.query.date_of_birth);
    res.send(jsonResponse)
})

app.get('/login', async (req, res) => {
    let date = new Date();
    let timestamp = ` -- ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()} --`
    console.log(timestamp, "Case de login")
    const jsonResponse = await accountFunctions.loginAccount(req.query.email_address, req.query.password);
    res.send(jsonResponse)
})

//Token requests (on page refresh)
app.get('/validate-token', async (req, res) => {
    let date = new Date();
    let timestamp = ` -- ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()} --`
    console.log(timestamp, "Case de validare token")
    const  jsonResponse = await accountFunctions.validateToken(req.query.id, req.query.auth_token);
    res.send(jsonResponse)
})

app.get('/remove-token', async (req, res) => {
    let date = new Date();
    let timestamp = ` -- ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()} --`
    console.log(timestamp, "Case de remove-token")
    const jsonResponse = await accountFunctions.removeToken(req.query.email_address);
    res.send(jsonResponse)
})

//Profile page requests
app.get('/getuser', async (req, res) => {
    let date = new Date();
    let timestamp = ` -- ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()} --`
    console.log(timestamp, "Case de get user")
    const jsonResponse = await accountFunctions.retrieveUser(req.query.email_address);
    res.send(jsonResponse)
})

app.get('/change-email', async (req, res) => {
    let date = new Date();
    let timestamp = ` -- ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()} --`
    console.log(timestamp, "Case de change-email")
    const jsonResponse = await accountFunctions.changeEmail(req.query.id, req.query.email_address, req.query.token);
    res.send(jsonResponse)
})

app.get('/change-password', async (req, res) => {
    let date = new Date();
    let timestamp = ` -- ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()} --`
    console.log(timestamp, "Case de change-password")
    const jsonResponse = await accountFunctions.changePassword(req.query.id, req.query.password, req.query.token);
    res.send(jsonResponse)
})

app.get('/change-name', async (req, res) => {
    let date = new Date();
    let timestamp = ` -- ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()} --`
    console.log(timestamp, "Case de change-name")
    const jsonResponse = await accountFunctions.changeName(req.query.id, req.query.name, req.query.token);
    res.send(jsonResponse)
})

//Movies requests
//getters
app.get('/get-movies-by-date', async (req, res) => {
    let date = new Date();
    let timestamp = ` -- ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()} --`
    console.log(timestamp, "Case de get movies by date")
    const jsonResponse = await movieFunctions.getMoviesByDate(req.query.date);
    res.send(jsonResponse)
})

app.get('/get-movies', async (req, res) => {
    let date = new Date();
    let timestamp = ` -- ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()} --`
    console.log(timestamp, "Case de get movies")
    const jsonResponse = await movieFunctions.getMovies(req.query.title);
    console.log("gata")
    res.send(jsonResponse)
})

app.get('/get-image-from-movie', async (req, res) => {
    let date = new Date();
    let timestamp = ` -- ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()} --`
    console.log(timestamp, "Case de get image from movie")
    const jsonResponse = await movieFunctions.getImageFromMovie(req.query.title);
    res.end(jsonResponse)
})

app.get('/getsuggests', async (req, res) => {
    let date = new Date();
    let timestamp = ` -- ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()} --`
    console.log(timestamp, "Case de get suggestions")
    const jsonResponse = await movieFunctions.getSuggestions(req.query.id);
    res.send(jsonResponse)
})

//actions
app.get('/resetsuggests', async (req, res) => {
    let date = new Date();
    let timestamp = ` -- ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()} --`
    console.log(timestamp, "Case de reset suggestions")
    const jsonResponse = await movieFunctions.resetSuggestions(req.query.id);
    res.send(jsonResponse)
})

app.get('/increment-suggestions', async (req, res) => {
    let date = new Date();
    let timestamp = ` -- ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()} --`
    console.log(timestamp, "Case de increment suggestions")
    const jsonResponse = await movieFunctions.incrementSuggestions(req.query.id);
    res.send(jsonResponse)
})

app.post('/add-movie', async (req, res) => {
    let date = new Date();
    let timestamp = ` -- ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()} --`
    let img = req.files.image.data
    console.log(timestamp, "Case de add movie")
    const jsonResponse = await movieFunctions.addMovie(req.query.title, req.query.year, req.query.genre, req.query.duration, req.query.trailer_link, img);
    res.send(jsonResponse)
})

app.get('/schedule-movie', async (req, res) => {
    let date = new Date();
    let timestamp = ` -- ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()} --`
    console.log(timestamp, "Case de schedule movie")
    const jsonResponse = await movieFunctions.scheduleMovie( req.query.movie_title, req.query.hall, req.query.time, req.query.date,req.query.id, req.query.prices);
    res.send(jsonResponse)
})


app.get('/setTrending', async (req, res) => {
    let date = new Date();
    let timestamp = ` -- ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()} --`
    console.log(timestamp, "Case de set trending")
    const jsonResponse = await movieFunctions.setTrending(req.query.number, req.query.movie_ID);
    res.send(jsonResponse)
})

app.get('/getTrending', async (req, res) => {
    let date = new Date();
    let timestamp = ` -- ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()} --`
    console.log(timestamp, "Case de get trending")
    const jsonResponse = await movieFunctions.getTrending();
    res.send(jsonResponse)
})


app.listen(port, () => {
    console.log(`Sever is listening on port ${port}`)
})
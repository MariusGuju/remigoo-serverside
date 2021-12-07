const pool = require('./databasepg')
fs = require('fs');

function createAccount(name, password, email_address, date_of_birth){
    return (async () => {
        const client = await pool.connect()
        let Response = {
            error:true,
            code: 2,
            content: "database error"
        }
        try {
            const data = await client.query(`SELECT * FROM users WHERE email_address='${email_address}'`);
            const arr = data.rows;

            if(arr.length != 0){
                Response.code= 21;
                Response.content= 'Email already exists';

            } else {
                await client.query(`INSERT INTO users(name, password, email_address, date_of_birth)VALUES('${name}', '${password}', '${email_address}', '${date_of_birth}');`)
                Response.error=false;
                Response.content='success';
                Response.code=0;
            }
        } finally {
            client.release()
            return JSON.stringify(Response);
        }
    })().catch(err => console.log(err.stack))
}

function loginAccount(email_address, password){
    return (async () => {
        const client = await pool.connect()

        let Response = {
            error:true,
            code: 3,
            content: "database error"
        }
        try {
            const data = await client.query(`SELECT * FROM users WHERE email_address='${email_address}'`);
            const arr = data.rows[0];


            if(arr != undefined && password != arr.password){
                Response.code=5;
                Response.content='Wrong email or password ';
            }
            else {
                var date = new Date().getTime();
                let token = date + arr.email_address + "-AT"


                Response.error=false;
                Response.content={
                    token: token,
                    userEmail: arr.email_address,
                    userId: arr.id,
                    userName: arr.name
                };
                Response.code=0;

                client.query(`UPDATE public.users SET auth_token='${token}' WHERE id='${arr.id}'`);
            }

        } finally {
            client.release()
            return JSON.stringify(Response);
        }
    })().catch(err => console.log(err.stack))
}

function retrieveUser(email_address){
    return (async () => {
        const client = await pool.connect()
        let Response = {
            error:true,
            code: 6,
            content: "database error"
        }
        try {
            const data = await client.query(`SELECT * FROM users WHERE email_address='${email_address}'`);
            const arr = data.rows[0];
            if(arr === undefined){
                Response.code = 8;
                Response.content = `Email not found: ${email_address}`;
            }
            else {
                Response.error=false;
                Response.content= {
                    userName: arr.name,
                    userEmail: arr.email_address,
                    userId: arr.id
                };
                Response.code=0;
            }

        } finally {
            client.release()
            return JSON.stringify(Response);

        }
    })().catch(err => console.log(err.stack))
}

function changeEmail(id, new_email, token){
    return (async () => {
        const client = await pool.connect()
        let Response = {
            error:true,
            code: 9,
            content: "database error"
        }
        try {
            const isTokenValid = JSON.parse(await validateToken(id,token));
            if(isTokenValid.error===false){
                var data = await client.query(`UPDATE public.users SET email_address='${new_email}' WHERE id='${id}'`);

                if(data === undefined || data.rowCount === 0){
                    Response.code = 10;
                    Response.content = 'database error';
                    
                }
                else {
                    Response.error=false;
                    Response.content='success';
                    Response.code=0;
                }
            }
            else{
                Response = isTokenValid;
            }
            

        } finally {

            client.release()
            return JSON.stringify(Response);
        }
    })().catch(err => console.log(err.stack))
}

function changePassword(id, new_pass, token){
    return (async () => {
        const client = await pool.connect()
        let Response = {
            error:true,
            code: 13,
            content: "database error"
        }
        try {
            const isTokenValid = JSON.parse(await validateToken(id,token));
            if(isTokenValid.error===false){
                var data = await client.query(`UPDATE public.users SET password='${new_pass}' WHERE id='${id}'`);

                if(data === undefined || data.rowCount === 0){
                    Response.code = 10;
                    Response.content = 'database error';
                    
                }
                else {
                    Response.error=false;
                    Response.content='success';
                    Response.code=0;
                }
            }
            else{
                Response = isTokenValid;
            }
        }
        finally {
            client.release()
            return JSON.stringify(Response);
        }
    })().catch(err => console.log(err.stack))
}

function changeName(id, new_name, token){
    return (async () => {
        const client = await pool.connect() // o sa ne folosim de client pentru a ne conecta la baza de date (pool este definit in databasepg.js)
        let Response = {
            error:true,
            code: 1,
            content: "id error"
        }

        try {
            const isTokenValid = JSON.parse(await validateToken(id,token));
            if(isTokenValid.error===false){
                var data = await client.query(`UPDATE public.users SET name='${new_name}' WHERE id='${id}'`);

                if(data === undefined || data.rowCount === 0){
                    Response.code = 10;
                    Response.content = 'database error';
                    
                }
                else {
                    Response.error=false;
                    Response.content='success';
                    Response.code=0;
                }
            }
            else{
                Response = isTokenValid;
            }
        }
        finally {
            client.release() // si important sa avem client.release() la final, nu stiu de ce dar asa zice google
            return JSON.stringify(Response);
        }
    })().catch(err => console.log(err.stack))
}

function validateToken(id, token){
    return (async () => {
        const client = await pool.connect()
        let Response = {
            error:true,
            code: 11,
            content: "database error"
        }

        try {
            const data = await client.query(`SELECT * FROM users WHERE id='${id}'`);
            const arr = data.rows[0];

            if(arr === undefined){
                Response.code = 8;
                Response.content = `ID not found: ${id}`;
            } else if (token != arr.auth_token){
                Response.code = 16;
                Response.content = `Token not valid`;
            }
            else{
                Response.error=false;
                Response.content='Token is valid';
                Response.code=0;
            }

        } finally {
            client.release()
            return JSON.stringify(Response);

        }
    })().catch(err => console.log(err.stack))
}

function removeToken(email_address){
    return (async () => {
        const client = await pool.connect()
        let Response = {
            error:true,
            code: 11,
            content: "database error"
        }

        try {
            const data = await client.query(`UPDATE public.users SET auth_token=null WHERE email_address='${email_address}'`);  

            if(data != undefined && data.rowCount != 0){
                Response.content = "success"
                Response.error = false
                Response.code = 0;
            }

        } finally {
            client.release()
            return JSON.stringify(Response);

        }
    })().catch(err => console.log(err.stack))
}

function getSuggestions(id_film){
    return (async () => {
        const client = await pool.connect()
        let Response = {
            error:true,
            code: 11,
            content: "database error"
        }

        try {
            const data = await client.query(`SELECT * FROM public.movies WHERE id='${id_film}'`);
            const arr = data.rows[0];

            if(arr === undefined){
                Response.code = 8;
                Response.content = `ID not found: ${id_film}`;
            } else {
                Response.error=false;
                Response.content=Number(arr.suggestions);
                Response.code=0;
            }

        } finally {
            client.release()
            return JSON.stringify(Response);

        }
    })().catch(err => console.log(err.stack))
}

function resetSuggestions(id_film){
    return (async () => {
        const client = await pool.connect()
        let Response = {
            error:true,
            code: 11,
            content: "database error"
        }

        try {
            const data = await client.query(`UPDATE public.movies SET suggestions=0 WHERE id='${id_film}'`);  

            if(data != undefined && data.rowCount != 0){
                Response.content = "success"
                Response.error = false
                Response.code = 0;
            }

        } finally {
            client.release()
            return JSON.stringify(Response);

        }
    })().catch(err => console.log(err.stack))
}

function getMoviesByDate(date){
    return (async () => {
        const client = await pool.connect()
        let Response = {
            error:true,
            code: 11,
            content: "database error"
        }

        try {
            const data = await client.query(`SELECT * FROM public.schedule WHERE date='${date}'`);
            const arr = data.rows;
            let movies = [];
            for( let i = 0; i < arr.length; i++){
                movies[i] = arr[i].movie_title
            }

            if(arr[0] === undefined){
                Response.code = 8;
                Response.content = `No movies found in this date: ${date}`;
            } else {
                Response.error=false;
                Response.content=movies;
                Response.code=0;
            }

        } finally {
            client.release()
            return JSON.stringify(Response);

        }
    })().catch(err => console.log(err.stack))
}

function addMovie(title, year, genre, duration, trailer_link, data){
    return (async () => {
        const client = await pool.connect()
        let Response = {
            error:true,
            code: 2,
            content: "database error"
        }
        try {
            const temp = await client.query(`SELECT * FROM movies WHERE title='${title}'`);
            const arr = temp.rows;

            if(arr.length != 0){
                Response.code= 21;
                Response.content= 'Movie already exists';

            } else {
                console.log(`INSERT INTO movies(title, year, genre, duration, trailer_link, img)VALUES('${title}', '${year}', '${genre}', '${duration}', '${trailer_link}', '${data.toString('base64')}');`)
                fs.writeFile('helloworld.txt', `INSERT INTO movies(title, year, genre, duration, trailer_link, img)VALUES('${title}', '${year}', '${genre}', '${duration}', '${trailer_link}', '${data.toString('base64')}');`, function (err) {
                    if (err) return console.log(err);
                    console.log('Hello World > helloworld.txt');
                });
                const data2 = await client.query(`INSERT INTO movies(title, year, genre, duration, trailer_link, img)VALUES('${title}', '${year}', '${genre}', '${duration}', '${trailer_link}', '${data.toString('base64')}');`)
                console.log(data2)
                console.log("zzz")
                Response.error=false;
                Response.content='success';
                Response.code=0;
            }
        } finally {
            client.release()
            return JSON.stringify(Response);
        }
    })().catch(err => console.log(err.stack))
}

function getMovies(title){
    return (async () => {
        const client = await pool.connect()
        let Response = {
            error:true,
            code: 15 ,
            content: "database error"
        }
        try {
            const query = `
            SELECT DISTINCT Movies.id, Movies.title, Movies.year, Movies.genre, Movies.duration, Movies.trailer_link, Movies.suggestions,Schedule.date
                FROM Movies
                INNER JOIN Schedule ON Schedule.id = Movies.id
                where UPPER(Movies.title) LIKE '%' || UPPER('${title}') || '%';
            `
            const data = await client.query(query);
            const arr = data.rows;
            let result = {}

            arr.forEach((movie)=>{
                if(result[movie.id]){
                    result[movie.id].dates.push(movie.date)
                }
                else{
                    result[movie.id] = movie
                    result[movie.id].dates = [movie.date]
                }
            })


            if(arr.length === 0){
                Response.code= 21;
                Response.content= 'Movie does not exist';

            } else {
                Response.error=false;
                Response.content=result;
                Response.code=0;
            }
        } finally {
            client.release()
            return JSON.stringify(Response);
        }
    })().catch(err => console.log(err.stack))
}

function getImageFromMovie(title){
    return (async () => {
        const client = await pool.connect()
        let arr;
        let Response = {
            error:true,
            code: 15 ,
            content: "database error"
        }
        try {
            const data = await client.query(`SELECT img FROM movies WHERE title='${title}'`);


            arr = data.rows[0];


            if(arr.length === 0){
                Response.code= 21;
                Response.content= 'image does not exist';

            } else {
                Response.error=false;
                Response.content=movies;
                Response.code=0;
            }
        } finally {
            client.release()
            return arr.img;
        }
    })().catch(err => console.log(err.stack))
}



module.exports = {retrieveUser, loginAccount, createAccount, changeEmail, changePassword, changeName, validateToken, removeToken, getSuggestions, resetSuggestions, getMoviesByDate, addMovie, getMovies, getImageFromMovie}
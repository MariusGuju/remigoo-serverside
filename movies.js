const pool = require('./databasepg')
fs = require('fs');

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
            SELECT DISTINCT Movies.id, Movies.title, Movies.year, Movies.genre, Movies.duration, Movies.trailer_link, Movies.suggestions,Schedule.date,Movies.img
                FROM Movies
                INNER JOIN Schedule ON Schedule.id = Movies.id
                where UPPER(Movies.title) LIKE '%' || UPPER('${title}') || '%';
            `
            const data = await client.query(query);
            const arr = data.rows;

            let catalog = {}
            arr.forEach((movie)=>{
                if(catalog[movie.id]){
                    catalog[movie.id].dates.push(movie.date)
                }
                else{
                    catalog[movie.id] = movie
                    catalog[movie.id].dates = [movie.date]
                }
            })

            var result = []

            for(let key in catalog){
                result.push(catalog[key])
            }

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


module.exports = {getSuggestions, resetSuggestions, getMoviesByDate, addMovie, getMovies, getImageFromMovie}
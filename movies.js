const pool = require('./databasepg')
fs = require('fs');
const S3 = require('aws-sdk/clients/s3');
const AWS = require('aws-sdk');

const amazonEndpoint = new AWS.Endpoint('s3.eu-central-1.amazonaws.com');
const accessKeyId = 'AKIAUEF23F7HBMPH3P7S';
const secretAccessKey = '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';





const s3 = new S3({
    endpoint: amazonEndpoint,
    region: 'eu-central-1',
    accessKeyId,
    secretAccessKey
});

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

function incrementSuggestions(id_film){
    return (async () => {
        const client = await pool.connect()
        let Response = {
            error:true,
            code: 11,
            content: "database error"
        }

        try {
            const data = await client.query(`UPDATE public.movies SET suggestions=suggestions+1 WHERE id='${id_film}'`);
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

            const query = `
            SELECT DISTINCT Movies.id, Movies.title, Movies.year, Movies.genre, Movies.duration, Movies.trailer_link, Movies.suggestions,Movies.img
                FROM Movies
                RIGHT JOIN Schedule ON Schedule.id = Movies.id
                where date='${date}'
            `
            const data = await client.query(query);

            const arr = data.rows;



            if(arr.length === 0){
                Response.code= 21;
                Response.content= 'Movie does not exist';

            } else {
                Response.error=false;
                Response.content=arr;
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
        let object_upload_params = {
            Bucket: "remigoo",
            ContentType: "image/jpeg",
            Key: "",
            Body: ""
        };
        try {
            const temp = await client.query(`SELECT * FROM movies WHERE title='${title}'`);
            const arr = temp.rows;

            if(arr.length != 0){
                Response.code= 21;
                Response.content= 'Movie already exists';

            } else {

                const data2 = await client.query(`INSERT INTO movies(title, year, genre, duration, trailer_link, img)VALUES('${title}', '${year}', '${genre}', '${duration}', '${trailer_link}', 'https://remigoo.s3.eu-central-1.amazonaws.com/${title}.png');`)


                console.log('aici')
                console.log(data)
                object_upload_params.Body=data;
                object_upload_params.Key=title+'.png';
                s3.putObject(object_upload_params, function (err, data) {
                    if (err) console.log(err, err.stack); // an error occurred
                    else console.log(data);           // successful response
                });

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



function scheduleMovie( movie_title, hall, time, date, id, prices){
    return (async () => {
        const client = await pool.connect()
        let Response = {
            error:true,
            code: 2,
            content: "database error"
        }
        try {
            const data = await client.query(`INSERT INTO schedule(movie_title, hall, time, date, id, prices) VALUES('${movie_title}', '${hall}', '${time}', '${date}', '${id}', '${prices}')`);
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
                LEFT JOIN Schedule ON Schedule.id = Movies.id
                where UPPER(Movies.title) LIKE '%' || UPPER('${title}') || '%'
                LIMIT 7;
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
            const a = await client.query(`SELECT img FROM movies WHERE title='${title}'`);
            arr = a.rows[0];



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






module.exports = {getSuggestions, resetSuggestions, getMoviesByDate, addMovie, scheduleMovie, getMovies, getImageFromMovie, incrementSuggestions}
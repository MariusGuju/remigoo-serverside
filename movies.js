const pool = require('./databasepg')
fs = require('fs');
const S3 = require('aws-sdk/clients/s3');
const AWS = require('aws-sdk');
const {values} = require("pg/lib/native/query");

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
            const data = await client.query(`UPDATE public.movies SET suggestions =  suggestions::integer + 1 WHERE id='${id_film}'`);
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
            SELECT DISTINCT ON(Schedule.time) Schedule.time, Schedule.hall, Schedule.tickets, Movies.id, Movies.title, Movies.year, Movies.genre, Movies.duration, Movies.trailer_link, Movies.suggestions,Movies.img
                FROM Movies
                RIGHT JOIN Schedule ON Schedule.Movie_id = Movies.id
                where date='${date}'
            `
            const data = await client.query(query);
            const res = [];
            const arr = data.rows;

            console.log(arr)
            let contor
            arr.forEach(function (value, index) {
                value.time = value.time + "-" + value.hall
                delete value['hall']
                contor = 0
                if(value.tickets != null){
                    value.tickets.forEach(function (val, index) {
                        if(val != 0) contor++
                    })
                    value.time = value.time + "-" + contor + "/84"
                }else{
                    value.time = value.time + "-0/84"
                }
            });


            arr.forEach(function (value, i) {
                let check = true;
                res.forEach(function (item, index) {
                    if(value.id == item.id){
                        check=false;
                    }
                });
                if(check) res.push(value)
            });

            res.forEach(function (value, index) {
                value.time = getHours(value.id,arr)
            });


            if(arr.length === 0){
                Response.code= 21;
                Response.content= 'Movie does not exist';

            } else {
                Response.error=false;
                Response.content=res;
                Response.code=0;
            }

        } finally {
            client.release()
            return JSON.stringify(Response);

        }
    })().catch(err => console.log(err.stack))
}


function getMoviesByID(ID){
    return (async () => {
        const client = await pool.connect()
        let Response = {
            error:true,
            code: 11,
            content: "database error"
        }

        try {

            //query pentru a gasi filmul doar
            const query = `
            SELECT *
                FROM Movies
                WHERE Movies.id='${ID}'
            `

            const data = await client.query(query);
            const arr = data.rows[0];



            //query pentru a gasi toate schedule de la film respectiv
            const query2 = `
            SELECT Schedule.id, Schedule.tickets, Schedule.date, Schedule.time, Schedule.hall
                FROM Schedule
                where Schedule.movie_id='${ID}'
            `

            const data2 = await client.query(query2);
            const arr2 = data2.rows;

            Response.content ={
                movie: arr,
                schedule: []
            }

            Response.content.schedule = arr2


            if(data.rows.length === 0){
                Response.code= 21;
                Response.content= 'Movie does not exist';

            } else {
                Response.error=false;
                Response.code=0;
            }

        } finally {
            client.release()

            return JSON.stringify(Response);

        }
    })().catch(err => console.log(err.stack))
}

function getHours(itemID, arr){
    let string = "";
    arr.forEach(function (item, index) {
        if(item.id == itemID && string == ""){
            string = string  + item.time ;
        }else if(item.id == itemID){
            string = string + ", " + item.time
        }
    });
    return string
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


                object_upload_params.Body=data;
                object_upload_params.Key=title+'.png';
                s3.putObject(object_upload_params, function (err, data) {
                    if (err) console.log(err, err.stack); // an error occurred
                    else console.log(data);           // successful response
                });

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


function scheduleMovie( movie_title, hall, time, date, id, prices, movie_id){
    return (async () => {
        const client = await pool.connect()
        let Response = {
            error:true,
            code: 2,
            content: "database error"
        }
        try {
            let Tickets = Array(84).fill(0);
            const tickets_query = `{${Tickets}}`

            const data = await client.query(`INSERT INTO schedule(movie_title, hall, time, date, movie_id, id,tickets, prices) VALUES('${movie_title}', '${hall}', '${time}', '${date}',${movie_id}, ${id},'${tickets_query}' , '${prices}')`);

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
                LEFT JOIN Schedule ON Schedule.movie_id = Movies.id
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




function setTrending(number, movie_ID){
    return (async () => {
        const client = await pool.connect()
        let Response = {
            error:true,
            code: 22,
            content: "database error"
        }

        try {
            const data = await client.query(`UPDATE public.trending SET "movie_ID"='${movie_ID}' WHERE number='${number}'`);

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

function getTrending(){
    return (async () => {
        const client = await pool.connect()
        let Response = {
            error:true,
            code: 22,
            content: "database error"
        }

        try {
            const data = await client.query(`SELECT id,title,year,img,genre,number FROM movies INNER JOIN trending ON cast(movies.id as bigint)=trending."movie_ID"`);
            const trending = {};

            data.rows.forEach(row => {
                trending[row.number] = row;
                delete trending[row.number].number;
            });

            if(data != undefined && data.rowCount != 0){
                Response.content = trending
                Response.error = false
                Response.code = 0;
            }

        } finally {
            client.release()
            return JSON.stringify(Response);

        }
    })().catch(err => console.log(err.stack))
}




function addTicket(nume, id, seats, user, price){
    return (async () => {
        const client = await pool.connect()
        let Response = {
            error:true,
            code: 2,
            content: "database error"
        }

        try {
            let check = true;
            const data = await client.query(`SELECT * FROM schedule WHERE schedule.id='${id}'`);
            let str = "{"
            const temp = data.rows[0];
            if(typeof seats === 'object'){
                for (let i = 0; i < seats.length; i++) {
                    if((temp.tickets[seats[i]-1])!=0){
                        check= false;
                    }
                }
            }else if(typeof seats === 'string'){
                if((temp.tickets[seats-1])!=0){
                    check= false;
                }
            }

            if(!check){
                Response.code= 21;
                Response.content= 'Seat(s) taken';

            } else {

                if(typeof seats === 'object'){
                    for( let i = 0 ; i < seats.length ; i++ )
                        str = str + seats[i] + (i === seats.length-1 ? "}" : ",")
                }else if(typeof seats === 'string'){
                   str = str + seats + "}"
                }


                const data2 = await client.query(`INSERT INTO tickets(name, movie_title, date, "time", hall,  schedule_id, seats, price)VALUES ('${nume}', '${temp.movie_title}', '${temp.date}', '${temp.time}', '${temp.hall}', '${temp.id}', '${str}', '${price}') RETURNING tickets.id;`)

                if(typeof seats === 'object'){
                    for (let i = 0; i < seats.length; i++) {
                        temp.tickets[seats[i]-1] = data2.rows[0].id
                    }
                }else if(typeof seats === 'string'){
                    temp.tickets[seats-1] = data2.rows[0].id
                }


                str = "{"
                for( let i = 0 ; i < temp.tickets.length ; i++ )
                    str = str + temp.tickets[i] + (i === temp.tickets.length-1 ? "}" : ",")


                const data3 = await client.query(`UPDATE schedule SET tickets = '${str}' WHERE schedule.id ='${id}' `)

                if(user !== -1){
                    const data4 = await client.query(`UPDATE users SET tickets = array_append(tickets, ${data2.rows[0].id}) WHERE id ='${user}' `)
                }


                Response.error=false;
                Response.content=data2.rows[0].id;
                Response.code=0;
            }
        } finally {
            client.release()
            return JSON.stringify(Response);
        }
    })().catch(err => console.log(err.stack))
}

function getAvailableHoursByDate(date){
    return (async () => {
        const client = await pool.connect()
        let Response = {
            error:true,
            code: 11,
            content: "database error"
        }
        let allAvailableHours = ['08:00','10:30','13:00','18:00','20:30','23:00']
        let hoursFromHall1 = []
        let hoursFromHall2 = []
        try {
            const data = await client.query(`SELECT * FROM public.schedule WHERE date='${date}'`);
            const arr = data.rows;


            arr.forEach(function (value, index) {
                if(value.hall === '1'){
                    hoursFromHall1.push(value.time)
                }else if(value.hall === '2'){
                    hoursFromHall2.push(value.time)
                }

            });

            hoursFromHall1 = allAvailableHours.filter(x => !hoursFromHall1.includes(x))
            hoursFromHall2 = allAvailableHours.filter(x => !hoursFromHall2.includes(x))

            if(hoursFromHall1.length === 0){
                hoursFromHall1[0] = 'none'
            }
            if(hoursFromHall2.length === 0){
                hoursFromHall1[0] = 'none'
            }

            Response.error=false;
            Response.content = {
                hall_1: hoursFromHall1,
                hall_2: hoursFromHall2
            };
            Response.code=0;

        } finally {
            client.release()
            return JSON.stringify(Response);

        }
    })().catch(err => console.log(err.stack))
}


function getTicketById(id){
    return (async () => {
        const client = await pool.connect()
        let Response = {
            error:true,
            code: 11,
            content: "database error"
        }
        try {
            const data = await client.query(`SELECT * FROM tickets where id='${id}'`);
            const arr = data.rows[0];

            Response.content = arr;

            if(data.rows.length === 0){
                Response.code= 21;
                Response.content= 'Ticket does not exist';

            } else {
                Response.error=false;
                Response.code=0;
            }

        } finally {
            client.release()

            return JSON.stringify(Response);

        }
    })().catch(err => console.log(err.stack))
}

module.exports = {getSuggestions, resetSuggestions, getMoviesByDate, addMovie, scheduleMovie, getMovies, getMoviesByID, getImageFromMovie, incrementSuggestions, setTrending, getTrending, addTicket, getAvailableHoursByDate, getTicketById}


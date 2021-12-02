const pool = require('./databasepg')

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
            } else {
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

function changeEmail(id, email_nou){
    return (async () => {
        const client = await pool.connect()
        let Response = {
            error:true,
            code: 9,
            content: "database error"
        }
        try {
            const data = await client.query(`UPDATE public.users SET email_address='${email_nou}' WHERE id='${id}'`);

            if(data === undefined || data.rowCount === 0){
                Response.code = 10;
                Response.content = 'database error';
            }
            else {
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

function changePassword(id, pass_nou){
    return (async () => {
        const client = await pool.connect()
        let Response = {
            error:true,
            code: 13,
            content: "database error"
        }
        try {
            const data = await client.query(`UPDATE public.users SET password='${pass_nou}' WHERE id='${id}'`);

            // verificam daca am primit raspuns de la baza de date, si daca a fost vreun row afecatat de schimbare
            if(data != undefined && data.rowCount != 0){
                Response.content = "success"
                Response.error = false
                Response.code = 0;
            }
        }
        finally {
            client.release()
            return JSON.stringify(Response);
        }
    })().catch(err => console.log(err.stack))
}

function changeName(id, nume_nou){
    return (async () => {
        const client = await pool.connect() // o sa ne folosim de client pentru a ne conecta la baza de date (pool este definit in databasepg.js)
        let Response = {
            error:true,
            code: 1,
            content: "id error"
        }

        try {
            const data = await client.query(`UPDATE public.users SET name='${nume_nou}' WHERE id='${id}'`);  // facem query spre baza de date, si raspunsul bazei de date il stocam in data
            if(data != undefined && data.rowCount != 0){
                Response.content = "success"
                Response.error = false
                Response.code = 0;
            }

        }
        finally {
            client.release() // si important sa avem client.release() la final, nu stiu de ce dar asa zice google
            return JSON.stringify(Response);
        }
    })().catch(err => console.log(err.stack))
}





module.exports = {retrieveUser, loginAccount, createAccount, changeEmail, changePassword, changeName}
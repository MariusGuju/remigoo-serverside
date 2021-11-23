const pool = require('./databasepg')


function createAccount(name, password, email_address, date_of_birth){
    return (async () => {
        const client = await pool.connect()
        console.log("A intrat in createAccount()")
        var jsonResponse;
        try {
            let fullResponse = {
                error:false,
                code: 0,
                content: "User added to database"
                }

            // verificam daca email exista deja in baza de date
          const data = await client.query(`SELECT * FROM users WHERE email_address='${email_address}'`);  
          const arr = data.rows;

          if(arr.length != 0){
              fullResponse.error=true;
              fullResponse.code='ceva';
              fullResponse.content='Email-ul exista deja in baza de date';
              jsonResponse = JSON.stringify(fullResponse);
          } else {

            await client.query(`INSERT INTO users(name, password, email_address, date_of_birth)VALUES('${name}', '${password}', '${email_address}', '${date_of_birth}');`)
            jsonResponse = JSON.stringify(fullResponse);
          }
        } finally {


          if(jsonResponse == undefined)
            jsonResponse = JSON.stringify({
              error:true,
              code: 0,
              content: "database error"
              });
          return jsonResponse;
          client.release()
        }
      })().catch(err => console.log(err.stack))
}


function loginAccount(email_address, password){
  return (async () => {
      const client = await pool.connect() 
      console.log("A intrat in loginAccount()")
      var jsonResponse;
      try {
          let fullResponse = {
              error:false,
              code: 0,
              content: "Login succesful"
              }
          // verificam daca email exista deja in baza de date
        const data = await client.query(`SELECT * FROM users WHERE email_address='${email_address}'`);  
        const arr = data.rows[0];

        if(arr != undefined && password == arr.password){

          jsonResponse = JSON.stringify(fullResponse);
        } else {
          
          fullResponse.error=true;
          fullResponse.code='ceva';
          fullResponse.content='Email-ul sau parola gresite';
          jsonResponse = JSON.stringify(fullResponse);
        }

      } finally {

        if(jsonResponse == undefined)
          jsonResponse = JSON.stringify({
            error:true,
            code: 0,
            content: "database error"
            });
        return jsonResponse;
        client.release()
      }
    })().catch(err => console.log(err.stack))
}

function retrieveUser(email_address){
  return (async () => {
      const client = await pool.connect()
      console.log("A intrat in retrieveUser()")
      var jsonResponse;
      try {
          let fullResponse = {
              error:true,
              code: 0,
              content: "Email not found"
              }
          // verificam daca email exista deja in baza de date
        const data = await client.query(`SELECT * FROM users WHERE email_address='${email_address}'`);  
        const arr = data.rows[0];

        if(arr != undefined){

          fullResponse.error = false;
          fullResponse.content = arr;
          jsonResponse = JSON.stringify(fullResponse);
        } else {

          jsonResponse = JSON.stringify(fullResponse);
        }
        
      } finally {

        if(jsonResponse == undefined)
          jsonResponse = JSON.stringify({
            error:true,
            code: 0,
            content: "database error"
            });

        return jsonResponse;
        client.release()
      }
    })().catch(err => console.log(err.stack))
}

function changeEmail(id, email_nou){
  return (async () => {
      const client = await pool.connect()
      console.log("A intrat in changeEmail()")
      var jsonResponse;
      try {
          let fullResponse = {
              error:false,
              code: 0,
              content: "Email schimbat cu succes"
              }
        
        const data = await client.query(`UPDATE public.users SET email_address='${email_nou}' WHERE id='${id}'`);  

          // verificam daca am primit raspuns de la baza de date, si daca a fost vreun row afecatat de schimbare
        if(data != undefined && data.rowCount != 0){
          jsonResponse = JSON.stringify(fullResponse);

        } else {
          fullResponse.error = true;
          fullResponse.content = 'database error';
          jsonResponse = JSON.stringify(fullResponse);
        }
        
      } finally {

          if(jsonResponse == undefined)
            jsonResponse = JSON.stringify({
              error:true,
              code: 0,
              content: "database error"
              });
              
        return jsonResponse;
        client.release()
      }
    })().catch(err => console.log(err.stack))
}


function changePassword(id, pass_nou){
  return (async () => {
      const client = await pool.connect()
      console.log("A intrat in changePassword()")
      var jsonResponse;
      try {
          let fullResponse = {
              error:false,
              code: 0,
              content: "Parola schimbat cu succes"
              }
        
        const data = await client.query(`UPDATE public.users SET password='${pass_nou}' WHERE id='${id}'`);  

          // verificam daca am primit raspuns de la baza de date, si daca a fost vreun row afecatat de schimbare
        if(data != undefined && data.rowCount != 0){
          jsonResponse = JSON.stringify(fullResponse);

        } else {
          fullResponse.error = true;
          fullResponse.content = 'database error';
          jsonResponse = JSON.stringify(fullResponse);

        }
        
      } finally {
        
        if(jsonResponse == undefined)
          jsonResponse = JSON.stringify({
            error:true,
            code: 0,
            content: "database error"
            });

        return jsonResponse;
        client.release()
      }
    })().catch(err => console.log(err.stack))
}


function changeName(id, nume_nou){
  return (async () => {

      const client = await pool.connect() // o sa ne folosim de client pentru a ne conecta la baza de date (pool este definit in databasepg.js)
      console.log("A intrat in changeName()")  // doar verific sa stiu daca a intrat in functia corecta, am avut niste probleme la export si am lasat console.log asta sa fiu sigur
      var jsonResponse; // jsonResponse va fii dat la sfarsitul functiei ca si return

      try {
          // fullResponse este template pt response, asta o sa ii dam ca si response lui mihai, doar ca in forma de json
          let fullResponse = {
              error:false,
              code: 0,
              content: "Nume schimbat cu succes"
              }
        
        const data = await client.query(`UPDATE public.users SET name='${nume_nou}' WHERE id='${id}'`);  // facem query spre baza de date, si raspunsul bazei de date il stocam in data

          // verificam daca am primit raspuns de la baza de date, si daca a fost vreun row afecatat de schimbare
        if(data != undefined && data.rowCount != 0){
          jsonResponse = JSON.stringify(fullResponse); // daca am primit raspuns de la baza de date si macar un row din baza de date a fost afectat, ii atribuim lui jsonResponse
                                                       // fullResponse de mai sus (in forma json), nemodificat ( presupunem ca numele a fost schimbat cu succes )

          // daca nu am primit raspuns de la baza de date (data == undefined), sau daca nu a fost nici un row din baza de date afectat ( data.rowCount == 0 ), inseamna ca query-ul n-a funtionat
          // si modificat template-ul ca sa ii spunem lui mihai ca a fost o eroare la baza de date, si dupa punem in jsonResponse fullResponse-ul modificat (in forma json)                                             
        } else {
          fullResponse.error = true;
          fullResponse.content = 'database error';
          jsonResponse = JSON.stringify(fullResponse);

        }
        
      } finally {

        // finally asta e aici, ca in cazul in care query de mai sus pusca, fiind in try, o sa se opreasca tot try si o sa se ruleze direct acest finally, in care modificam doar template
        // sa-i spunem lui mihaitza ca a fost o eroare

        if(jsonResponse == undefined)
          jsonResponse = JSON.stringify({
            error:true,
            code: 0,
            content: "database error"
            });

        
        return jsonResponse; // returnam la final jsonResponse care trb sa contina un JSON.stringify(fullResponse)
        client.release() // si important sa avem client.release() la final, nu stiu de ce dar asa zice google
      }
    })().catch(err => console.log(err.stack))
}





module.exports = {retrieveUser, loginAccount, createAccount, changeEmail, changePassword, changeName}
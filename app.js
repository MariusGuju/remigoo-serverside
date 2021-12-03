const http = require('http')
const url = require('url')
const pool = require('./databasepg')
const accountFunctions = require('./account')
const port = 3000


const server = http.createServer(async function(req, res) {
    
    // control for favicon
    if (req.url === '/favicon.ico') {
        res.writeHead(200, {'Content-Type': 'image/x-icon'} );
        res.end();
        return;
    }

    const queryObject = url.parse(req.url,true).query;   // url query

    // exemplu de query http://localhost:3000/page?type=getuser&email_address=flo29@yahoo.com
    // un queryObject.type va returna getuser, queryObject.email_address va returna flo29@yahoo.com s.a.m.d.


    var jsonResponse = null;
    let date = new Date();
    let timestamp = ` -- ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()} --`

    switch(queryObject.type){
      case 'signup':
        console.log(timestamp,"Case de signup")
        jsonResponse = await accountFunctions.createAccount(queryObject.name, queryObject.password, queryObject.email_address, queryObject.date_of_birth);
        break;

      case 'login':
        console.log(timestamp,"Case de login")
        jsonResponse = await accountFunctions.loginAccount(queryObject.email_address, queryObject.password);
        break;

      case 'validate-token':
        console.log(timestamp,"Case de validare token")
        jsonResponse = await accountFunctions.validateToken(queryObject.id, queryObject.auth_token);
      break;

      case 'getuser':
        console.log(timestamp,"Case de getuser")
        jsonResponse = await accountFunctions.retrieveUser(queryObject.email_address);
        break;

      case 'change-email':
        console.log(timestamp,"Case de change-email")
        jsonResponse = await accountFunctions.changeEmail(queryObject.id, queryObject.email_address, queryObject.token);
        break;

      case 'change-password':
        console.log(timestamp,"Case de change-password")
        jsonResponse = await accountFunctions.changePassword(queryObject.id, queryObject.password, queryObject.token);
        break;

      case 'change-name':
        console.log(timestamp,"Case de change-name")
        jsonResponse = await accountFunctions.changeName(queryObject.id, queryObject.name, queryObject.token);
        break;

      case 'remove-token':
        console.log(timestamp,"Case de remove-token")
        jsonResponse = await accountFunctions.removeToken(queryObject.email_address);
        break;

      case 'getsuggests':
        console.log(timestamp,"Case de get suggestions")
        jsonResponse = await accountFunctions.getSuggestions(queryObject.id);
        break;

      case 'resetsuggests':
        console.log(timestamp,"Case de reset suggestions")
        jsonResponse = await accountFunctions.resetSuggestions(queryObject.id);
        break;
    }

    res.write(jsonResponse==null ? 'Case unknown / doSomething' : jsonResponse)
    res.end()

})

server.listen(port, function(error) {
    if(error){
        console.log('Something went wrong', error)
    } else {
        console.log('Sever is listening on port ' + port)
    }
})

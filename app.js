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

    var jsonResponse = null;
    switch(queryObject.type){
      case 'signup':
        console.log("Case de signup")
        jsonResponse = await accountFunctions.createAccount(queryObject.name, queryObject.password, queryObject.email_address, queryObject.date_of_birth);
        break;

      case 'login':
        console.log("Case de login")
        jsonResponse = await accountFunctions.loginAccount(queryObject.email_address, queryObject.password);
        break;

      case 'getuser':
        console.log("Case de getuser")
        jsonResponse = await accountFunctions.retrieveUser(queryObject.email_address);
        break;

      case 'change-email':
        console.log("Case de change-email")
        jsonResponse = await accountFunctions.changeEmail(queryObject.id, queryObject.email_address);
        break;

      case 'change-password':
        console.log("Case de change-password")
        jsonResponse = await accountFunctions.changePassword(queryObject.id, queryObject.password);
        break;

      case 'change-name':
        console.log("Case de change-name")
        jsonResponse = await accountFunctions.changeName(queryObject.id, queryObject.name);
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

// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();

const dialogflow = require('dialogflow');
const uuid = require('uuid');

const bodyParser = require('body-parser')
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
  extended: true
}));

// -------- Sessions Client -------
const projectId = 'gmtel-wnklwu';
const sessionId = uuid.v4();
const sessionClient = new dialogflow.SessionsClient();
const sessionPath = sessionClient.sessionPath(projectId,sessionId);
console.log(sessionPath);

// -------- Intents Client -------
const intentsClient = new dialogflow.IntentsClient();
const projectAgentPath = intentsClient.projectAgentPath(projectId);

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/chat.html");
});

app.post('/detectIntent',function(request,response){
  
  let texto = request.body.texto;
  
  const query = {
    session: sessionPath,
    queryInput:{
      text: {      
          text: texto,
          languageCode: 'pt'
      }
    }
  }
  
    sessionClient.detectIntent(query)
    .then((res)=>{
    response.json(res)
    
  })
  .catch(err => console.log(err))
})


// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

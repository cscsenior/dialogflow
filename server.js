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

app.get("/chat", (request, response) => {
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


app.get('/listarIntents', async function(request,response){
  let [results] = await listarIntents();
  let html = "<TABLE border=1>";
  
  results.forEach((item)=>{
    
    html += "<TR><TD>" + item.displayName + "</TD>"
    
    //Training Phrases
    item.trainingPhrases.forEach((training)=>{
      training.parts.forEach((part)=>{
        
        html += "<TD> Intenção: " + part.text + "</TD>"
        
      })
    })
    // Resposta Padrao
    item.messages.forEach((message)=>{
      html += "<TR><TD> Resposta Padrão ==> " + message.text.text + "</TD><TR>"
    })
  })
  
  html += "</TABLE>"
  
  response.send(html);
  
  
});

async function listarIntents() {
  let params = {
    parent: projectAgentPath,
    intentView: 'INTENT_VIEW_FULL'
  }
  const results = await intentsClient.listIntents(params);
  return results;
}

// Criar Intent
app.get('/criarIntent',async function(request,response){
  
  let resultado = await criarIntent();
  
  response.json(resultado);
  
  
})

async function criarIntent(){
  
  let frases = [
    {
      type: 'EXAMPLE',
      parts: [
        {
          text: "como agendar aula"
        },
        {
          text: "hoje",
          entityType: "@sys.date-time",
          alias: "data-agendamento"
        }
      ]
    },
    {
      type: 'EXAMPLE',
      parts: [
        {
          text: "fazer aula"
        }
      ]
    }
  ]
    
  let respostas = [
    {
      text: {
        text: ["Sua aula foi agendada","Aula agendada com sucesso"]
      }
    }
  ]
  
  let parametros = [
    {
      displayName: "data-agendamento",
      entityTypeDisplayName: "@sys.date-time",
      mandatory: true,
      prompts: ["Para quando vocer quer a aula","Quando seria a aula"]
    }
  ]
  
  
  let intent = {
    displayName: 'agendar.aula',
    webhookState: 'WEBHOOK_STATE_UNSPECIFIED',
    trainingPhrases: frases,
    messages: respostas,
    parameters: parametros
  }
  
  let params = {
    parent: projectAgentPath,
    intent: intent
  }
  
  const [result] = await intentsClient.createIntent(params);
  
  console.log(result);
  
  return result;

}


// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

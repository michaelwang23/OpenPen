var express = require('express');

const bodyParser = require("body-parser");
const mongoose = require("mongoose");
var AYLIENTextAPI = require('aylien_textapi');


var app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static(__dirname + '/public'));


//mongoose.connect("mongodb://localhost:27017/openpenDB", {
mongoose.connect("mongodb+srv://admin-michael:Test123@cluster0-sajsa.mongodb.net/openpenDB", {
  useNewUrlParser: true
});

const entrySchema = {
  name: String,
  message: String
};

const Entry = mongoose.model("Entry", entrySchema);

const entry1 = new Entry({
  name: 'michael',
  message: "hello world"
});

const listSchema = {
  name: String,
  items: [entrySchema]
};

const list = mongoose.model("List", listSchema);

const summarizedSchema = {
  original: String,
  new: String
}

const Summary = mongoose.model("Summary", summarizedSchema)

const errorSchema = {
  message: String
}

const Error = mongoose.model("Error", errorSchema)


app.get('/', function (req, res){

  Summary.deleteMany({}, function(err){
    if (err) console.log(err);
  });

  Error.deleteMany({}, function(err){
    if (err) console.log(err);
  });

  Entry.find({}, function(err, foundItems) {
    res.render('index', {
      newEntries: foundItems,
      name: "",
      message: ""
    });
  });



});

app.get('/index', function(req, res){
  res.redirect("/");
});

app.get('/about', function(req, res){
  res.render('about');
});

app.get('/error', function(req, res){
  res.render('error')
})


app.get('/summarize', function(req, res){
    Summary.find({}, function(err, foundItems){
      res.render('summarize', {
        newEntries: foundItems
      })
    })

})

app.post('/summarizeText', function(req, res){
  const text = req.body.text;
  var textapi = new AYLIENTextAPI({
    application_id: "46c10558",
    application_key: "03f5ba53494a7e60b7ec3346d3e004ac"
  });

  //find the main concept with concepts
  textapi.concepts({
      text: text
  }, 
  function(error, response) {
    if (error === null) {
      var arr = []
      Object.keys(response.concepts).forEach(function(concept) {
        var surfaceForms = response.concepts[concept].surfaceForms.map(function(sf) {
          return sf['string'];
        });
        arr.push(surfaceForms);
      });
      var title = arr[0].toString();
      textapi.summarize({
        title: title,
        text: text,
        sentences_number: 3
      }, 
      function(error, response) {
        if (error === null) {
          summarizedText = response.sentences
          summarizedText = summarizedText.toString()
      
          var item = new Summary ({
            original: req.body.text,
            new: summarizedText
          });
          item.save();
          res.redirect('/summarize')
        }
        else {
          console.log(error)
        }
      });
    }
  })
})


app.post('/contact', function(req, res){
  const entryName = req.body.txtName;
  const entryMessage = req.body.txtMsg;

  var textapi = new AYLIENTextAPI({
    application_id: "46c10558",
    application_key: "03f5ba53494a7e60b7ec3346d3e004ac"
  });

  textapi.sentiment({
    text: entryMessage,
    mode: 'tweet'
  }, 
  function(error, response) {
    if (error === null) {
      if (response.polarity === "negative"){
        res.redirect("/error");
      }
      else {
        var item = new Entry({
          name: entryName,
          message: entryMessage
        });
        item.save();
        res.redirect("/");
      }
    }
  });
});

app.post('/delete', function(req, res){
  Entry.deleteMany({}, function(err){
    if (err) console.log(err);
  });
  res.redirect("/");
});



let port = process.env.PORT 
if (port == null || port == "") {
  port = 3000
}


app.listen(port, function() {
  console.log("Server started");
});


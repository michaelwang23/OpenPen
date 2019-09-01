var express = require('express');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

var app = express();


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

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


app.get('/', function (req, res){
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

app.post('/contact', function(req, res){
  const entryName = req.body.txtName;
  const entryMessage = req.body.txtMsg;
  var item = new Entry({
    name: entryName,
    message: entryMessage
  });
  item.save();
  res.redirect("/");
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

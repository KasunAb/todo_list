//jshint esversion:6
const express = require("express");
const mongoose = require("mongoose");
const app = express();

app.set('view engine','ejs');
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

//we can create schema like this if we dont need any fancy things after
// const itemSchema ={
//   name:String
// };
//schema is like blue print
const itemSchema =new mongoose.Schema ({
  name:String
});

//creatinng model
//parameters1-collection name(this must singular cz
//mongoose automatically make this plural and lower case),
//parameters2-blue print
const Item = mongoose.model("Item",itemSchema);

const item1 =new Item({
  name:"welcome ro your todo list"
});
const item2 = new Item({
  name:"hit + button for add new item"
});
const item3=({
  name:"<-- Hit this to delete an item"
});
const defaultItems = [item1,item2,item3];

Item.insertMany(defaultItems,(err)=>{
  if(err){console.log("err");}
  else{console.log("successsful");}
});
// let items = [];
// let workItems=[];

//root of get request
app.get("/",function(req,res){
  // let today = new Date();
  // let options ={
  //   weekday:'long',
  //   month:'long',
  //   year:'numeric'
  // };
  // let day = today.toLocaleDateString('en-GB',options);
  res.render('list',{kindOfDay :Today,items:items});
});

app.get("/work",(req,res)=>{
  res.render('list',{kindOfDay:"workList",items:workItems});
});

app.get("/about",(req,res)=>{
  res.render('about');
});
app.post("/",function(req,res){
  let listName = req.body.buttonName;
  if(listName==="workList"){
    workItems.push(req.body.list_item);
    res.redirect("/work");
  }else{
    items.push(req.body.list_item);
    res.redirect("/");
  }

});


app.listen(3000,function(){
  console.log("listning to port 3000");
});

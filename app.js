//jshint esversion:6
const express = require("express");
const mongoose = require("mongoose");
const { MongoClient, ObjectID } = require('mongodb');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({
  extended: true
}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://nimmi:nimmi123@cluster0.hvls5.mongodb.net/todolistDB?retryWrites=true&w=majority", {
  //mongodb+srv://nimmi:<password>@cluster0.hvls5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false
});

//we can create schema like this if we dont need any fancy things after
// const itemSchema ={
//   name:String
// };
//schema is like blue print
const itemSchema = new mongoose.Schema({
  name: String
});

//creatinng model
//parameters1-collection name(this must singular cz
//mongoose automatically make this plural and lower case),
//parameters2-blue print
const Item = mongoose.model("Item", itemSchema);

//creating data using Item model
const item1 = new Item({
  name: "welcome ro your todo list"
});
//creating data using Item model
const item2 = new Item({
  name: "hit + button for add new item"
});
//creating data using Item model
const item3 = ({
  name: "<-- Hit this to delete an item"
});

//creat data collection using list
const defaultItems = [item1, item2, item3];






//root of get request
app.get("/", function(req, res) {
  //to find(read)  data from our console
  Item.find((err, data) => {
    if (data.length === 0) {
      //this allow us to insert collection of data to ou data base
      //1 st parameter - data array
      //2 nd parameter - callback function
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log("err");
        } else {
          console.log("successsful");
        }
      });
      res.redirect("/");
    } else {
      res.render('list', {
        listName: "Today",
        items: data
      });
    }
  });
});

//Schema to custom list item when call customListName
const listScheme = new mongoose.Schema({
  listName: String,
  items: []
});

//creating model to custom list
const List = mongoose.model("List", listScheme);

//using express rout paramers we can render pages
//without creating sevaral html pages
app.get("/:customListName", (req, res) => {
  const listName = req.params.customListName;
  //to avoid agin and again append same list we check given list existing or not
  //if exsist dont want create one
  //otherwise have to create new list
  List.findOne({listName: listName}, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        //create new list
        const list = new List({
          listName: listName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+listName);
      } else {
        //print existing list
        res.render('list', {listName: foundList.listName,items: foundList.items});
      }
    }else{console.log(err);}
  });
});


//
// app.get("/work", (req, res) => {
//   res.render('list', {
//     listName: "workList",
//     items: workItems
//   });
// });

app.get("/about", (req, res) => {
  res.render('about');
});

//when post request come root rout ("/") its add items to lists
//here we get 2 values from body
//1-list name (ex:-today(home page list))
//2-list item (item that want to add ex:-brush teeth)
app.post("/", function(req, res) {
  const itemName = req.body.list_item;
  const listName = req.body.listName;
  //create item from Item model
  //beacuse when rendering page todo items get from this Item model(objects)
  const item = new Item({
    name: itemName
  });
  //if list name Today its update home page list
  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }else{
  //if list name not the home page list, find the given list and
  //add list item to items array
    List.findOne({listName:listName},(err,foundList)=>{
      if(!err){
        console.log(foundList.items);
        foundList.items.push(item);
        foundList.save();
      }else{console.log(err);}
    });
  //and render equvalent list after update
    res.redirect("/"+listName);
  }
});


app.post("/delete", (req, res) => {
  //we get item id when when check the chechbox and remove data relavant for that id
  //and get list name that want to delete item
  const id = req.body.checkbox;
  const listName=req.body.listName;

  //this function remove data relavant to given id in given model
  if(listName === "Today"){
    Item.findByIdAndRemove(id, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("successsful");
      }
    });
      res.redirect("/");
  }else{
    //this is a bullshit
    //i wrap around 2 days this code line
    //_id doesnt get id as we expected
    //so i have to it as ObjectID
    //but ObjectID not require before
    //for this i have to requre it,in the above
    //const { MongoClient, ObjectID } = require('mongodb');
    List.findOneAndUpdate({ listName: listName }, { $pull: { items: { _id :new ObjectID(id)} } }, (err, foundList) => {
      if (!err){
        res.redirect("/" + listName);}
    });
  }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.listen(port, function() {
  console.log("server has started successsfully");
});

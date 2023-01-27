//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

mongoose.set('strictQuery', true);

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://rupantar99:rupantar99@cluster0.enrrrgi.mongodb.net/todolistDB",{useNewUrlParser : true});


const itemsSchema = {
  name : String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name : "Welcome to your todolist"
});

const item2 = new Item({
  name : "Hit the + to add an item"
});

const item3 = new Item({
  name : "<-- Hit this to delete an item"
});


const defaultItems = [item1, item2, item3];


// list schema

const listSchema = {
  name : String,
  items : [itemsSchema]
};

const List = mongoose.model("List", listSchema);




app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){
    
    if(foundItems.length === 0){   // avoid repetation

      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Successfully saved default items to db");
        }
      });

      res.redirect("/");
    }

    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }


   
    //console.log(foundItems);
  });

});


app.get("/:customListName", function(req, res){

  const customListName = _.capitalize(req.params.customListName);
  // _.capitalize is using lodash to go to same list using capital or small letter in listname

// check if list already present, it returns an object
  List.findOne({name : customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        //create a new list

        const list = new List({
          name : customListName,
          items : defaultItems
        });
      
        list.save();

        //concatenate custom list name
        res.redirect("/" + customListName);
        
        // console.log("Doesnot exist");
      }

      else{
        // show an existing list

          res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
        
          //console.log("Exists");
      }
    }
  });


  


  // console.log(req.params.customListName);

});




// saving and new list items

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name : itemName
  });


  // check if item added was from default list or add the item in new ist
  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }

  else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }

  // item.save(); 
  // res.redirect("/");





  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }


});



app.post("/delete", function(req,res){

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  // deleting from exact list and not redirecting to home list
  if(listName === "Today"){

    Item.findByIdAndRemove(checkedItemId, function(err) {
      if(!err){
        console.log("Successfully deleted checked item");
        res.redirect("/");
      }
  
    });
  }

  else {
    //_id must , its unique

    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }

  


  // console.log(req.body.checkbox);

});





// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});




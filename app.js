const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect('mongodb://localhost:27017/todolistDB', {
  useUnifiedTopology: true,
  useNewUrlParser: true
});
const itemsSchema = {
  name: String
};

const Item = mongoose.model("item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your Todolist!"
});

const item2 = new Item({
  name: "click + to add an item"
});

const item3 = new Item({
  name: "<- Hit this to delete an item"
});

const itemslist = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("list", listSchema)

app.get("/", function (req, res) {

  Item.find({}, function (err, result) {
    if (result.length === 0) {
      Item.insertMany(itemslist, function (err) {
        if (err)
          console.log(err);
        else
          console.log("Successfully saved !");
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: result
      });
    }
  });
});


app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function (err, found) {
      found.items.push(item);
      found.save();
      res.redirect("/" + listName);
    })
  }

});

app.post("/delete", function (req, res) {
  const id = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(id, function (err) {
      if (!err) {
        console.log("successfully deleted");
        res.redirect("/");
      }
    })
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: id
        }
      }
    }, function (err, found) {
      if (!err) {
        res.redirect("/" + listName);
      }
    })
  }

})

app.get("/:topic", function (req, res) {
  const title = _.capitalize(req.params.topic);

  List.findOne({
    name: title
  }, function (err, found) {
    if (!err) {
      if (!found) {
        const list = new List({
          name: title,
          items: itemslist
        })

        list.save();
        res.redirect("/" + title);
      } else
        res.render("list", {
          listTitle: found.name,
          newListItems: found.items
        });
    }
  })


});

app.get("/about", function (req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server started on port 3000");
});
// ========================================================
// app requirements
// ========================================================
const http       = require('http'),
      express    = require('express'),
      bodyParser = require('body-parser'),
      mongoose   = require('mongoose'),
      ejs        = require('ejs');


// ========================================================
// create and start server
// ========================================================
const app    = express(),
      server = http.createServer(app);

// set router options
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

// set server to listen on this IP and port
server.listen(process.env.PORT || 3000, process.env.IP || '0.0.0.0', function() {
  var addr = server.address();
  console.log('Server listening at', addr.address + ":" + addr.port);
});


// ========================================================
// connect to mongo database and set up mongoose schemas
// ========================================================
mongoose.connect('mongodb://localhost:27017/fossil', {useNewUrlParser: true});

// fossil logs
var fossil_log = new mongoose.Schema ({
    time        : Date,
    description : String
});

// fossil items
var fossil_items = new mongoose.Schema ({
    barcode : String,
    count   : Number,
    brand   : String,
    name    : String,
    size    : String,
    note    : String,
    tags    : String
});

var Log  = mongoose.model('Log', fossil_log);
var Item = mongoose.model('Item', fossil_items);


// ========================================================
// routes begin
// ========================================================
// summary page
app.get('/inventory/list', function(request, response) {
    response.render('list.ejs');
});

// add item page
app.get('/inventory/add', function(request, response) {
    response.render('add.ejs');
});

// remove item page
app.get('/inventory/remove', function(request, response) {
    response.render('remove.ejs');
});

app.get('/inventory/edit', function(request, response) {
    response.render('edit.ejs');
});


// post route to update item detail
app.post('inventory/updateItemDetail/', function(request, response) {
   let brand = request.body.brand,
       name = request.body.name,
       size = request.body.size,
       type = request.body.type,
       notes = request.body.notes,
       count = request.body.count,
       barcode = request.body.barcode;
   console.log(brand, name, size, type, notes, count, barcode);
});

//router to load all inventory
app.get('/inventory/loadOnHand', function(request, response) {
    Item.find( {count: {$gte: 1}}, function(error, result) {
      if (error) { console.log("Error: " + error);
      } else {
        response.send({item: result});
      }
    });
});

//router to load all inventory
app.get('/inventory/loadAll', function(request, response) {
    Item.find({}, function(error, result) {
      if (error) { console.log("Error: " + error);
      } else {
        response.send({item: result});
      }
    });
});

// route to get inventory item details
app.get('/inventory/getItemDetail/:barcode', function(request, response) {
    let data = request.params.barcode;
    console.log("Searching for " + data);
    Item.find({barcode: data}, function(error, result) {
        if (error) { console.log("Error: " + error);
        } else {
            response.send({item: result});
        }
    });
});

app.get('/inventory/fetchItem/:barcode', function(request, response) {
    let search = request.params.barcode;
    switch (search) {
    case 'all':
        Item.find({}, function(error, result) {
            (error) ? response.send(0) : response.send({items: result});
        });
        break;
    case 'onhand':
        Item.find({count: {$gte: 1}}, function(error, result) {
            (error) ? response.send(0) : response.send({items: result});
        });
        break;
    default:
        Item.find({barcode: search}, function(error, result) {
            (error) ? response.send(0) : response.send({items: result});
        });
    }
});

app.post('/inventory/updateItem/:barcode', function(request, response) {
    let search = request.params.barcode;
    let item = request.body.item;
    console.log(item.type);
    Item.update({barcode: search}, {
        barcode: item.barcode,
        count: item.count,
        brand: item.brand,
        name: item.name,
        size: item.size,
        type: item.type,
        note: item.note}, function(error, result) {
            console.log(result);
            Item.find({barcode: item.barcode}, function(error, result) {
                console.log(result);
            })
            response.send({result: result});
        });

});

app.post('/inventory/addItem/', function(request, response) {
   let item = request.body.item;
   if (Item.find({barcode: item.barcode}).length() > 0) {
       console.log('Item already exists! Skipping insert!');
       response.send(0);
   } else {
       console.log('Inserting new item: '+item);
       Item.insert({
           barcode: item.barcode,
           count: item.count,
           brand: item.brand,
           name: item.name,
           size: item.size,
           type: item.type,
           note: item.note
       },
      function(error, result) {
          (error) ? response.send(error) : response.send(1);
      });
   }
});



// item edit page

// item add page

// shopping list page

// recipe page

// redirect all other requests (including root) to summary page
app.get('*', function(request, response) {
  response.redirect('/inventory/list');
});


// display on hand items

// increase or decrease on hand items in inventory
// add item information to the database
// edit item information in the database
// display the items onhand

// I want to increase an item to my onhand
    // 1. scan/enter barcode
        // the system looks up the bardcode...
            // barcode doesn't exist in the items database
                // 1. look up item in API (eventually, costs money)
                // 2. Allow me to enter information manually
                    // add the item the database
                        // increase item on hand by 1
            // barcode is found in items database
                // increase item on hand by 1
    // 2. tap item in list and increase by one
    // 3. edit onhand amount manually


// I want to remove an item from my onhand
    // scan the barcode
// if I want to tell it that I am taking one item out, I scan the barcode, it makes sure I have at least one on hand and then decreases the onhand by 1
// I want to see what I have in my inventory onhand, so I look at my inventory list

// default page is OnHand List
    // clicking an item shows item details and a +1 -1 buttons to quick add or remove 1 item from onhand
// add page allows you to add an item to onhand by scanning the barcode or entering UPC manually
    // page looks up item barcode, adds one to onhand if found
    // if not found, brings up item add detail modal, with Add Item and Skip buttons
    // bottom portion of page is a running log of items added
// remove page allows you to remove an item from the onhand by scanning the barcode or entering UPC manually
    // page looks to see if you have at least one on hand
        // if yes, removes one from onhand, tells you how many more you have onhand
        // if no, tells you you don't have any onhand
// edit page allows you to edit item details, manually set onhand, and remove an item from the database completely.
    // shows you entire table of items, even those that have zero onhand


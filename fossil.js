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
    type    : String,
    note    : String
});

var Log  = mongoose.model('Log', fossil_log);
var Item = mongoose.model('Item', fossil_items);

/* 
  this key is required to do destructive db commands
  and is meant only as a temporary minor protection 
  against accidental upsert or delete. Not meant to be
  any kind of replacement for authentication.
*/
var adminKey = '$admin1';


// ========================================================
// routes begin
// ========================================================

app.get('/inventory/list', function(request, response) {
    response.render('list.ejs');
});

app.get('/inventory/add', function(request, response) {
    response.render('add.ejs');
});

app.get('/inventory/remove', function(request, response) {
    response.render('remove.ejs');
})

app.post('/items/create', function(request, response) {
    let item = request.body.item;
    console.log(item);
    Item.create({
          barcode: item.barcode,
          count: item.count,
          brand: item.brand,
          name: item.name,
          size: item.size,
          type: item.type,
          note: item.note
      },
      function(error, result) {
          (error) ? response.send('There was an error trying to add the item!') : response.send("Item added!");
      });
});

app.put('/items/update', function(request, response) {
    let item = request.body.item;
    console.log(item);
    Item.update({ barcode: item[0].barcode }, {
        _id: item[0]._id,
        barcode: item[0].barcode,
        count: item[0].count,
        brand: item[0].brand,
        name: item[0].name,
        size: item[0].size,
        type: item[0].type,
        note: item[0].note,
        __v: item[0].__v
    },
    function(error, result) {
        (error) ? response.send('There was an error trying to update the item!') : response.send("Item updated!");
    });
});

app.get('/items/fetch/all', function(request, response) {
    Item.find({}, function(error, result) {
      (error) ? response.send(0) : response.send({items: result});
    });
});

app.get('/items/fetch/onhand', function(request, response) {
    Item.find({count:{$gte: 1}}, function(error, result) {
      (error) ? response.send(0) : response.send({items: result});
    });
});

app.get('/items/fetch/:barcode', function(request, response) {
    Item.find({barcode:request.params.barcode}, function(error, result) {
      (error) ? response.send(0) : response.send({items: result});
    });
});

app.get("/admin/test/:key", function(request, response) {
    if (request.params.key === adminKey) {
        response.render('test.ejs');
    } else {
        response.redirect('/inventory/list');
    }
});

// redirect all other requests (including root) to summary page
app.get('*', function(request, response) {
  response.redirect('/inventory/list');
});
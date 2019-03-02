/*
 * Inventory Control Functions
 * GNU GPL V3.0 License
 * ---------------------------------------
 */

const inventory = {
    // variables
    varList: '',

    // DOM elements
    // inventory.list list the inventory in a table
    // inventory

    fetchItems: function (barcode, callback) {
        // barcode not found results in 0-length object array
        // barcode found results in 1-length object array
        // 'all' results in every item returned in an object array
        $.ajax({
                url: '/inventory/fetchItem/' + barcode,
                method: 'GET'
            })
            .then(function (response) {
                callback(response.items);
            })
            .catch(function (error) {
                console.error(error);
            });
    },
    
    updateItem: function (barcode, item, callback) {
        // console.log(item);
        $.ajax({
                url: '/inventory/updateItem/' +  barcode,
                data: {item},
                method: "POST"
            })
            .then(function (response) {
                callback;
            })
            .catch(function (error) {
                // console.log(error);
            });
    },
    
    addItem: function (item, callback) {
        $.ajax({
            url: '/inventory/addItem/',
            data: {item},
            method: 'POST'
        }).then(function() {
            callback;
        }).catch(function(error) {
            console.error(error);
        });
    },

    // functions dealing with listeners
    listeners: {
        initGetDetailsModal: function () {
            $('.itemRow').each(function () {
                $(this).on('click', function (element) {
                    let barcode = $(this).children('.col-barcode').text();
                    inventory.fetchItems(barcode, function (items) {
                        $('.modal-body').html(
                            '<div>' +
                                '<p>' +
                                    '<h4>' + items[0].brand + ' ' + items[0].name + '</h4>' +
                                '</p>' +
                                '<p>' +
                                    items[0].type + ', ' + items[0].size +
                                '</p>' +
                                '<p>' +
                                    'On Hand: ' + items[0].count +
                                '</p>' +
                                '<p>' +
                                    items[0].barcode +
                                '</p>' +
                            '</div>'
                            // end modal-body HTML generation
                        );
                    });
                });
            });
        },

        initEditDetailsModal: function () {
            $('.itemRow').each(function () {
                $(this).on('click', function (element) {
                    let barcode = $(this).children('.col-barcode').text();
                    inventory.fetchItems(barcode, function (items) {
                        $('.modal-body').html(
                            '<div class="input-group input-group-sm" id="search">' +
                                '<input id="brand" type="text" class="form-control" placeholder="'+items[0].brand+'" value="'+items[0].brand+'" style="margin: 2px 0px;">' +
                                '<input id="name" type="text" class="form-control" placeholder="'+items[0].name+'" value="'+items[0].name+'" style="margin: 2px 0px;">' +
                                '<input id="type" type="text" class="form-control" placeholder="'+items[0].type+'" value="'+items[0].type+'" style="margin: 2px 0px;">' +
                                '<input id="size" type="text" class="form-control" placeholder="'+items[0].size+'" value="'+items[0].size+'" style="margin: 2px 0px;">' +
                                '<input id="count" type="text" class="form-control" placeholder="'+items[0].count+'" value="'+items[0].count+'" style="margin: 2px 0px;">' +
                                '<input id="barcode" type="text" class="form-control" placeholder="'+items[0].barcode+'" value="'+items[0].barcode+'" style="margin: 2px 0px;">' +
                                '<input id="note" type="text" class="form-control" placeholder="'+items[0].note+'" value="'+items[0].note+'" style="margin: 2px 0px;">' +
                            '</div>'
                        );
                        $('#editItemSave').on('click', function(event) {
                            event.preventDefault();
                            let item = {
                                brand: $('#brand').val(),
                                name: $('#name').val(),
                                type: $('#type').val(),
                                size: $('#size').val(),
                                count: $('#count').val(),
                                barcode: $('#barcode').val(),
                                note: $('#note').val()
                            };
                            inventory.updateItem(barcode, item, inventory.list('all', inventory.listeners.initEditDetailsModal));
                        })
                    });
                });
            });
        },
        
        initAddItemPage: function () {
            $('#btnAddItem').on('click', function(event) {
                event.preventDefault();
                console.log($('#inpAddItem').val());
                inventory.fetchItems($('#inpAddItem').val(), function (item) {
                    console.log(item);
                })
            })
        }
    },
    
    // functions 
    list: function (type, callback) {
        inventory.varList = '';
        inventory.fetchItems(type, function (items) {
            items.forEach(function (item) {
                inventory.varList +=
                    '<tr class="itemRow" data-toggle="modal" data-target="#itemPopup">' +
                    '<td class="col-count">' + item.count + '</td>' +
                    '<td class="col-brand">' + item.brand + '</td>' +
                    '<td class="col-name">' + item.name + '</td>' +
                    '<td class="col-size">' + item.size + '</td>' +
                    '<td class="col-note">' + item.note + '</td>' +
                    '<td class="col-type">' + item.type + '</td>' +
                    '<td class="col-barcode">' + item.barcode + '</td>' +
                    '</tr>';
            });
            // put the inventory in the body section of the table
            $('#inventoryContent').html(inventory.varList);
            callback();
        });
    }
};

/*
 * Inventory Control Functions
 * GNU GPL V3.0 License
 * ---------------------------------------
*/

const items = {
    increaseOnHand: function() {
        // increase found item count by 1
    },
    decreaseOnHand: function() {
        // decrease found item count by 1
    },
    addItem: function() {
        // add new item to the inventory
    },
    deleteItem: function() {
        // remote found item from the inventory
    },
    editItem: function() {
        // edit found item's details
    },
    getItem: function() {
        // get found item's details
    }
};

const inventory = {
    list: async function(barcode) {
        let items = await db.read(barcode);
        $('#inventory-tbody').html('');
        for (let i=0;i<10;i++){ // temporarily emulating more items
            items.forEach((item) => $('#inventory-tbody').append(
                '<tr class="item-row" data-toggle="modal" data-target="#detail-popup">' +
                '<td class="col-md-1 col-sm-2 col-xs-1 col-count">' + item.count + '</td>' +
                '<td class="col-md-1 col-sm-3 col-xs-3 col-brand">' + item.brand + '</td>' +
                '<td class="col-md-3 col-sm-7 col-xs-8 col-name">' + item.name + '</td>' +
                '<td class="col-md-1 hidden-sm hidden-xs col-size">' + item.size + '</td>' +
                '<td class="col-md-2 hidden-sm hidden-xs col-type">' + item.type + '</td>' +
                '<td class="col-md-3 hidden-sm hidden-xs col-barcode">' + item.barcode + '</td>' +
                '<td class="col-md-1 hidden-sm hidden-xs col-note">' + item.note + '</td>' +
                '</tr>'
            ));
        }
        $('.table-responsive').addClass('load'); // fade-in table when loaded
    }
};

const db = {
    create: async function(item, key) {
        // AJAX call to create new entries in the database
        let response = await $.ajax({
            url: '/items/create/',
            method: 'POST',
            data: {item: item, key: key},
            error: (error) => console.error(error)
        });
        return response;
    },
    read: async function(barcode) {
        // AJAX call to read entries in the database
        // barcode can be 'all', 'onhand', or a barcode number
        let response = await $.ajax({
            url: '/items/fetch/'+barcode,
            method: 'GET',
            error: (error) => console.error(error)
        });
        return response.items;
    },
    update: async function(item, key) {
        // AJAX call to update entries in the database
        let response = await $.ajax({
            url: '/items/update/',
            method: 'PUT',
            data: {item, key: key},
            error: (error) => console.error(error)
        });
        return response;
    },
    delete: async function(item, key) {
        // AJAX call to delete entries in the database
        let response = await $.ajax({
            url: '/items/delete/'+item,
            method: 'DELETE',
            data: {key},
            error: (error) => console.error(error)
        });
        return response;
    }
};

const init = {
    addPage: function() {
        // initialize the add item page
        $('.js-add-barcode-btn').on('click', listeners.js_add_barcode_btn);
        $('.js-add-barcode-inp').on('keypress', function(event) {
            (event.which === 13) ? listeners.js_add_barcode_btn() : false;
        });
        $('.js-add-item-btn').on('click', listeners.js_add_item_btn);
    },
    editPage: function() {
        // initialize the edit item page
    },
    removePage: function() {
        // initialize the remove item page
        $('.js-add-barcode-btn').on('click', listeners.js_remove_barcode_btn);
        $('.js-add-barcode-inp').on('keypress', function(event) {
            (event.which === 13) ? listeners.js_remove_barcode_btn() : false;
        });
        $('.js-add-item-btn').on('click', listeners.js_add_item_btn);
    },
    listPage: async function() {
        // initialize the list inventory page
        let items = await inventory.list('onhand');
        // attach listeners
        $('.item-row').each(function(row) {
            $(this).on('click', async function(event) {
                let item = await db.read($(this).children('.col-barcode').text());
                $('.modal-body').html(
                    '<div>' +
                        '<p>' +
                            '<h4>' + item[0].brand + ' ' + item[0].name + '</h4>' +
                        '</p>' +
                        '<p>' +
                            item[0].type + ', ' + item[0].size +
                        '</p>' +
                        '<p>' +
                            'On Hand: ' + item[0].count +
                        '</p>' +
                        '<p>' +
                            item[0].barcode +
                        '</p>' +
                    '</div>'
                    // end modal-body HTML generation
                );
            })
        });
    }
};

const listeners = {
    js_add_barcode_btn: async function() {
        console.log(event);
        event.preventDefault();
        let barcode = $('.js-add-barcode-inp').val();
        let item = await db.read(barcode);
        if (item.length === 0) {
            $('.js-add-barcode').css({'opacity': 0, 'visibility': 'hidden', 'height': 0});
            $('.js-add-item').css({'opacity': 1, 'visibility': 'visible'});
            $('.js-add-item-barcode').val(barcode);
        } else {
            await item[0].count++;
            console.log(item);
            let response = await db.update(item, '$admin1');
            console.log(response);
            $('.js-add-barcode-inp').val('');
            $('.js-add-barcode-inp').focus();
        }
    },
    js_add_item_btn: async function() {
        event.preventDefault();
        // get new item details
        let itemBrand = $('.js-add-item-brand').val(),
            itemName = $('.js-add-item-name').val(),
            itemType = $('.js-add-item-type').val(),
            itemSize = $('.js-add-item-size').val(),
            itemBarcode = $('.js-add-item-barcode').val(),
            itemCount = $('.js-add-item-count').val(),
            itemNote = $('.js-add-item-note').val();
        // create the item object to send to the database
        let item = {
            brand: itemBrand,
            name: itemName,
            type: itemType,
            size: itemSize,
            barcode: itemBarcode,
            count: itemCount,
            note: itemNote
        };
        let response = await db.create(item, '$admin1');
        console.log(response);
        // empty the input values for next time
        $('.js-add-item-brand').val('');
        $('.js-add-item-name').val('');
        $('.js-add-item-type').val('');
        $('.js-add-item-size').val('');
        $('.js-add-item-barcode').val('');
        $('.js-add-item-count').val('');
        $('.js-add-item-note').val('');
        // hide input and show barcode input again
        $('.js-add-barcode').css({'opacity': 1, 'visibility': 'visible', 'height': '100%'});
        $('.js-add-item').css({'opacity': 0, 'visibility': 'hidden', 'height': 0});
    },
    js_remove_barcode_btn: async function() {
        console.log(event);
        event.preventDefault();
        let barcode = $('.js-add-barcode-inp').val();
        let item = await db.read(barcode);
        if (item.length === 0) {
            $('.js-add-barcode').css({'opacity': 0, 'visibility': 'hidden', 'height': 0});
            $('.js-add-item').css({'opacity': 1, 'visibility': 'visible'});
            $('.js-add-item-barcode').val(barcode);
        } else {
            await item[0].count--;
            console.log(item);
            let response = await db.update(item, '$admin1');
            console.log(response);
            $('.js-add-barcode-inp').val('');
            $('.js-add-barcode-inp').focus();
        }
    }
};
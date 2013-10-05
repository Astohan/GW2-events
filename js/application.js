///////////////////////
// Create Item class //
///////////////////////

var Item = function(name, data_id, restriction_level, rarity, img, max_offer_unit_price, offer_availability, min_sale_unit_price, sale_availability, sale_price_change_last_hour, offer_price_change_last_hour) {
  this.name            = name;
  this.id              = data_id;
  this.level           = restriction_level;
  this.rarity          = rarity;
  this.image           = img;
  this.max_offer_price = max_offer_unit_price;
  this.offer_quantity  = offer_availability;
  this.min_sale_price  = min_sale_unit_price;
  this.sale_quantity   = sale_availability;
  this.sale_variation  = sale_price_change_last_hour;
  this.offer_variation = offer_price_change_last_hour;
};

///////////////////////////
// Create Item functions //
///////////////////////////

Item.prototype.getName           = function() { return this.name; };
Item.prototype.getId             = function() { return this.id; };
Item.prototype.getLevel          = function() { return this.level; };
Item.prototype.getRarity         = function() { if (this.rarity == 0) { return 'junk' } else if (this.rarity == 1) { return 'common' } else if (this.rarity == 2) { return 'fine' } else if (this.rarity == 3) { return 'masterwork' } else if (this.rarity == 4) { return 'rare' } else if (this.rarity == 5) { return 'exotic' } else if (this.rarity == 6) { return 'legendary' }; };
Item.prototype.getImage          = function() { return this.image; };
Item.prototype.getMaxOfferPrice  = function() { return toGSC(this.max_offer_price); };
Item.prototype.getOfferQuantity  = function() { return this.offer_quantity; };
Item.prototype.getMinSalePrice   = function() { return toGSC(this.min_sale_price); };
Item.prototype.getSaleQuantity   = function() { return this.sale_quantity; };
Item.prototype.getSaleVariation  = function() { if (this.sale_variation > 0) { return 'increase' } else if (this.sale_variation < 0) { return 'decrease' } else { return 'same'} }
Item.prototype.getOfferVariation = function() { if (this.offer_variation > 0) { return 'increase' } else if (this.offer_variation < 0) { return 'decrease' } else { return 'same'} }
Item.prototype.getProfit         = function() { return toGSC(this.min_sale_price - this.max_offer_price - Math.floor(this.min_sale_price * 0.15)); }
Item.prototype.printItem         = function() {
  $('.results-list', '#results').append([
    '<div class="media span4">',
      '<div class="pull-left">',
        '<img src="' + this.getImage() + '" class="media-object" />',
      '</div>',
      '<div class="media-body">',
        '<h5 class="name ' + this.getRarity() + '">' + this.getName() + '</h5>',
        '<p class="level">Niveau: '+ this.getLevel() + '</p>',
        '<p class="offer ' + this.getOfferVariation() + '">Prix achat: '+ this.getMaxOfferPrice() + '</p>',
        '<p class="sale ' + this.getSaleVariation() + '">Prix vente: ' + this.getMinSalePrice() + '</p>',
        '<p class="sale">Profit brut: ' + this.getProfit() + '</p>',
        '<a href="http://www.guildwarstrade.com/item/' + this.getId() + '" target="_blank" class="btn btn-data btn-small pull-right" title="Visualiser dans Guild Wars Trade">',
          '<i class="icon-list-alt"></i>',
        '</a>',
      '</div>',
    '</div>'
  ].join(''));
  copyToClipboard();
};

///////////////////////////////////////////////////////////////////////////
// Function to convert int to gold/silver/copper (credits to tpcalc.com) //
///////////////////////////////////////////////////////////////////////////

toGSC = function(val) { var openG = '<span class="gold">'; var closeG = '</span>'; var openS = '<span class="silver">';  var closeS = '</span>'; var openC = '<span class="copper">'; var closeC = '</span>'; var sign = (val < 0 ? -1 : 1); var g = Math.floor(sign * val / 10000); var s = Math.floor((sign * val - g * 10000) / 100); var c = sign * val - g * 10000 - s * 100; if (g) return openG + (sign * g) + closeG + openS + s + closeS + openC + c + closeC; if (s) return openS + (sign * s) + closeS + openC + c + closeC; if (c) return openC + (sign * c) + closeC; return openC + '0' + closeC; };
toLeadZero = function(val, maxLength) { return ('0000' + val).slice(maxLength); }

////////////////////
// Document ready //
////////////////////

$(document).ready(function() {

  ////////////////
  // UI changes //
  ////////////////

  var right = $(window).width(),
      left  = -$(window).width(),
      show  = 0;

  $('#loader').css({left: right});
  $('#results').css({left: right});

  $('#clear').click(function() {
    $('#loader').animate({left: right});
    $('#results').animate({left: right});
    $('#action').animate({left: show});
    $('.results-list', '#results').html('');
    return false;
  });

  ///////////////////////
  // Copy to Clipboard //
  ///////////////////////

  copyToClipboard = function() {
    var clip = new ZeroClipboard($('.btn-copy'), {
      moviePath: "assets/swf/ZeroClipboard.swf"
    });

    clip.on('complete', function(client, args) {
      $('i', '.btn-copy').removeClass().addClass('icon-pencil');
      $('.btn-copy[data-clipboard-text="' + args.text + '"]').find('i').removeClass().addClass('icon-ok');
    });
  };

  //////////////////////////////////////////////
  // Initialize script when submit is clicked //
  //////////////////////////////////////////////

  $('#search').click(function() {

    //////////////////////////
    // Application settings //
    //////////////////////////

    var type         = $('#type', '#action').val(),
        gold         = toLeadZero($('#gold', '#action').val(), 4),
        silver       = toLeadZero($('#silver', '#action').val(), 2),
        copper       = toLeadZero($('#copper', '#action').val(), 2),
        investment   = parseInt("" + gold + silver + copper),
        minimumOffer = investment;

    if (minimumOffer >= 0 && minimumOffer < 5000) {
      var itemsDisplayed = 20,                                      // number of results displayed
          saleQuantity   = 500,                                     // number of this item on sale
          offerQuantity  = 500,                                     // number of offers for this item
          minimumProfit  = 0.5,                                     // minimum percentage of profit
          exclusivity    = false;                                   // it is not in the route of tp farmers
    } else if (minimumOffer > 5000 && minimumOffer < 10000) {
      var itemsDisplayed = 20,                                      // number of results displayed
          saleQuantity   = 150,                                     // number of this item on sale
          offerQuantity  = 150,                                     // number of offers for this item
          minimumProfit  = 0.3,                                     // minimum percentage of profit
          exclusivity    = false;                                   // it is not in the route of tp farmers
    } else if (minimumOffer >= 10000 && minimumOffer < 100000) {
      var itemsDisplayed = 20,                                      // number of results displayed
          saleQuantity   = 25,                                      // number of this item on sale
          offerQuantity  = 25,                                      // number of offers for this item
          minimumProfit  = 0.3,                                     // minimum percentage of profit
          exclusivity    = false;                                   // it is not in the route of tp farmers
    } else if (minimumOffer >= 100000) {
      var itemsDisplayed = 20,                                      // number of results displayed
          saleQuantity   = 5,                                       // number of this item on sale
          offerQuantity  = 5,                                       // number of offers for this item
          minimumProfit  = 0.3,                                     // minimum percentage of profit
          exclusivity    = false;                                   // it is not in the route of tp farmers
    };

    ////////////////
    // UI changes //
    ////////////////

    $('#action').animate({left: left});
    $('#loader').animate({left: show});

    ////////////////
    // Parse JSON //
    ////////////////

    $.getJSON('http://gw2spidy.com/api/v0.9/json/all-items/' + type + '?callback=?',
      {},
      function(data) {

        ////////////////
        // UI changes //
        ////////////////

        $('#loader').animate({left: left});
        $('#results').animate({left: show});
        
        var items = new Array();

        ////////////////////////
        // Filter the results //
        ////////////////////////

        $.each(data.results, function(i, result) {

          if (result.max_offer_unit_price >= minimumOffer && result.sale_availability >= saleQuantity && result.offer_availability >= offerQuantity && result.min_sale_unit_price >= result.max_offer_unit_price + (result.max_offer_unit_price * minimumProfit)) {
            if (exclusivity == true) {
              if (result.sale_price_change_last_hour > 0 || result.offer_price_change_last_hour < 0) {
                items.push(result);
              }
            } else {
              items.push(result);
            }
          };
        });

        if (items.length == 0) {

          //////////////////////////////////////
          // Show message if nothing is found //
          //////////////////////////////////////

          $('h1', '#results').html('Erreur critique').next().html('Nos ingénieurs n\'ont pas trouvé les objets demandés.');

        } else {

          ////////////////////////////////////////////
          // Sort array of items by relative profit //
          ////////////////////////////////////////////

          items.sort(function(a, b) { return parseFloat(a.max_offer_unit_price / a.min_sale_unit_price) - parseFloat(b.max_offer_unit_price / b.min_sale_unit_price) } );

          ///////////////////
          // Print results //
          ///////////////////

          for (i = 0; i < itemsDisplayed; i++) {
            var me = items[i];
            var profitable = new Item(me.name, me.data_id, me.restriction_level, me.rarity, me.img, me.max_offer_unit_price, me.offer_availability, me.min_sale_unit_price, me.sale_availability, me.sale_price_change_last_hour, me.offer_price_change_last_hour);
            profitable.printItem();
          };
        }
      }
    );

    return false;
  });
});
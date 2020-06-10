'use strict';

jQuery(document).on('ready', function() {
  jQuery('.product-type-woosg').each(function() {
    woosg_init(jQuery(this));
  });
});

jQuery(document).on('woosq_loaded', function() {
  // WPC Smart Quick View
  woosg_init(jQuery('#woosq-popup .product-type-woosg'));
});

jQuery(document).on('woovr_selected', function(e, selected, variations) {
  // WPC Variations Radio Buttons
  var $woosg_wrap = variations.closest('.product-type-woosg');
  var $woosg_product = variations.closest('.woosg-product');

  if ($woosg_product.length) {
    var _id = selected.attr('data-id');
    var _price = selected.attr('data-price');
    var _price_html = selected.attr('data-pricehtml');
    var _image_src = selected.attr('data-imagesrc');
    var _purchasable = selected.attr('data-purchasable');

    if (_purchasable === 'yes') {
      // change data
      $woosg_product.attr('data-id', _id);
      $woosg_product.attr('data-price', _price);

      // change image
      $woosg_product.find('.woosg-thumb-ori').hide();
      $woosg_product.find('.woosg-thumb-new').
          html('<img src="' + _image_src + '"/>').show();

      // change price
      $woosg_product.find('.woosg-price-ori').hide();
      $woosg_product.find('.woosg-price-new').html(_price_html).show();

      // change availability
      $woosg_product.find('.woosg-availability').
          html(t['availability_html']).
          show();
    } else {
      // reset data
      $woosg_product.attr('data-id', 0);
      $woosg_product.attr('data-price', 0);

      // reset image
      $woosg_product.find('.woosg-thumb-new').html('').hide();
      $woosg_product.find('.woosg-thumb-ori').show();

      // reset price
      $woosg_product.find('.woosg-price-ori').show();
      $woosg_product.find('.woosg-price-new').html('').hide();

      // reset availability
      $woosg_product.find('.woosg-availability').html('').hide();
    }
  }

  woosg_init($woosg_wrap);
});

jQuery(document).on('found_variation', function(e, t) {
  var $woosg_wrap = jQuery(e['target']).closest('.product-type-woosg');
  var $woosg_products = jQuery(e['target']).closest('.woosg-products');
  var $woosg_product = jQuery(e['target']).closest('.woosg-product');

  if ($woosg_product.length) {
    if (t['image']['url'] && t['image']['srcset']) {
      // change image
      $woosg_product.find('.woosg-thumb-ori').hide();
      $woosg_product.find('.woosg-thumb-new').
          html('<img src="' + t['image']['url'] + '" srcset="' +
              t['image']['srcset'] + '"/>').
          show();
    }

    if (t['price_html']) {
      // change price
      $woosg_product.find('.woosg-price-ori').hide();
      $woosg_product.find('.woosg-price-new').html(t['price_html']).show();
    }

    if (t['is_purchasable']) {
      // change stock notice
      if (t['is_in_stock']) {
        $woosg_products.next('p.stock').show();
        $woosg_product.attr('data-id', t['variation_id']);
        $woosg_product.attr('data-price', t['display_price']);

        // change add to cart button
        $woosg_product.find('.add_to_cart_button').
            attr('data-product_id', t['variation_id']).
            attr('data-product_sku', t['sku']).
            attr('data-quantity', $woosg_product.attr('data-qty')).
            removeClass('product_type_variable').
            addClass('product_type_simple ajax_add_to_cart').
            html(woosg_vars.add_to_cart);
      } else {
        $woosg_products.next('p.stock').hide();
        $woosg_product.attr('data-id', 0);
        $woosg_product.attr('data-price', 0);

        // reset add to cart button
        $woosg_product.find('.add_to_cart_button').
            attr('data-product_id', 0).attr('data-product_sku', '').
            removeClass('product_type_simple ajax_add_to_cart').
            addClass('product_type_variable').
            html(woosg_vars.select_options);
      }

      // change availability text
      if (t['availability_html'] && t['availability_html'] !== '') {
        $woosg_product.find('.woosg-availability').
            html(t['availability_html']).
            show();
      } else {
        $woosg_product.find('.woosg-availability').html('').hide();
      }
    }

    if (t['variation_description'] !== '') {
      $woosg_product.find('.woosg-variation-description').
          html(t['variation_description']).
          show();
    } else {
      $woosg_product.find('.woosg-variation-description').html('').hide();
    }

    if (woosg_vars.change_image === 'no') {
      // prevent changing the main image
      jQuery(e['target']).closest('.variations_form').trigger('reset_image');
    }

    woosg_init($woosg_wrap);
  }
});

jQuery(document).on('reset_data', function(e) {
  var $woosg_wrap = jQuery(e['target']).closest('.product-type-woosg');
  var $woosg_product = jQuery(e['target']).closest('.woosg-product');

  if ($woosg_product.length) {
    // reset image
    $woosg_product.find('.woosg-thumb-new').html('').hide();
    $woosg_product.find('.woosg-thumb-ori').show();

    // reset price
    $woosg_product.find('.woosg-price-new').html('').hide();
    $woosg_product.find('.woosg-price-ori').show();

    // reset availability
    $woosg_product.find('.woosg-availability').html('').hide();

    // reset desc
    $woosg_product.find('.woosg-variation-description').html('').hide();

    // reset data
    $woosg_product.attr('data-id', 0);
    $woosg_product.attr('data-price', 0);

    // reset add to cart button
    $woosg_product.find('.add_to_cart_button').
        attr('data-product_id', 0).attr('data-product_sku', '').
        removeClass('product_type_simple ajax_add_to_cart').
        addClass('product_type_variable').
        html(woosg_vars.select_options);

    woosg_init($woosg_wrap);
  }
});

jQuery(document).on('click touch', '.single_add_to_cart_button', function(e) {
  var $this = jQuery(this);

  if ($this.hasClass('woosg-disabled')) {
    if ($this.hasClass('woosg-selection')) {
      alert(woosg_vars.alert_selection);
    } else if ($this.hasClass('woosg-empty')) {
      alert(woosg_vars.alert_empty);
    }
    e.preventDefault();
  }
});

jQuery(document).on('keyup change', '.woosg-qty .qty', function() {
  var $this = jQuery(this);
  var $woosg_wrap = $this.closest('.product-type-woosg');
  var qty = parseFloat($this.val());
  var min = parseFloat($this.closest('.woosg-qty').attr('data-min'));
  var max = parseFloat($this.closest('.woosg-qty').attr('data-max'));

  if ((
      qty > 0
  ) && (
      qty < min
  )) {
    qty = min;
    $this.val(qty);
  }

  if ((
      max > 0
  ) && (
      qty > max
  )) {
    qty = max;
    $this.val(qty);
  }

  $this.closest('.woosg-product').attr('data-qty', qty);
  $this.closest('.woosg-product').
      find('.add_to_cart_button').
      attr('data-quantity', qty);

  woosg_init($woosg_wrap);
});

jQuery(document).on('change', '.woosg-qty input[type=radio]', function() {
  var $this = jQuery(this);
  var $woosg_wrap = $this.closest('.product-type-woosg');
  var qty = parseFloat($this.val());
  var min = parseFloat($this.closest('.woosg-qty').attr('data-min'));

  if ((
      qty > 0
  ) && (
      qty < min
  )) {
    qty = min;
    $this.val(qty);
  }

  $this.closest('.woosg-product').attr('data-qty', qty);

  woosg_init($woosg_wrap);
});

jQuery(document).
    on('click touch', '.woosg-qty-plus, .woosg-qty-minus',
        function() {
          // get values
          var $qty = jQuery(this).
                  closest('.woosg-qty').
                  find('.qty'),
              qty_val = parseFloat($qty.val()),
              max = parseFloat($qty.attr('max')),
              min = parseFloat($qty.attr('min')),
              step = $qty.attr('step');

          // format values
          if (!qty_val || qty_val === '' || qty_val === 'NaN') {
            qty_val = 0;
          }

          if (max === '' || max === 'NaN') {
            max = '';
          }

          if (min === '' || min === 'NaN') {
            min = 0;
          }

          if (step === 'any' || step === '' || step === undefined ||
              parseFloat(step) === 'NaN') {
            step = 1;
          } else {
            step = parseFloat(step);
          }

          // change the value
          if (jQuery(this).is('.woosg-qty-plus')) {
            if (max && (
                max == qty_val || qty_val > max
            )) {
              $qty.val(max);
            } else {
              $qty.val((qty_val + step).toFixed(woosg_decimal_places(step)));
            }
          } else {
            if (min && (
                min == qty_val || qty_val < min
            )) {
              $qty.val(min);
            } else if (qty_val > 0) {
              $qty.val((qty_val - step).toFixed(woosg_decimal_places(step)));
            }
          }

          // trigger change event
          $qty.trigger('change');
        });

function woosg_decimal_places(num) {
  var match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);

  if (!match) {
    return 0;
  }

  return Math.max(
      0,
      // Number of digits right of decimal point.
      (match[1] ? match[1].length : 0)
      // Adjust for scientific notation.
      - (match[2] ? +match[2] : 0));
}

function woosg_init($woosg_wrap) {
  var is_selection = false;
  var is_empty = true;

  var $woosg_products = $woosg_wrap.find('.woosg-products');
  var $woosg_btn = $woosg_wrap.find('.single_add_to_cart_button');

  $woosg_products.find('.woosg-product').each(function() {
    var $this = jQuery(this);
    if ((
        $this.attr('data-qty') > 0
    ) && (
        $this.attr('data-id') == 0
    )) {
      is_selection = true;
    }
    if ($this.attr('data-qty') > 0) {
      is_empty = false;
    }
  });

  if (is_selection || is_empty) {
    $woosg_btn.addClass('woosg-disabled').prop('disabled', true);
    if (is_selection) {
      $woosg_btn.addClass('woosg-selection');
    } else {
      $woosg_btn.removeClass('woosg-selection');
    }
    if (is_empty) {
      $woosg_btn.addClass('woosg-empty');
    } else {
      $woosg_btn.removeClass('woosg-empty');
    }
  } else {
    $woosg_btn.removeClass('woosg-disabled woosg-selection woosg-empty').
        prop('disabled', false);
  }

  woosg_calc_price($woosg_wrap);
  woosg_save_ids($woosg_wrap);
}

function woosg_calc_price($woosg_wrap) {
  var total = 0;
  var $woosg_products = $woosg_wrap.find('.woosg-products');
  var $woosg_total = $woosg_wrap.find('.woosg-total');

  $woosg_products.find('.woosg-product').each(function() {
    var $this = jQuery(this);
    if ((
        $this.attr('data-price') > 0
    ) && (
        $this.attr('data-qty') > 0
    )) {
      total += $this.attr('data-price') * $this.attr('data-qty');
    }
  });

  var total_html = woosg_format_price(total);
  $woosg_total.html(woosg_vars.total_text + ' ' + total_html).slideDown();

  if (woosg_vars.change_price !== 'no') {
    // change the main price
    var price_selector = '.summary > .price';

    if ((woosg_vars.price_selector !== null) &&
        (woosg_vars.price_selector !== '')) {
      price_selector = woosg_vars.price_selector;
    }

    $woosg_wrap.find(price_selector).html(total_html);
  }

  jQuery(document).trigger('woosg_calc_price', [total, total_html]);
}

function woosg_save_ids($woosg_wrap) {
  var woosg_ids = Array();
  var $woosg_products = $woosg_wrap.find('.woosg-products');
  var $woosg_ids = $woosg_wrap.find('.woosg-ids');

  $woosg_products.find('.woosg-product').each(function() {
    var $this = jQuery(this);
    if ((
        $this.attr('data-id') > 0
    ) && (
        $this.attr('data-qty') > 0
    )) {
      woosg_ids.push($this.attr('data-id') + '/' + $this.attr('data-qty'));
    }
  });

  $woosg_ids.val(woosg_ids.join(','));
}

function woosg_format_money(number, places, symbol, thousand, decimal) {
  number = number || 0;
  places = !isNaN(places = Math.abs(places)) ? places : 2;
  symbol = symbol !== undefined ? symbol : '$';
  thousand = thousand || ',';
  decimal = decimal || '.';
  var negative = number < 0 ? '-' : '',
      i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + '',
      j = 0;
  if (i.length > 3) {
    j = i.length % 3;
  }
  return symbol + negative + (
      j ? i.substr(0, j) + thousand : ''
  ) + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousand) + (
      places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : ''
  );
}

function woosg_format_price(price) {
  var price_html = '<span class="woocommerce-Price-amount amount">';
  var price_formatted = woosg_format_money(price, woosg_vars.price_decimals, '',
      woosg_vars.price_thousand_separator, woosg_vars.price_decimal_separator);

  switch (woosg_vars.price_format) {
    case '%1$s%2$s':
      //left
      price_html += '<span class="woocommerce-Price-currencySymbol">' +
          woosg_vars.currency_symbol + '</span>' + price_formatted;
      break;
    case '%1$s %2$s':
      //left with space
      price_html += '<span class="woocommerce-Price-currencySymbol">' +
          woosg_vars.currency_symbol + '</span> ' + price_formatted;
      break;
    case '%2$s%1$s':
      //right
      price_html += price_formatted +
          '<span class="woocommerce-Price-currencySymbol">' +
          woosg_vars.currency_symbol + '</span>';
      break;
    case '%2$s %1$s':
      //right with space
      price_html += price_formatted +
          ' <span class="woocommerce-Price-currencySymbol">' +
          woosg_vars.currency_symbol + '</span>';
      break;
    default:
      //default
      price_html += '<span class="woocommerce-Price-currencySymbol">' +
          woosg_vars.currency_symbol + '</span>' + price_formatted;
  }

  price_html += '</span>';

  return price_html;
}

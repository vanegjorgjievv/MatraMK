'use strict';

var woosb_timeout = null;

jQuery(document).ready(function($) {
  if (!$('.woosb-wrap').length) {
    return;
  }

  $('.woosb-wrap').each(function() {
    woosb_init($(this));
  });
});

jQuery(document).on('click touch', '.woosb-plus, .woosb-minus', function() {
  // get values
  var $qty = jQuery(this).
          closest('.woosb-qty').
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
  if (jQuery(this).is('.woosb-plus')) {
    if (max && (
        max == qty_val || qty_val > max
    )) {
      $qty.val(max);
    } else {
      $qty.val((qty_val + step).toFixed(woosb_decimal_places(step)));
    }
  } else {
    if (min && (
        min == qty_val || qty_val < min
    )) {
      $qty.val(min);
    } else if (qty_val > 0) {
      $qty.val((qty_val - step).toFixed(woosb_decimal_places(step)));
    }
  }

  // trigger change event
  $qty.trigger('change');
});

function woosb_decimal_places(num) {
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

jQuery(document).on('click touch', '.single_add_to_cart_button', function(e) {
  var $this = jQuery(this);

  if ($this.hasClass('woosb-disabled')) {
    e.preventDefault();
  }
});

jQuery(document).on('change', '.woosb-qty .qty', function() {
  var $this = jQuery(this);
  woosb_check_qty($this);
});

jQuery(document).on('keyup', '.woosb-qty .qty', function() {
  var $this = jQuery(this);
  if (woosb_timeout != null) clearTimeout(woosb_timeout);
  woosb_timeout = setTimeout(woosb_check_qty, 1000, $this);
});

jQuery(document).on('woosq_loaded', function() {
  // product bundles in quick view popup
  woosb_init(jQuery('#woosq-popup .woosb-wrap'));
});

function woosb_init($woosb_wrap) {
  var wrap_id = $woosb_wrap.attr('data-id');
  var wrap_element = woosb_wrap_element(wrap_id);
  var $woosb_wrap_element = jQuery(wrap_element);

  woosb_check_ready($woosb_wrap_element);
  woosb_calc_price($woosb_wrap_element);
  woosb_save_ids($woosb_wrap_element);
}

function woosb_check_ready($woosb_wrap) {
  var total = 0;
  var selection_name = '';
  var is_selection = false;
  var is_empty = true;
  var is_min = false;
  var is_max = false;

  var $woosb_products = $woosb_wrap.find('.woosb-products');
  var $woosb_btn = $woosb_wrap.find('.single_add_to_cart_button');

  // remove ajax add to cart
  $woosb_btn.removeClass('ajax_add_to_cart');

  if (!$woosb_products.length ||
      (($woosb_products.attr('data-variables') === 'no') &&
          ($woosb_products.attr('data-optional') === 'no'))) {
    // don't need to do anything
    return;
  }

  $woosb_products.find('.woosb-product').each(function() {
    var $this = jQuery(this);

    if ((
        parseFloat($this.attr('data-qty')) > 0
    ) && (
        parseInt($this.attr('data-id')) === 0
    )) {
      is_selection = true;
      if (selection_name === '') {
        selection_name = $this.attr('data-name');
      }
    }

    if (parseFloat($this.attr('data-qty')) > 0) {
      is_empty = false;
      total += parseFloat($this.attr('data-qty'));
    }
  });

  // check min
  if ((
      $woosb_products.attr('data-optional') === 'yes'
  ) && $woosb_products.attr('data-min') && (
      total < parseFloat($woosb_products.attr('data-min'))
  )) {
    is_min = true;
  }

  // check max
  if ((
      $woosb_products.attr('data-optional') === 'yes'
  ) && $woosb_products.attr('data-max') && (
      total > parseFloat($woosb_products.attr('data-max'))
  )) {
    is_max = true;
  }

  if (is_selection || is_empty || is_min || is_max) {
    $woosb_btn.addClass('woosb-disabled');

    if (is_selection) {
      jQuery('.woosb-alert').
          html(woosb_vars.alert_selection.replace('[name]',
              '<strong>' + selection_name + '</strong>')).
          slideDown();
      return;
    }

    if (is_empty) {
      jQuery('.woosb-alert').html(woosb_vars.alert_empty).slideDown();
      return;
    }

    if (is_min) {
      jQuery('.woosb-alert').html(woosb_vars.alert_min.replace('[min]',
          $woosb_products.attr('data-min'))).slideDown();
      return;
    }

    if (is_max) {
      jQuery('.woosb-alert').html(woosb_vars.alert_max.replace('[max]',
          $woosb_products.attr('data-max'))).slideDown();
    }
  } else {
    jQuery('.woosb-alert').html('').slideUp();
    $woosb_btn.removeClass('woosb-disabled');
  }
}

function woosb_calc_price($woosb_wrap) {
  var total = 0;
  var total_sale = 0;
  var $woosb_products = $woosb_wrap.find('.woosb-products');
  var $woosb_total = $woosb_wrap.find('.woosb-total');
  var $woobt_wrap = jQuery('.woobt-wrap').eq(0);
  var total_woobt = parseFloat(
      $woobt_wrap.length ? $woobt_wrap.attr('data-total') : 0);
  var _discount = parseFloat($woosb_products.attr('data-discount'));
  var _discount_amount = parseFloat(
      $woosb_products.attr('data-discount-amount'));
  var _saved = '';
  var _fix = Math.pow(10, Number(woosb_vars.price_decimals) + 1);
  var is_discount = _discount > 0 && _discount < 100;
  var is_discount_amount = _discount_amount > 0;

  $woosb_products.find('.woosb-product').each(function() {
    var $this = jQuery(this);
    if (parseFloat($this.attr('data-price')) > 0) {
      var this_price = parseFloat($this.attr('data-price')) *
          parseFloat($this.attr('data-qty'));
      total += this_price;
      if (!is_discount_amount && is_discount) {
        this_price *= (100 - _discount) / 100;
        this_price = Math.round(this_price * _fix) / _fix;
      }
      total_sale += this_price;
    }
  });

  // fix js number https://www.w3schools.com/js/js_numbers.asp
  total = woosb_round(total, woosb_vars.price_decimals);

  if (is_discount_amount && _discount_amount < total) {
    total_sale = total - _discount_amount;
    _saved = woosb_format_price(_discount_amount);
  } else if (is_discount) {
    _saved = woosb_round(_discount, 2) + '%';
  } else {
    total_sale = total;
  }

  var total_html = woosb_price_html(total, total_sale);
  var total_all_html = woosb_price_html(total + total_woobt,
      total_sale + total_woobt);

  if (_saved !== '') {
    total_html += ' <small class="woocommerce-price-suffix">' +
        woosb_vars.saved_text.replace('[d]', _saved) + '</small>';
  }

  var price_selector = '.summary > .price';

  if ((woosb_vars.change_price === 'yes_custom') &&
      (woosb_vars.price_selector != null) &&
      (woosb_vars.price_selector !== '')) {
    price_selector = woosb_vars.price_selector;
  }

  // change the bundle total
  $woosb_total.html(woosb_vars.price_text + ' ' + total_html).slideDown();

  if ((
      woosb_vars.change_price !== 'no'
  ) && (
      $woosb_products.attr('data-fixed-price') === 'no'
  ) && (
      (
          $woosb_products.attr('data-variables') === 'yes'
      ) || (
          $woosb_products.attr('data-optional') === 'yes'
      )
  )) {
    // change the main price
    if ($woobt_wrap.length) {
      // check if has woobt
      $woosb_wrap.find(price_selector).html(total_all_html);
    } else {
      $woosb_wrap.find(price_selector).html(total_html);
    }
  }

  if ($woobt_wrap.length) {
    // check if has woobt
    $woobt_wrap.find('.woobt-products').attr('data-product-price', total_sale);
  }

  jQuery(document).trigger('woosb_calc_price', [total_sale, total, total_html]);
}

function woosb_save_ids($woosb_wrap) {
  var woosb_ids = Array();
  var $woosb_products = $woosb_wrap.find('.woosb-products');
  var $woosb_ids = $woosb_wrap.find('.woosb-ids');

  $woosb_products.find('.woosb-product').each(function() {
    var $this = jQuery(this);

    if ((
        parseInt($this.attr('data-id')) > 0
    ) && (
        parseFloat($this.attr('data-qty')) > 0
    )) {
      woosb_ids.push($this.attr('data-id') + '/' + $this.attr('data-qty'));
    }
  });

  $woosb_ids.val(woosb_ids.join(','));

  jQuery(document).trigger('woosb_save_ids', [woosb_ids]);
}

function woosb_check_qty($woosb_qty) {
  var $woosb_wrap = $woosb_qty.closest('.woosb-wrap');
  var qty = parseFloat($woosb_qty.val());
  var min_qty = parseFloat($woosb_qty.attr('min'));
  var max_qty = parseFloat($woosb_qty.attr('max'));

  if ((qty === '') || isNaN(qty)) {
    qty = 0;
  }

  if (!isNaN(min_qty) && (
      qty < min_qty
  )) {
    qty = min_qty;
  }

  if (!isNaN(max_qty) && (
      qty > max_qty
  )) {
    qty = max_qty;
  }

  $woosb_qty.val(qty);
  $woosb_qty.closest('.woosb-product').attr('data-qty', qty);

  // change subtotal
  if (woosb_vars.bundled_price === 'subtotal') {
    var $woosb_products = $woosb_wrap.find('.woosb-products');
    var $woosb_product = $woosb_qty.closest('.woosb-product');
    var ori_price = parseFloat($woosb_product.attr('data-price')) *
        parseFloat($woosb_product.attr('data-qty'));

    $woosb_product.find('.woosb-price-ori').hide();

    if (parseFloat($woosb_products.attr('data-discount')) > 0 &&
        $woosb_products.attr('data-fixed-price') === 'no') {
      var new_price = ori_price *
          (100 - parseFloat($woosb_products.attr('data-discount'))) / 100;

      $woosb_product.find('.woosb-price-new').
          html(woosb_price_html(ori_price, new_price)).show();
    } else {
      $woosb_product.find('.woosb-price-new').
          html(woosb_price_html(ori_price)).
          show();
    }
  }

  woosb_init($woosb_wrap);
}

function woosb_change_price($woosb_product, price, regular_price, price_html) {
  var $woosb_products = $woosb_product.closest('.woosb-products');

  // hide ori price
  $woosb_product.find('.woosb-price-ori').hide();

  // calculate new price
  if (woosb_vars.bundled_price === 'subtotal') {
    var ori_price = parseFloat(price) *
        parseFloat($woosb_product.attr('data-qty'));

    if (woosb_vars.bundled_price_from === 'regular_price' &&
        regular_price !== undefined) {
      ori_price = parseFloat(regular_price) *
          parseFloat($woosb_product.attr('data-qty'));
    }

    var new_price = ori_price;

    if (parseFloat($woosb_products.attr('data-discount')) > 0) {
      new_price = ori_price *
          (100 - parseFloat($woosb_products.attr('data-discount'))) / 100;
    }

    $woosb_product.find('.woosb-price-new').
        html(woosb_price_html(ori_price, new_price)).show();
  } else {
    if (parseFloat($woosb_products.attr('data-discount')) > 0) {
      var ori_price = parseFloat(price);

      if (woosb_vars.bundled_price_from === 'regular_price' &&
          regular_price !== undefined) {
        ori_price = parseFloat(regular_price);
      }

      var new_price = ori_price *
          (100 - parseFloat($woosb_products.attr('data-discount'))) / 100;
      $woosb_product.find('.woosb-price-new').
          html(woosb_price_html(ori_price, new_price)).show();
    } else {
      if (price_html !== '') {
        $woosb_product.find('.woosb-price-new').
            html(price_html).
            show();
      } else {
        var ori_price = parseFloat(price);

        if (woosb_vars.bundled_price_from === 'regular_price' &&
            regular_price !== undefined) {
          ori_price = parseFloat(regular_price);
        }

        $woosb_product.find('.woosb-price-new').
            html(woosb_price_html(ori_price, ori_price)).
            show();
      }
    }
  }
}

function woosb_round(value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

function woosb_format_money(number, places, symbol, thousand, decimal) {
  number = number || 0;
  places = !isNaN(places = Math.abs(places)) ? places : 2;
  symbol = symbol !== undefined ? symbol : '$';
  thousand = thousand || ',';
  decimal = decimal || '.';

  var negative = number < 0 ? '-' : '',
      i = parseInt(
          number = woosb_round(Math.abs(+number || 0), places).toFixed(places),
          10) + '',
      j = 0;

  if (i.length > 3) {
    j = i.length % 3;
  }

  return symbol + negative + (
      j ? i.substr(0, j) + thousand : ''
  ) + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousand) + (
      places ?
          decimal +
          woosb_round(Math.abs(number - i), places).toFixed(places).slice(2) :
          ''
  );
}

function woosb_format_price(price) {
  var price_html = '<span class="woocommerce-Price-amount amount">';
  var price_formatted = woosb_format_money(price, woosb_vars.price_decimals, '',
      woosb_vars.price_thousand_separator, woosb_vars.price_decimal_separator);

  switch (woosb_vars.price_format) {
    case '%1$s%2$s':
      //left
      price_html += '<span class="woocommerce-Price-currencySymbol">' +
          woosb_vars.currency_symbol + '</span>' + price_formatted;
      break;
    case '%1$s %2$s':
      //left with space
      price_html += '<span class="woocommerce-Price-currencySymbol">' +
          woosb_vars.currency_symbol + '</span> ' + price_formatted;
      break;
    case '%2$s%1$s':
      //right
      price_html += price_formatted +
          '<span class="woocommerce-Price-currencySymbol">' +
          woosb_vars.currency_symbol + '</span>';
      break;
    case '%2$s %1$s':
      //right with space
      price_html += price_formatted +
          ' <span class="woocommerce-Price-currencySymbol">' +
          woosb_vars.currency_symbol + '</span>';
      break;
    default:
      //default
      price_html += '<span class="woocommerce-Price-currencySymbol">' +
          woosb_vars.currency_symbol + '</span> ' + price_formatted;
  }

  price_html += '</span>';

  return price_html;
}

function woosb_price_html(regular_price, sale_price) {
  var price_html = '';

  if (sale_price < regular_price) {
    price_html = '<del>' + woosb_format_price(regular_price) + '</del> <ins>' +
        woosb_format_price(sale_price) + '</ins>';
  } else {
    price_html = woosb_format_price(regular_price);
  }

  return price_html;
}

function woosb_wrap_element(id) {
  if (jQuery('#product-' + id).length) {
    return '#product-' + id;
  }

  if (jQuery('.product.post-' + id).length) {
    return '.product.post-' + id;
  }

  if (jQuery('.product.product-type-woosb').length) {
    return '.product.product-type-woosb';
  }

  return 'body.single-product';
}

const Coupon = require('../models/couponModel')
var voucher_codes = require('voucher-code-generator');

<script src="voucher_codes.js"></script>

voucher_codes.generate({
    length: 8,
    count: 5
});
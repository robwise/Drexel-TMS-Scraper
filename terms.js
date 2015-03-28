var request = require('request');
var cheerio = require('cheerio');
var url = require('./form').url;

module.exports.list = function(req, res) {
    request(url, function(error, request, body) {
        $ = cheerio.load(body);
        var select_options = $('select#term').children();
        var terms = {};

        select_options.each(function(index, select_option) {
            var value = select_option.attribs.value; // e.g., "7"
            var pretty_name = select_option.val(); // e.g., "Spring Quarter 14-15"
            terms[value] = pretty_name;
        });
        delete terms['0']; // remove 'Select a Term' default option
        res.set('Content-Type', 'application/json');
        res.send(terms);
    });
};

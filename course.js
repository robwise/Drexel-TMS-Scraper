// Retrieves the first course matching the given department
var request = require('request');
var cheerio = require('cheerio');
var form = require('./form');
var courses = require('./courses');

module.exports.getCourse = function(req, res) {
    req.query.term = 7;
    req.query.number = req.number;
    var results = courses.getCourses;

    var retCourse = null;
    var i = 0;

    // Find the first 'INFO' course
    while(null === retCourse && i < results.length) {
        if ("INFO" === results[i].subjectcode) {
            retCourse = results[i];
        }
        i++;
    }

    res.write(retCourse);
};

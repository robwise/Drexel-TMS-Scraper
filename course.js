// Retrieves the first course matching the given department
var request = require('request');
var cheerio = require('cheerio');
var form = require('./form');
var courses = require('./courses');

module.exports.getCourse = getCourse;

function getCourse(req, res) {
    // Get all courses with the given course number
    var term = 7;
    var number = req.params.number;
    courses.buildCoursesFromSearch(term, '', number, '', function(courses){
        findInfoCourse(courses, function(matchingCourse) {
            if (null === matchingCourse) {
                res.status(404).json('Could not find INFO ' + number + '.');
            }
            res.json(matchingCourse);
        });
    });
}

// Find the first 'INFO' course from search results and send it as response
function findInfoCourse(courses, callbackFn) {
    var matchingCourse = null;
    var i = 0;

    while(null === matchingCourse && i < Object.keys(courses).length) {
        if ("INFO" == courses[i].department) {
            matchingCourse = courses[i];
        }
        i++;
    }
    callbackFn(matchingCourse);
}

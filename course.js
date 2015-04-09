// Retrieves the first course matching the given department
var request = require('request');
request = request.defaults({jar: true}); // Cookies enabled (requires 'tough-cookie' to be installed)
var cheerio = require('cheerio');
var form = require('./form');
var courses = require('./courses');
var util = require('./util');

module.exports.getCourse = getCourse;

function getCourse(req, res) {
    // Get all courses with the given course number
    var term = 7;
    var number = req.params.number;
    courses.searchForCourses(term, '', number, '', function(courses){
        findInfoCourse(courses, function(matchingCourse) {
            if (null === matchingCourse) {
                res.status(404).json('Could not find INFO ' + number + '.');
            } else {
                addDetailsToCourse(matchingCourse, function(detailedMatchingCourse){
                    res.json(detailedMatchingCourse);
                });
            }
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

// Passes version of the given course that is decorated with additional details
// as an argument to the callback
function addDetailsToCourse(course, callbackFn) {
    request(course.detailsURL, function(error, request, body) {
        $ = cheerio.load(body);

        var courseDescriptionEl = $('.courseDesc');
        course.courseDescription = util.getTextFromEl(courseDescriptionEl);

        var subpoints = $('.subpoint');

        var corequisiteSubpoint = subpoints[subpoints.length - 3];
        var corequisiteSpan = $(corequisiteSubpoint).find('span');
        course.corequisite = util.getTextFromEl(corequisiteSpan);

        var prerequisiteSubpoint = subpoints[subpoints.length - 2];
        var prerequisiteSpan = $(prerequisiteSubpoint).find('span');
        course.prerequisite = util.getTextFromEl(prerequisiteSpan);

        callbackFn(course);
    });
}

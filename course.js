// Retrieves the first course matching the given department
var request = require('request');
request = request.defaults({jar: true}); // Cookies enabled (requires 'tough-cookie' to be installed)
var cheerio = require('cheerio');
var form = require('./form');
var courses = require('./courses');
var util = require('./util');

module.exports.getCourse = getCourse;
module.exports.buildDetailedInfoCourse = buildDetailedInfoCourse;

function getCourse(req, res) {
    // Get all courses with the given course number
    var number = req.params.number;
    buildDetailedInfoCourse(number, function(infoCourse) {
        if (null === infoCourse) {
            res.status(404).json('Could not find course INFO ' + number + '.');
        } else {
            res.json(infoCourse);
        }
    });
}

function buildDetailedInfoCourse(courseNumber, callbackFn) {
    var term = 7;
    courses.buildCoursesFromSearch(term, '', courseNumber, '', function(courses){
        retrieveInfoCourseFromCourses(courses, function(matchingCourse) {
            addDetailsToCourse(matchingCourse, function(detailedMatchingCourse) {
                callbackFn(detailedMatchingCourse);
            });
        });
    });
}

// Find the first 'INFO' course from search results and send it as response
function retrieveInfoCourseFromCourses(courses, callbackFn) {
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
    if (null === course || null === course.detailsURL) {
        callbackFn(null);
        return;
    }
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

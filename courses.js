var request = require('request');
request = request.defaults({jar: true}); // Cookies enabled (requires 'tough-cookie' to be installed)
var cheerio = require('cheerio');
var form = require('./form');
var util = require('./util');

module.exports.getCourses = getCourses;
module.exports.searchForCourses = searchForCourses;

function getCourses(req, res) {
    if (sendErrorIfBadQuery(req, res)) {
        return;
    }

    searchForCourses(req.query.term,
                           req.query.name,
                           req.query.number,
                           req.query.crn,
                           function(courses){
                               res.send(courses);
                           }
                          );
}

// Responds with an error if term and at least one other query attribute are not
// present. Returns true if the query is bad. False means good to go.
function sendErrorIfBadQuery(req, res) {
    var badQuery = false;
    if(!req.query.term) {
        res.status(400).send('Bad request: query must include a term');
        badQuery = true;
    }
    if(!(req.query.name || req.query.number || req.query.crn)) {
        res.status(400).send('Bad request: query must include a course name, ' +
                             'course number, or CRN.');
        badQuery = true;
    }
    return badQuery;
}

// Fills search form and submits post request, parses results into course
// objects, and passes these courses as an argument to the callback function
function searchForCourses(term, name, number, crn, callbackFn) {
    var url = form.url;
    var formData = form.buildForm(term, name, number, crn);
    var courses = {};
    var courseIndex = 0;

    request.post({ url: url, form: formData }, function (error, request, body) {
        $ = cheerio.load(body);
        console.log("New request");
        $(".even, .odd").each(function() {
            parseCourse('[valign=top]', $(this), courses);
            parseCourse('[valign=center]', $(this), courses);
        });
        callbackFn(courses); // Must go here or may be executed out of order
    });
}

// Creates a course object from the TD cells of a parent row and adds to passed
// courses array
function parseCourse(attribute, parentElement, courses) {
    var courseIndex = Object.keys(courses).length;
    var course = {};
    var resultAttributeIndex = 0;
    $(parentElement).find('td ' + attribute).each(function() {
        switch (resultAttributeIndex) {
            case 0:
                course.department = util.getTextFromEl($(this));
                break;
            case 1:
                course.level = util.getTextFromEl($(this));
                break;
            case 2:
                course.instructionType = util.getTextFromEl($(this));
                break;
            case 3:
                course.section = util.getTextFromEl($(this));
                break;
            case 4:
                course.crn = util.getTextFromEl($(this));
                course.detailsURL = getCourseDetailsURLFromEl($(this));
                break;
            case 5:
                course.title = util.getTextFromEl($(this));
                break;
            case 6:
                course.instructor = util.getTextFromEl($(this));
                break;
            default:
                break;
        }
        resultAttributeIndex++;
    });
    // Ignore non-course table entries
    if(Object.keys(course).length !== 0) {
        courses[courseIndex] = course;
    }
}

// NOTE: this URL is only usable by the server since it is session-specific
function getCourseDetailsURLFromEl(el) {
    // The href value isn't a usable URL, so we must build it by extracting
    // the query string and adding it on to the base URL
    var href = $(el).find('a').attr('href').toString();
    var queryStringRegex = /\?component=.*/;
    var queryString = queryStringRegex.exec(href)[0];

    return form.url + queryString;
}

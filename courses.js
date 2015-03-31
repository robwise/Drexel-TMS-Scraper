var request = require('request');
var cheerio = require('cheerio');
var form = require('./form');

module.exports.getCourses = getCourses;
module.exports.buildCoursesFromSearch = buildCoursesFromSearch;

function getCourses(req, res) {
    if (sendErrorIfBadQuery(req, res)) {
        return;
    }

    buildCoursesFromSearch(req.query.term,
                           req.query.name,
                           req.query.number,
                           req.query.crn,
                           function(courses){
                            res.send(courses);
                        });
}

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

// Takes a function as last argument due to asynchronous call of request.post
function buildCoursesFromSearch(term, name, number, crn, callbackFn) {
    var url = form.url;
    var formData = form.buildForm(term, name, number, crn);
    var courses = {};
    var courseIndex = 0;

    request.post({ url: url, form: formData }, function (error, request, body) {
        $ = cheerio.load(body);
        console.log("New request");
        $(".even, .odd").each(function() {
            var course = parseCourseFromRow('[valign=top]', $(this));

            // Ignore non-course table entries
            if(Object.keys(course).length !== 0) {
                courses[courseIndex] = course;
                courseIndex++;
            }
        });
        $(".even, .odd").each(function() {
            var course = parseCourseFromRow('[valign=center]', $(this));

            // Ignore non-course table entries
            if(Object.keys(course).length !== 0) {
                courses[courseIndex] = course;
                courseIndex++;
            }
        });
        callbackFn(courses); // Must go here or may be executed out of order
    });
}

// Creates a course object from the TD cells of a parent row
function parseCourseFromRow(attribute, parentElement) {
    var course = {};
    var resultAttributeIndex = 0;
    $(parentElement).find('td ' + attribute).each(function() {
        switch (resultAttributeIndex) {
            case 0:
                course.department = getCourseAttributeFromTdEl($(this));
                break;
            case 1:
                course.level = getCourseAttributeFromTdEl($(this));
                break;
            case 2:
                course.instructorType = getCourseAttributeFromTdEl($(this));
                break;
            case 3:
                course.section = getCourseAttributeFromTdEl($(this));
                break;
            case 4:
                course.crn = getCourseAttributeFromTdEl($(this));
                break;
            case 5:
                course.courseTitle = getCourseAttributeFromTdEl($(this));
                break;
            case 6:
                course.instructor = getCourseAttributeFromTdEl($(this));
                break;
            default:
                break;
        }
        resultAttributeIndex++;
    });
    return course;
}

function getCourseAttributeFromTdEl(tdEl) {
    var courseAttribute = tdEl.text();
    courseAttribute = courseAttribute.trim();
    courseAttribute = courseAttribute.replace(/\s{2,}/g, ' '); // remove multiple spaces
    return courseAttribute;
}

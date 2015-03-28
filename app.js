var express = require('express');
var courses = require('./courses');
var terms = require('./terms');

var app = express();

// Declare routes
app.get('/terms', terms.list);
app.get('/courses', courses.getCourses);

// Start app
var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on port " + port);
});

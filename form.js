module.exports.url = 'https://duapp2.drexel.edu/webtms_du/app';

module.exports.buildForm = function(term, courseName, courseNumber, crn) {
    courseName = courseName || '';
    courseNumber = courseNumber || '';
    crn = crn || '';
    return {
        formids: "term,courseName,crseNumb,crn",
            component: "searchForm",
            page: "Home",
            service: "direct",
            submitmode: "submit",
            submitname: "",
            term: term,
            courseName: courseName,
            crseNumb: courseNumber,
            crn: crn
    };
};

function getTextFromEl(el) {
    var courseAttribute = el.text();
    courseAttribute = courseAttribute.trim();
    courseAttribute = courseAttribute.replace(/\s{2,}/g, ' '); // remove multiple spaces
    return courseAttribute;
}

module.exports.getTextFromEl = getTextFromEl;

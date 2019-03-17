/**
 * Module dependencies.
 */

exports.JSONGetter = function (propertyName) {
  return function JSONGetter() {
    var value = this.getDataValue(propertyName);
    if (value && typeof value === 'string') {
      value = JSON.parse(value);
    }
    return value;
  };
};

exports.JSONSetter = function (propertyName) {
  return function JSONSetter(value) {
    if (typeof value !== 'string') {
      value = JSON.stringify(value);
    }
    this.setDataValue(propertyName, value);
  };
};

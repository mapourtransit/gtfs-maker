/*
 * calendarBuilder
 * returns array with serviceId
 */
var _ = require('lodash');

module.exports = function(data){
  return [
    /* winter working days */
    ['WW', 1, 1, 1, 1, 1, 1, 0, data.winter['start_date'], data.winter['end_date']],
    /* summer working days */
    ['SW', 1, 1, 1, 1, 1, 1, 0, data.summer['start_date'], data.summer['end_date']],
    /* non working days */
    ['NW', 0, 0, 0, 0, 0, 0, 1, data.year['start_date'], data.year['end_date']]
  ];
};

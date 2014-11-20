/*
 * stopsBuilder
 * returns array with shapes for GTFS, one point per row
 */
var _ = require('lodash');

module.exports = function(data){
  var stops = [];
  _.each(data[0].elements, function(element){
    if (element.type == 'node' ){
      if (element.tags.public_transport && element.tags.public_transport == 'platform'){
        stops.push([
          element.id, // stop_id
          element.tags.ref || element.tags.rel, // stop_code
          element.tags.name || element.tags['addr:street'] || 'TOFIX NO NAME', // stop_name
          element.tags.desc, // stop_desc
          element.lat, // stop_lat
          element.lon // stop_lon
        ]);
      }
    }
  });
  return stops;
};

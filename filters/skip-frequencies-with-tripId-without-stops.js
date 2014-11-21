var _ = require('lodash');

module.exports = function(gtfs){
  var frequencies = gtfs[0];
  var stopTimes = gtfs[1];

  var filtered = [];

  frequencies.forEach(function(frequency){
    var index = _.findIndex( stopTimes, function(stopTime){
      return stopTime['trip_id'] == frequency['trip_id'];
    });
    if ( index !== -1 ){
      // keep this trip
      filtered.push([
        frequency['trip_id'],
        frequency['start_time'],
        frequency['end_time'],
        frequency['headway_secs'],
        frequency['exact_times']
        ]);
    } else {
      console.log('No stops for trip ' + frequency['trip_id'] + '. This trip has been removed from frequencies.txt.');
    }
  });

  return filtered;
};

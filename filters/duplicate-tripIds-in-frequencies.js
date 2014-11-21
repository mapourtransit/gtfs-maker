var _ = require('lodash');

module.exports = function(gtfs){
  var frequencies = gtfs[0];

  var filtered = [];

  frequencies.forEach(function(current){
    var index = _.findIndex( filtered, function( frequency ){
      return current['trip_id'] == frequency[0];
    });
    if ( index !== -1 ){
      // keep this trip
      filtered.push([
        current['trip_id'],
        current['start_time'],
        current['end_time'],
        current['headway_secs'],
        current['exact_times']
        ]);
      } else {
        console.log('Duplicate tripId ' + current['trip_id'] + '. This trip has been removed from frequencies.txt.');
      }
    });

    return filtered;
  };

var _ = require('lodash');
var moment = require('moment');

module.exports = function(gtfs){

  var frequencies = gtfs[0];
  var stopTimes = gtfs[1];

  var unfolded = [];

  stopTimes.forEach(function(stopTime){
     var frequency = _.findWhere(frequencies, {
       'trip_id':stopTime['trip_id']
     });

     if ( frequency ){
       var startTime = moment(frequency['start_time'], 'HH:mm:ss');
       var endTime = moment(frequency['end_time'], 'HH:mm:ss');
       var inc = frequency['headway_secs'];
       var currentTime = moment(frequency['start_time'], 'HH:mm:ss');
       while ( currentTime.isBefore(endTime) ){
         // trip_id,arrival_time,departure_time,stop_id,stop_sequence
         unfolded.push([
           stopTime['trip_id'],
           currentTime.format('HH:mm:ss'),
           currentTime.format('HH:mm:ss'),
           stopTime['stop_id'],
           stopTime['stop_sequence']
         ]);
         currentTime.add( inc, 'seconds' );
       }
     } else {
       console.log('No frequency for trip ' + stopTime['trip_id']);
     }
  });

  return unfolded;

};

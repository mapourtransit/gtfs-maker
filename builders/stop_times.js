var _ = require('lodash');


module.exports = function(data){

  var masters = data[0].elements;
  var routes = data[1].elements;
  var stops = data[2].elements;
  var timetables = data[3];
  var trips = data[4];

  var stoptimes = [];

  // create lookup for ways and nodes
  var lookup = { routes: {}, stops: {} };
  function createLookup(acc, obj){
    acc[obj.id] = obj;
    return acc;
  }
  _.reduce(routes, createLookup, lookup.routes);
  _.reduce(stops, createLookup, lookup.stops);

  trips.forEach(function(trip){
    masters.forEach( function(master){
      // fetch timetable for this line
      var timetable = _.find( timetables, function(timetable){
        return timetable.line == master.tags.ref;
      });
      if (!timetable){
        throw new Error('No timetable found for route ' + master.tags.ref + '.');
      }
      master.members.forEach(function(member){
        var route = lookup.routes[member.ref];
        var tripId = trip.trip_id;
        var index = 0;
        route.members.forEach(function(member){
          if (member.type == 'node' ){
            if (member.role && member.role == 'platform'){
              var stop = lookup.stops[ member.ref ];
              if (!stop){
                throw new Error('stop not found: ' + member.ref + ' in route ' + route.id + ' (' + master.tags.name + ')');
              }
              var code = stop.tags.ref || stop.tags.rel;
              if (!code){
                throw new Error('stop ' + member.ref + ' does not have tags.ref or tag.rel (deprecated) in route ' + route.id + ' (' + master.tags.name + ')');
              }

              var timesForStop = _.filter(timetable.stopTimes, function(stoptime){
                return stoptime.id == code;
              });
              if (timesForStop.length === 0){
                throw new Error('no entry in timetable for stop "' + code + '" in route ' + route.id + ' (' + master.tags.name + ')');
              }
              timesForStop.forEach(function(stoptime){
                var time = stoptime.time;
                var stopId = stoptime.id;
                if (!time){
                  throw new Error('no arrival/departure time for stop ' + code + '" in route ' + route.id + ' (' + master.tags.name + ')');
                }
                stoptimes.push({
                  trip_id:tripId,
                  arrival_time:time,
                  departure_time:time,
                  stop_id:stopId,
                  stop_sequence:index++
                });
              });

            }
          }
        });
      });
    });
  });

  return stoptimes;
};

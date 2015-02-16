var _ = require('lodash');


module.exports = function(data, options){

  options = options || {};

  var masters = data[0].elements;
  var routes = data[1].elements;
  var stops = data[2].elements;
  var timetables = data[3];
  var trips = data[4];

  var stoptimes = [];

  var exclude = options.exclude || [];

  // create lookup for ways and nodes
  var lookup = { routes: {}, stops: {}, masters:{} };
  function createLookup(acc, obj){
    acc[obj.id] = obj;
    return acc;
  }
  _.reduce(routes, createLookup, lookup.routes);
  _.reduce(stops, createLookup, lookup.stops);
  _.reduce(masters, createLookup, lookup.masters);

  trips.forEach(function(trip){
    // routeId is a reference to the master relation on OSM
    // we need it in order to know which line is
    var routeId = trip.route_id;
    // shapeId is a reference to the particular geographical shape on OSM
    // we need it in order to retrieve stops;
    var shapeId = trip.shape_id;
    var tripId = trip.trip_id;

    var master = lookup.masters[ routeId ];
    var route = lookup.routes[ shapeId ];


    if ( !master ){
      // I am not able to infer the name of this line
      console.error('no correpondence found on OSM for master id ' + routeId + ' in trip ' + tripId + '.');
      return; // skip
    }

    if ( _.contains(exclude, master.tags.ref)){
      return; // skip this line
    }

    // fetch timetable for this line
    var timetable = _.find( timetables, function(timetable){
      // XXX replace needed to handle with 6/A, 6/B, find a better solution
      // not dependent on Miccolis
      return timetable.line == master.tags.ref.replace('/', '');
    });
    if (!timetable){
      throw new Error('No timetable found for route ' + master.tags.ref + '.');
    }
    var index = 0;
    // for each stop in this relation
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

  return stoptimes;
};

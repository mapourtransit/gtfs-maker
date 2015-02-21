var _ = require('lodash');
var Filter = require('../lib/filter');
var moment = require('moment');

module.exports = function(data, options){

  options = options || {};

  var masters = data[0];
  var routes = data[1];
  var stops = data[2];
  var timetables = data[3];
  var trips = data[4];

  var stoptimes = [];

  var include = options.include || [];

  var filter = new Filter(this._settings, include);

  // create lookup for ways and nodes
  var lookup = { routes: {}, stops: {}, masters:{} };
  function createLookup(acc, obj){
    acc[obj.id] = obj;
    return acc;
  }
  _.reduce(routes, createLookup, lookup.routes);
  _.reduce(stops, createLookup, lookup.stops);
  _.reduce(masters, createLookup, lookup.masters);

  filter.included( masters ).forEach(function(master){

    var selectedTrips = _.filter(trips, function(trip){
      return trip.route_id == master.id;
    });

    if (trips.length === 0){
      throw new Error('No trip for master relation ' + master.tags.ref + '.');
    }

    selectedTrips.forEach(function(trip){
      // routeId is a reference to the master relation on OSM
      // we need it in order to know which line is
      var routeId = trip.route_id;
      // shapeId is a reference to the particular geographical shape on OSM
      // we need it in order to retrieve stops;
      var shapeId = trip.shape_id;
      var tripId = trip.trip_id;
      var route = lookup.routes[ shapeId ];

      // fetch timetable for this line
      var timetable = _.find( timetables, function(timetable){
        return timetable.osmId == master.id;
      });
      if (!timetable){
        throw new Error('No timetable found for route ' + master.tags.ref + '.');
      }
      var index = 0;
      var lastTime = moment("00:00", "HH:mm");
      // for each stop in this relation
      route.members.forEach(function(member){
        if (member.type == 'node' ){
          if (member.role && member.role == 'platform'){
            var stop = lookup.stops[ member.ref ];
            if (!stop){
              throw new Error('stop not found: ' + member.ref + ' in route ' + route.id + ' (' + master.tags.name + ')');
            }
            // TODO stop.tags.rel is deprecated
            var code = stop.tags.ref || stop.tags.rel;
            var stopId = stop.id;
            if (!code){
              throw new Error('stop ' + member.ref + ' does not have tags.ref or tag.rel (deprecated) in route ' + route.id + ' (' + master.tags.name + ')');
            }

            var timesForStop = _.filter(timetable.stopTimes, function(stoptime){
              var time = stoptime.time;
              if (!time) return false;
              return stoptime.id == code
                  && ( moment(time, "HH:mm").isAfter(lastTime) || moment(time, "HH:mm").isSame(lastTime) );
            });

            /*if (timesForStop.length === 0){
              throw new Error('no entry in timetable for stop "' + code + '" in route ' + route.id + ' (' + master.tags.name + ')');
            }*/
            // take the first suitable time
            timesForStop.slice(0,1).forEach(function(stoptime){
              var time = stoptime.time;
              // time is valid only if seconds are included
              if ( time.length < 8){
                time += ':00';
              }
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
              lastTime = moment(time, "HH:mm");
            });

          }
        }
      });
    });

  });

  return stoptimes;
};

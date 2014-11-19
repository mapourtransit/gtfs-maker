var _ = require('lodash');

// return the index of the first occurence of an object in an array
// adapted from http://stackoverflow.com/questions/10457264/how-to-find-first-element-of-array-matching-a-boolean-condition-in-javascript
function indexOf(arr, test, ctx) {
    var result = null;
    arr.some(function(el, i) {
        return test.call(ctx, el, i, arr) ? ((result = i), true) : false;
    });
    return result;
}

/**
 * use info from Miccolis timetable to infer if a trip is a return trip
 */
function isReturnTrip(timetable, from, to){
  var toIndex = indexOf( timetable, function(row){
    return row.name.toLowerCase() == to.toLowerCase();
  });
  var fromIndex = indexOf( timetable, function(row){
    return row.name.toLowerCase() == from.toLowerCase();
  });
  return fromIndex > toIndex;
}

var frequencies = [];

module.exports = function(data, timetables, calendar){

  var masters = data[0].elements;
  var routes = data[1].elements;

  // create lookup for routes
  var lookup = { routes: {} };
  function createLookup(acc, obj){
    acc[obj.id] = obj;
    return acc;
  }
  _.reduce(routes, createLookup, lookup.routes);

    masters.forEach( function(master){

      // fetch seasonal services for this line
      var services = _.where(calendar, {
        'line_id':master.tags.ref
      });
      // fetch timetable for this line
      var timetable = timetables[ master.tags.ref ];

      services.forEach(function(service){

        master.members.forEach(function(member){
          var route = lookup.routes[ member.ref ];
          var tripId = master.id
                       + '_' + service['service_id']
                       + '_' + route.tags.from
                       + '_' + route.tags.to;

          if ( isReturnTrip(timetable, route.tags.from, route.tags.to)  ){ 
            frequencies.push([
              tripId, // trip_id,
              service['r_start_time'], // start_time,
              service['r_end_time'], // end_time,
              3600, // headway_secs 60 secs
              1 // exact_times
            ]);
          } else {
            frequencies.push([
              tripId, // trip_id,
              service['start_time'], // start_time,
              service['end_time'], // end_time,
              3600, // headway_secs 60 secs
              1 // exact_times
            ]);
          }


        });

      });
    });


  return frequencies;

};

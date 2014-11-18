var _ = require('lodash');

var frequencies = [];

module.exports = function(data, calendar){

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
      var services = _.where(calendar, {
        'line_id':master.tags.ref
      });
      services.forEach(function(service){
        // TODO a problem with return trip
        // eg via Fermi -> via Frangione
        // and back via Frangione -> via Fermi
        // we need to compute return trip times

        // TODO how to get orders?

        frequencies.push([
          tripId, // trip_id,
          service['start_time'], // start_time,
          service['end_time'], // end_time,
          3600, // headway_secs 60 secs
          1 // exact_times
        ]);

        // and back
        frequencies.push([
          tripId, // trip_id,
          service['r_start_time'], // start_time,
          service['r_end_time'], // end_time,
          3600, // headway_secs 60 secs
          1 // exact_times
        ]);

        master.members.forEach(function(member){
          var route = lookup.routes[member.ref];
          var tripId = master.id
                       + '_' + service['service_id']
                       + '_' + route.tags.from
                       + '_' + route.tags.to;
          frequencies.push([
            tripId, // trip_id,
            service['start_time'], // start_time,
            service['end_time'], // end_time,
            3600, // headway_secs 60 secs
            1 // exact_times
          ]);
        });
      });
    });


  return frequencies;

};

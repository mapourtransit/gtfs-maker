var _ = require('lodash');


module.exports = function(data, gtfs){

  var masters = data[0].elements;
  var routes = data[1].elements;
  var calendar = gtfs[0];

  // create lookup for ways and nodes
  var lookup = { routes: {} };
  function createLookup(acc, obj){
    acc[obj.id] = obj;
    return acc;
  }
  _.reduce(routes, createLookup, lookup.routes);

  var trips = [];

  masters.forEach( function(master){

    calendar.forEach( function(service){

      master.members.forEach(function(member){
        var route = lookup.routes[member.ref];
        var tripId = master.id
                     + '_' + service['service_id']
                     + '_' + route.tags.from
                     + '_' + route.tags.to
                     + '_' + member.ref;
        trips.push([
          master.id, // route_id
          service['service_id'], // service_id
          tripId, // trip_id
          route.tags.to, // trip_headsign
          route.id // shape_id
        ]);
      });

    });
  });

  return trips;
};

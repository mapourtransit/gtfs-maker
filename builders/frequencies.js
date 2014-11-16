var _ = require('lodash');

var frequencies = [];

module.exports = function(data, gtfs){

  var masters = data[0].elements;
  var routes = data[1].elements;
  var calendar = gtfs[0];

  // create lookup for routes
  var lookup = { routes: {} };
  function createLookup(acc, obj){
    acc[obj.id] = obj;
    return acc;
  }
  _.reduce(routes, createLookup, lookup.routes);

  calendar.forEach( function(service){
    masters.forEach( function(master){
      master.members.forEach(function(member){
        var route = lookup.routes[member.ref];
        var tripId = master.id
                     + '_' + service['service_id']
                     + '_' + route.tags.from
                     + '_' + route.tags.to;
        var message = 'INIZIO_SERVIZIO_';
        switch( service['service_id'] ){
          case 'WW':
            message += 'GIORNI_FERIALI';
            break;
          case 'SW':
            message += 'GIORNI_FERIALI_ESTIVI__ADD_TWO_ENTRIES';
            break;
          case 'NW':
            message += 'GIORNI_FESTIVI';
            break;
        }
        frequencies.push([
          tripId, // trip_id,
          message, // start_time,
          message, // end_time,
          3600, // headway_secs 60 secs
          1 // exact_times
        ]);
      });
    });
  });

  return frequencies;

};

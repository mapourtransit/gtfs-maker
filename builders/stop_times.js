var _ = require('lodash');

module.exports = function(data, gtfs, timetables){

  var masters = data[0].elements;
  var routes = data[1].elements;
  var stops = data[2].elements;
  var calendar = gtfs[0];

  var stoptimes = [];

  // create lookup for ways and nodes
  var lookup = { routes: {}, stops: {} };
  function createLookup(acc, obj){
    acc[obj.id] = obj;
    return acc;
  }
  _.reduce(routes, createLookup, lookup.routes);
  _.reduce(stops, createLookup, lookup.stops);

  calendar.forEach( function(service){

    masters.forEach( function(master){

      // fetch timetable for this line
      var timetable = timetables[ master.tags.ref.replace('/', '') ];

      master.members.forEach(function(member){
        var route = lookup.routes[member.ref];
        var tripId = master.id
                     + '_' + service['service_id']
                     + '_' + route.tags.from
                     + '_' + route.tags.to
                     + '_' + member.ref;
        var index = 0;
        route.members.forEach(function(member){
          if (member.type == 'node' ){
            if (member.role && member.role == 'platform'){
              var stop = lookup.stops[ member.ref ];
              if (!stop){
                console.error('stop not found: ' + member.ref + ' in route ' + route.id + ' (' + master.tags.name + ')');
                return;
              }
              var code = stop.tags.ref || stop.tags.rel;
              if (!code){
                console.error('stop ' + member.ref + ' does not have tags.ref or tag.rel (deprecated) in route ' + route.id + ' (' + master.tags.name + ')');
                return;
              }
              // fetch the first row where stop.ref matches pole number
              var row = _.findWhere( timetable,{
                'id':code
              });
              if (!row){
                console.error('no entry in timetable for stop "' + code + '" in route ' + route.id + ' (' + master.tags.name + ')');
                return;
              }
              var time = row['time'] + ':00';
              if (!time){
                console.error('no arrival or departure time for stop "' + code + '" in route ' + route.id + ' (' + master.tags.name + ')');
                return;
              }
              stoptimes.push([
                tripId, // trip_id
                time, // arrival_time
                time, // departure_time
                stop.id, // stop_id
                index++ // stop_sequence
              ]);
            }
          }
        });

      });

    });
  });

  return stoptimes;
};

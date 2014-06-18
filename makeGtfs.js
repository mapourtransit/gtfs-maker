var fs = require('fs');
var async = require('async');
var _ = require('lodash');
var request = require('superagent');
var uuid = require('uuid');

var OSM3S_API = 'http://api.openstreetmap.fr/oapi/interpreter';

var mastersQuery = fs.readFileSync('queries/get-master-routes.osm3s').toString();
var stopsQuery = fs.readFileSync('queries/get-stops-nodes.osm3s').toString();
var routesQuery = fs.readFileSync('queries/get-routes-rel.osm3s').toString();

var routes = {};
var trips = [];
var stops = {};
var frequencies = [];
var stoptimes = [];



var csvjson = require('csvjson');
var _ = require('lodash');

var lineIds = ['1', '2', '3', '4', '5', '6A', '6B', '7', '8', '9', '10', '11', '12', '13', '14', '15'];

var timetable = {};

function tidyUp(lineData){
  var result;

  // remove rows with no stop
  result = _.reject(lineData, function(obj){ return obj.id === ''; });

  return result;
}

var matrix = {};

_.each(lineIds, function(lineId){
  timetable[lineId] = tidyUp(csvjson.toObject('./raw/times/simplified-for-export - MT'+ lineId + '.csv').output);
});


function buildStops(callback){
 request.get(OSM3S_API)
  .query({data: stopsQuery})
  .end(function(response){
    var elements = JSON.parse(response.text).elements;
    console.log('Building stops');
    _.each( elements, function(element){

      if (element.type == 'node' ){
        if (element.tags.public_transport && element.tags.public_transport == 'platform'){
          stops[ element.id ] = {
            'stop_id': element.id,
            'stop_code': element.tags.ref || element.tags.rel,
            'stop_name': element.tags['name'] || element.tags['addr:street'],
            'stop_desc': element.tags['desc'],
            'stop_lat': element.lat,
            'stop_lon': element.lon
          }
        }
      }
    });
    callback(null, 'one');
  });

}

function buildRoutesAndTrips(callback){
 request.get(OSM3S_API)
  .query({data: mastersQuery})
  .end(function(response){
    console.log('Building routes and trips');
    var relations = JSON.parse(response.text).elements;
    _.each( relations, function(relation){
      routes[ relation.id ] = {
        'route_id': relation.id,
        'agency_id':'1',
        'route_short_name':relation.tags.ref,
        'route_long_name':relation.tags.name,
        'route_type':'3'
      };
      _.each( relation.members, function(member){
        if (member.type == 'relation'){
          _.each( ['W', 'NW', 'S-W'], function(serviceId){
            var tripId = uuid.v4();
            trips.push({
              'trip_id': tripId,
              'route_id': relation.id,
              'shape_id': member.ref,
              'service_id':serviceId
            });
            frequencies.push({
              'trip_id': tripId ,
              'start_time':'__START_TIME__',
              'end_time':'__END_TIME__',
              'headway_secs':'__60__',
              'exact_times':'1'
            });
          });
        }
      });
    });
     callback(null, 'two');
  });

}

function buildRoutes(callback){
 request.get(OSM3S_API)
  .query({data: routesQuery})
  .end(function(response){
    console.log('Building routes');
    var elements = JSON.parse(response.text).elements;
    _.each(elements, function(element){

      var index = 1;

      _.each(element.members, function(member){

        var pole;

        if (member.type == 'node' && member.role == 'platform'){

          if ( stops[member.ref] ){
            pole = stops[ member.ref ]['stop_code'];
          }

          var tripResults = _.filter(trips, function(trip){
            return trip['shape_id'] == element.id;
          });

          _.each(tripResults, function(trip){
            var time, results;
            results = _.filter(timetable[  routes[ trip['route_id'] ] ['route_short_name']   ],
            function(row){
              return row.id == pole;
            });
            if ( results.length > 0 ){
              time = results[0].time;
            }
            stoptimes.push({
              'trip_id': trip['trip_id'],
              'arrival_time':time,
              'departure_time':time,
              'stop_id':member.ref,
              'stop_sequence': index
            });
          });

          index++;
        }
      });

    });
    callback(null, 'three');
  });

}

function toCSV(objArray) {
  var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
  var str = '';

  for (var key in array[0]){
    str += key + ',';
  }

  str += '\r\n';

  for (var i = 0; i < array.length; i++) {
    var line = '';
    for (var index in array[i]) {
      if (line !== '') line += ',';

        line += array[i][index];
    }

    str += line + '\r\n';
  }

  return str;
}

async.series([
    buildStops,
    buildRoutesAndTrips,
    buildRoutes,
    function print(callback){
      fs.writeFileSync('gtfs/routes.txt', toCSV(_.values(routes))  );
      fs.writeFileSync('gtfs/trips.txt', toCSV( trips ) );
      fs.writeFileSync('gtfs/stop_times.txt', toCSV(stoptimes) );
      fs.writeFileSync('gtfs/frequencies.txt', toCSV(frequencies) );
      callback(null, 'four');
    }
]);

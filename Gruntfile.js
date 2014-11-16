var fs = require('fs');
var _ = require('lodash');
var csvjson = require('csvjson');
var request = require('superagent');
var Promise = require('es6-promise').Promise;
var conf = require('./package.json').conf;

module.exports = function(grunt){

  grunt.registerTask('cache', function(){
    var OSM3S_API = 'http://api.openstreetmap.fr/oapi/interpreter';

    var done = this.async();

    var mastersQuery = fs.readFileSync('queries/get-master-routes.osm3s').toString();
    var stopsQuery = fs.readFileSync('queries/get-stops-nodes.osm3s').toString();
    var routesQuery = fs.readFileSync('queries/get-routes-rel.osm3s').toString();
    var waysQuery = fs.readFileSync('queries/get-routes-ways.osm3s').toString();
    var nodesQuery = fs.readFileSync('queries/get-routes-nodes.osm3s').toString();

    var queries = [mastersQuery, stopsQuery, routesQuery, waysQuery, nodesQuery];

    /*
     * gets data from OSM Overpass API
     */
    function queryOSM(query){
      return new Promise(function(resolve, reject){
        request.get(OSM3S_API)
          .query({data: query})
          .end(function(err, res){
            if(err){
              reject(err);
            } else {
              resolve(res.body);
            }
          });
      });
    }

    /*
     * array of arrays with [routes, ways, nodes]
     */
    function saveData(data){
      var types = ['masters', 'stops', 'routes', 'ways', 'nodes'];
      _.each(data, function(arr, index){
        fs.writeFileSync('./cache/' + types[index] + '.json', JSON.stringify(arr));
      });
      console.log('data saved to ./cache');
    }

    /*
     * get all data and save to disk
     */
    Promise.all(queries.map(queryOSM))
      .then(saveData)
      .catch(function(err){
        console.log(err);
      }).then(done);

  });

  function loadData(list){
    return list.map(function(type){
      return JSON.parse(fs.readFileSync('./cache/' + type + '.json').toString());
    });
  }

  function loadGtfs(list){
    return list.map(function(type){
      return csvjson.toObject('./gtfs/' + type + '.txt').output;
    });
  }

  /**
   * create a timetable from Miccolis file
   *
   * if lines not specified, upload all available lines
   * otherwise only lines in the set
   *
   */
  function loadTimetables(lines){
    var rootDir = './miccolis/timetables/',
        table = {};
    fs.readdirSync( rootDir )
      .forEach(function(filename){
        var matches = /MT(.*)\.csv/.exec(filename);
        if ( !matches ){
          console.error('Malformed filename: ' + filename + '. Correct syntax: ".*MT.*\.csv".');
          return; // skip
        }
        var name = matches[1];
        if ( !lines || _.contains(lines, name) ){
          table[ name ] = _.reject(
                    csvjson.toObject(rootDir + filename).output,
                    function(obj){ return obj.id === ''; } // remove rows with no stop
                );
        }
     });
    return table;
  }

  function toCSV(records){
    return records.map(function(row){
      return row.join(',');
    }).join("\n");
  }

  grunt.registerTask('shapes', function(){

    var shapesBuilder = require('./builders/shapes');
    var csvHeader = "shape_id,shape_pt_lat,shape_pt_lon,shape_pt_sequence\n";
    var shapes = shapesBuilder(loadData(['routes', 'ways', 'nodes']));
    fs.writeFileSync('./gtfs/shapes.txt', csvHeader + toCSV(shapes));

  });

  grunt.registerTask('stops', function(){

    var stopsBuilder = require('./builders/stops');
    var csvHeader = "stop_id,stop_code,stop_name,stop_desc,stop_lat,stop_lon\n";
    var stops = stopsBuilder(loadData(['stops']));
    fs.writeFileSync('./gtfs/stops.txt', csvHeader + toCSV(stops));

  });

  grunt.registerTask('stop_times', function(){

    var stoptimesBuilder = require('./builders/stop_times');
    var csvHeader = "trip_id,arrival_time,departure_time,stop_id,stop_sequence\n";
    var stoptimes = stoptimesBuilder( loadData([ 'masters', 'routes', 'stops']), loadGtfs(['calendar']), loadTimetables() );
    fs.writeFileSync('./gtfs/stop_times.txt', csvHeader + toCSV(stoptimes));

  });

  grunt.registerTask('routes', function(){

    var routesBuilder = require('./builders/routes');
    var csvHeader = "route_id,agency_id,route_short_name,route_long_name,route_type\n";
    var routes = routesBuilder( loadData(['masters']) );
    fs.writeFileSync('./gtfs/routes.txt', csvHeader + toCSV(routes));

  });

  grunt.registerTask('frequencies', function(){



  });

  grunt.registerTask('trips', function(){

    // TODO make this task dependant on calendar task

    var tripsBuilder = require('./builders/trips');
    var csvHeader = "route_id,service_id,trip_id,trip_headsign,direction_id,shape_id\n";
    var trips = tripsBuilder( loadData(['masters', 'routes']), loadGtfs(['calendar']) );
    fs.writeFileSync('./gtfs/trips.txt', csvHeader + toCSV(trips));

  });

  grunt.registerTask('calendar', function(){

    var calendarBuilder = require('./builders/calendar');
    var csvHeader = "service_id,monday,tuesday,wednesday,thursday,saturday,sunday,start_date,end_date\n";
    var calendar = calendarBuilder( conf );
    fs.writeFileSync('./gtfs/calendar.txt', csvHeader + toCSV(calendar));

  });

  grunt.registerTask('calendar_dates', function(){

    var calendarDatesBuilder = require('./builders/calendar_dates');
    var csvHeader = "service_id,date,exception_type\n";
    var calendarDates = calendarDatesBuilder( conf );
    fs.writeFileSync('./gtfs/calendar_dates.txt', csvHeader + toCSV(calendarDates));

  });

};

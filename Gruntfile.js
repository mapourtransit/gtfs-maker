var fs = require('fs');
var _ = require('lodash');
var request = require('superagent');
var Promise = require('es6-promise').Promise;

module.exports = function(grunt){

  grunt.registerTask('cache', function(){
    var OSM3S_API = 'http://api.openstreetmap.fr/oapi/interpreter';

    var done = this.async();

    var routesQuery = fs.readFileSync('queries/get-routes-rel.osm3s').toString();
    var waysQuery = fs.readFileSync('queries/get-routes-ways.osm3s').toString();
    var nodesQuery = fs.readFileSync('queries/get-routes-nodes.osm3s').toString();

    var queries = [routesQuery, waysQuery, nodesQuery];

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
      var types = ['routes', 'ways', 'nodes'];
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

  function toCSV(records){
    return records.map(function(row){
      return row.join(',');
    }).join("\n");
  }


  grunt.registerTask('shapes', function(){

    var shapeBuilder = require('./builders/shapes');
    var csvHeader = "shape_id,shape_pt_lat,shape_pt_lon,shape_pt_sequence\n";
    var shapes = shapeBuilder(loadData(['routes', 'ways', 'nodes']));
    fs.writeFileSync('./gtfs/shapes.txt', csvHeader + toCSV(shapes));

  });

  grunt.registerTask('stops', function(){

    var stopBuilder = require('./builders/stops');
    var csvHeader = "stop_id,stop_code,stop_name,stop_desc,stop_lat,stop_lon\n";
    var stops = shapeBuilder(loadData(['stops']));
    fs.writeFileSync('./gtfs/stops.txt', csvHeader + toCSV(stops));

  });

};

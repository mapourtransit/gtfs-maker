var fs = require('fs');
var _ = require('lodash');
var request = require('superagent');
var Promise = require('es6-promise').Promise;

// XXX refactor, duplicate code also present in Gruntfile.js
function cache(){
  var OSM3S_API = 'http://api.openstreetmap.fr/oapi/interpreter';

  var mastersQuery = fs.readFileSync('./queries/get-master-routes.osm3s').toString();
  var stopsQuery = fs.readFileSync('./queries/get-stops-nodes.osm3s').toString();
  var routesQuery = fs.readFileSync('./queries/get-routes-rel.osm3s').toString();
  var waysQuery = fs.readFileSync('./queries/get-routes-ways.osm3s').toString();
  var nodesQuery = fs.readFileSync('./queries/get-routes-nodes.osm3s').toString();

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
  return Promise.all(queries.map(queryOSM))
    .then(saveData);

};

module.exports = {
  builders: {
    routes: require('./builders/routes'),
    shapes: require('./builders/shapes'),
    stops: require('./builders/stops')
  },
  cache:cache
};

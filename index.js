var fs = require('fs');
var _ = require('lodash');
var request = require('superagent');
var Promise = require('es6-promise').Promise;
var csv = require('csvjson');
var converter = require('json-2-csv');

var config = {
  data: {
    masters:{
      format:'json',
      ext:'.json',
      dir:'./cache/'
    },
    nodes:{
      format:'json',
      ext:'.json',
      dir:'./cache/'
    },
    routes:{
      format:'json',
      ext:'.json',
      dir:'./cache/'
    },
    stops:{
      format:'json',
      ext:'.json',
      dir:'./cache/'
    },
    ways:{
      format:'json',
      ext:'.json',
      dir:'./cache/'
    },
    agency:{
      format:'csv',
      ext:'.txt',
      dir:'./gtfs/'
    },
    // TODO delete and move in matera-gtfs
    // it should be possible to set/override files from there
    miccolis:{
      format:'csv',
      ext:'.csv',
      dir:'./cache/'
    }
  }
};

var parser = {
  csv: function( filepath ){
    return csv.toObject( filepath ).output;
  },
  json: function( filepath ){
    return JSON.parse(fs.readFileSync( filepath ).toString());
  }
};


// TODO allow basedir override
function loadData(list){
  return list.map(function(type){
    var file = config.data[type];
    var filepath;
    if (!file){
      throw new Error('File ' + type + ' does not exist.');
    }
    filepath = file.dir + type + file.ext;
    return parser[ file.format ].call(undefined, filepath );
  });
}

function saveDataAsCsv(data, filepath){
  return new Promise(function(resolve, reject){
    converter.json2csv(data, function(err, csv){
      if (err){
        reject(err);
      } else {
        fs.writeFileSync( filepath, csv );
        resolve();
      }
    });
  });
}

// XXX refactor, duplicate code also present in Gruntfile.js
/**
 * params object with customization options for OSM queries
 */
function cache(params){
  var OSM3S_API = 'http://api.openstreetmap.fr/oapi/interpreter';

  var mastersQuery = fs.readFileSync( __dirname + '/queries/get-master-routes.osm3s').toString();
  var stopsQuery = fs.readFileSync(__dirname + '/queries/get-stops-nodes.osm3s').toString();
  var routesQuery = fs.readFileSync(__dirname + '/queries/get-routes-rel.osm3s').toString();
  var waysQuery = fs.readFileSync(__dirname + '/queries/get-routes-ways.osm3s').toString();
  var nodesQuery = fs.readFileSync(__dirname + '/queries/get-routes-nodes.osm3s').toString();

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
  cache:cache,
  load:loadData,
  saveAsCsv:saveDataAsCsv
};

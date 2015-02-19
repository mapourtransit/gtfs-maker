var fs = require('fs');
var _ = require('lodash');

var Promise = require('es6-promise').Promise;
var csv = require('csvjson');
var converter = require('json-2-csv');

var Overpass = require('./lib/overpass');

var defaultData = {
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
  trips:{
    format:'csv',
    ext:'.txt',
    dir:'./gtfs/'
  }
};

var parser = {
  csv: function( filepath ){
    return csv.toObject( filepath ).output;
  },
  json: function( filepath ){
    // XXX picking elements
    return JSON.parse(fs.readFileSync( filepath ).toString()).elements;
  }
};

var GtfsMaker = function(config){
  config = config || {};
  this._settings = config.settings;
  this._data = _.extend(defaultData, config.data);
  this.builders = {
    routes: require('./builders/routes').bind(this),
    shapes: require('./builders/shapes').bind(this),
    stops: require('./builders/stops').bind(this),
    stopTimes: require('./builders/stop_times').bind(this)
  };
};

_.extend( GtfsMaker.prototype, {
  cache:function cache(){
    var OSM3S_API = 'http://api.openstreetmap.fr/oapi/interpreter';

    var masterIds = _.map( this._settings.lines, function(line){
      return line.osmId;
    });

    var overpass = new Overpass( masterIds );

    var types = ['masters', 'stops', 'routes', 'ways', 'nodes'];

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
     return Promise.all(types.map(overpass.fetch, overpass))
       .then(saveData);

  },
  /**
   * load static assets from files
   *
   * list, list of file kind as specified in config file
   *
   * a file kind could be a simple file (csv or json)
   * or a directory of similar files
   *
   */
  loadData: function loadData(list){
    var data = this._data;
    return list.map(function(type){

      var file = data[type];
      var rootdir;
      var filepath;

      if (!file){
        throw new Error('No file config for type ' + type + '.');
      }
      // if it is a directory load all files in a bundle
      if ( file.isDirectory ){
        return fs.readdirSync( file.dir )
          .map(function(filename){
            filepath = file.dir + filename;
            return {
              name:filename,
              content:parser[ file.format ].call(undefined, filepath )
            };
         }).map( file.transform );
      } else {
        filepath = file.dir + type + file.ext;
        if ( !fs.existsSync(filepath)){
          throw new Error('File not found ' + filepath + '.');
        }
        return parser[ file.format ].call(undefined, filepath ).map(file.transform || _.identity);
      }
    });
  },
  saveDataAsCsv:function saveDataAsCsv(data, filepath){
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
});

module.exports = GtfsMaker;

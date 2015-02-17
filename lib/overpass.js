var Promise = require('es6-promise').Promise;
var _ = require('lodash');
var request = require('superagent');

var OSM3S_API = 'http://api.openstreetmap.fr/oapi/interpreter';

var queryPrefix = "[out:json];";

var queryTemplates = {
  masters: '',
  stops: 'rel(r);node(r)[public_transport=platform];',
  routes: 'rel(r);',
  ways: 'rel(r);way(r);',
  nodes: 'rel(r);way(r);node(w);'
};

var queryPostfix = "out body;";

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

module.exports = function(masterIds) {

  this.masterIds = masterIds;

  this.fetch = function(type) {
    var query = this.buildQuery(type);
    return queryOSM(query);
  };

  this.buildQuery = function(type) {

    var query = queryPrefix;
    query += '(';

    _.each(this.masterIds, function(id) {
      query += 'relation(' + id + ');';
    });

    query += ');';
    query += queryTemplates[type];
    query += queryPostfix;

    return query;
  };

};

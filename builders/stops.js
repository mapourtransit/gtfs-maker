/*
 * stopsBuilder
 * returns array with shapes for GTFS, one point per row
 */
var _ = require('lodash');
var Filter = require('../lib/filter');

module.exports = function(data, options){
  var result = [];

  var stops  = data[0];
  var masters = data[1];
  var routes = data[2];

  var lookup = { routes: {} };
  function createLookup(acc, obj){
    acc[obj.id] = obj;
    return acc;
  }
  _.reduce(routes, createLookup, lookup.routes);

  options = options || {};
  var include = options.include || [];

  var filter = new Filter(this._settings, include);

  var includedMasters = filter.included( masters );
  var includedStopIds = {};
  includedMasters.forEach(function(master){
    master.members.forEach(function(member){
      var route = lookup.routes[ member.ref ];
      route.members.forEach( function(member){
        includedStopIds[ member.ref ] = true;
      });
    });
  })
  includedStopIds = _.keys( includedStopIds );

  function isInIncludedMaster(stop){
    return _.contains(includedStopIds, stop.id.toString());
  }

  _.filter(stops, isInIncludedMaster).forEach(
    function(element){
    if (element.type == 'node' ){
      if (element.tags.public_transport && element.tags.public_transport == 'platform'){
        result.push({
          stop_id:element.id,
          stop_code:element.tags.ref || element.tags.rel,
          stop_name:element.tags.name || element.tags['addr:street'] || element.tags.ref || element.tags.rel,
          stop_desc:element.tags.desc,
          stop_lat:element.lat,
          stop_lon:element.lon
        });
      }
    }
  });
  return result;
};

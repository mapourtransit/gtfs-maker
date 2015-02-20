/*
 * shapesBuilder
 * returns array with shapes for GTFS, one point per row
 */
var _ = require('lodash');
var Filter = require('../lib/filter');

module.exports = function(data, options){

  var shapes = [];

  var objects = {
    masters: data[0],
    routes: data[1],
    ways: data[2],
    nodes: data[3]
  };

  options = options || {};
  var include = options.include || [];

  var filter = new Filter(this._settings, include);

  // create lookup for ways and nodes
  var lookup = { ways: {}, nodes: {} };
  function createLookup(acc, obj){
    acc[obj.id] = obj;
    return acc;
  }
  _.reduce(objects.ways, createLookup, lookup.ways);
  _.reduce(objects.nodes, createLookup, lookup.nodes);

  // we need to find routes whose master is in the include list
  // i.e. every route in some included master
  var includedMasters = filter.included( objects.masters );
  var includedRoutes = _.filter( objects.routes, function(route){
    return _.some( includedMasters, function(master){
      return !_.isEmpty( _.filter(master.members, function(member){
        return member.ref === route.id
      }));
    });
  });

  // create path
  _.each(includedRoutes, function(route){
    var ways = _.filter(route.members, function(member){
      return member.type === 'way';
    });

    // nest ways ordering nodes properly
    var nested = ways.map(function(way){
      var nodes = lookup.ways[way.ref].nodes;
      // always return clone!
      if(way.role === 'forward'){
        return _.clone(nodes);
      } else if(way.role === 'backward') {
        return _.clone(nodes).reverse();
      } else {
        console.log('unexpected role!', way);
      }
    });

    var path = [];
    _.each(nested, function(nodeIds, index){
      _.each(nodeIds, function(id){
        if(index == nested.length - 1) {
        // handle last segment
        // #FIXME support case when last stop happens in the middle of the way!
          path.push(id);
        } else if(id === nested[index+1][0]){
          // don't add since road changes half the way eg. roundabouts
          // first element of next way will get included instead
        } else {
          path.push(id);
        }
      });
    });

    _.each(path, function(nodeId, index){
      var node = lookup.nodes[nodeId];
      shapes.push({
        shape_id:route.id,
        shape_pt_lat:node.lat,
        shape_pt_lon:node.lon,
        shape_pt_sequence:index
      });
    });
  });

  return shapes;

};

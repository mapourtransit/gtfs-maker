/*
 * shapesBuilder
 * returns array with shapes for GTFS, one point per row
 */
var _ = require('lodash');

module.exports = function(data){

  var shapes = [];

  var objects = {
    routes: data[0].elements,
    ways: data[1].elements,
    nodes: data[2].elements
  };

  // create lookup for ways and nodes
  var lookup = { ways: {}, nodes: {} };
  function createLookup(acc, obj){
    acc[obj.id] = obj;
    return acc;
  }
  _.reduce(objects.ways, createLookup, lookup.ways);
  _.reduce(objects.nodes, createLookup, lookup.nodes);

  // create path
  _.each(objects.routes, function(route){
    var ways = _.filter(route.members, function(member){
      return member.type === 'way';
    });

    // nest ways ordering nodes properly
    var nested = ways.map(function(way){
      var nodes = lookup.ways[way.ref].nodes;
      if(way.role === 'forward'){
        return nodes;
      } else if(way.role === 'backward') {
        return nodes.reverse();
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
      shapes.push([route.id, node.lat, node.lon, index]);
    });
  });

  return shapes;

};

var fs = require('fs');
var _ = require('lodash');
var request = require('superagent');
var Promise = require('es6-promise').Promise;

var OSM3S_API = 'http://api.openstreetmap.fr/oapi/interpreter';

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
 * builds shape
 */
function buildShape(data){
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
    // debug

    var path = [];
    _.each(nested, function(nodeIds, index){
      _.each(nodeIds, function(id){
        // check got crossings half the way!
        // #FIXME support case when last stop happens in the middle of the way!
        if(index != nested.length - 1 && id === nested[index+1][0].id) return;
        path.push(id);
      });
    });

    // debug
    _.each(path, function(nodeId, index){
      var node = lookup.nodes[nodeId];
      console.log([route.id, node.lat, node.lon, index].join(','));
    });
  });

}

/*
 * get all data and build shapes
 */
Promise.all(queries.map(queryOSM))
  .then(buildShape)
  .catch(function(err){
    console.log(err);
  });

var _ = require('lodash');


module.exports = function(data){

  var objects = {
    masters: data[0]
  };

  return objects.masters.map(function(master){
    return {
      route_id:master.id, // route_id
      // TODO this should be a parameter since it depends on particular impl
      agency_id:1, // agency_id
      route_short_name:master.tags.ref, // route_short_name
      route_long_name:master.tags.name, // route_long_name
      route_type:3 // route_type
    };
  });
};

var _ = require('lodash');


module.exports = function(data){

  var objects = {
    masters: data[0].elements
  };

  return objects.masters.map(function(master){
    return [
      master.id, // route_id
      1, // agency_id
      master.tags.ref, // route_short_name
      master.tags.name, // route_long_name
      3 // route_type
    ];
  });
};

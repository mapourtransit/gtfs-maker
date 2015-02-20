var _ = require('lodash');


module.exports = function(data, options){

  function findLineNumber( masterOsmId ){
    return _.result( _.find( settings.lines, function(line){
      return masterOsmId === line.osmId;
    }), 'number' );
  }

  var objects = {
    masters: data[0]
  };
  // XXX find a better way to pass this information to findLineNumber
  var settings = this._settings;

  options = options || {};
  var include = options.include || [];

  var includedMasters = _.select(objects.masters, function(row) {
    return _.contains(include, findLineNumber( row.id ));
  });

  return includedMasters.map(function(master){
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

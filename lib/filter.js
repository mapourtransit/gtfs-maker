var _ = require('lodash');


var Filter = function(settings, include){
  this._findLineNumber = function( masterOsmId ){
    return _.result( _.find( settings.lines, function(line){
      return masterOsmId === line.osmId;
    }), 'number' );
  };
  this._include = include;
};

_.extend( Filter.prototype, {
  included: function( masters ){
    // XXX use bind instead
    var self = this;
    return _.select(masters, function(row) {
      return _.contains(self._include, self._findLineNumber( row.id ));
    });
  }
});


module.exports = Filter;

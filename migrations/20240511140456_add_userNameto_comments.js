exports.up = function(knex) {
    return knex.schema.table('comments', function(table) {
      table.string('userName');
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.table('comments', function(table) {
      table.dropColumn('userName');
    });
  };

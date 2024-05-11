exports.up = function(knex) {
    return knex.schema.alterTable('users', table => {
      table.renameColumn('age', 'code');
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.alterTable('users', table => {
      table.renameColumn('code', 'age');
    });
  };
  
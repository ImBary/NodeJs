exports.up = function(knex) {
    return knex.schema.createTable('comments', table => {
      table.increments('id');
      table.integer('UserId');
      table.string('comment');
      table.integer('PostId');
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('comments');
  };
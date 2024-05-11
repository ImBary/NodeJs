exports.up = function(knex) {
    return knex.schema.dropTableIfExists('comments').then(function() {
      return knex.schema.createTable('comments', function(table) {
        table.increments('id');
        table.integer('userId').unsigned().references('id').inTable('users'); // Assuming foreign key to users table
        table.string('userName');
        table.string('comment');
        table.integer('postId').unsigned().references('id').inTable('posts'); // Assuming foreign key to posts table
      });
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTableIfExists('comments');
  };
  
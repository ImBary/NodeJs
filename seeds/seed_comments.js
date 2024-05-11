exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('comments').del()
    .then(function () {
      // Inserts seed entries
      return knex('comments').insert([
        {UserId: 26, comment: "ale super", PostId: 64},
      ]);
    });
};
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('posts').del()
    .then(function () {
      // Inserts seed entries
      return knex('posts').insert([
        {title: 'Paliwo', content:'paliwo drożeje o 50gr!',userID:'0'},
        {title: 'Promocja!', content:'Biedronka 12+12',userID:'0'},
      ]);
    });
};

exports.up = function(knex) {

  return knex.schema.createTable('greenspeed_run', function (table) {
    table.increments('id').primary();
    table.string('requester_email', 256);
    table.string('url', 100);
    table.timestamp('sitespeed_request_at');
    table.timestamp('sitespeed_response_at');
    table.string('sitespeed_status', 100);
    table.string('result_location', 256);
    // See function sig: http://knexjs.org/#Schema-timestamps
    // table.timestamps([useTimestamps], [defaultToNow])
    table.timestamps(true, true);
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('greenspeed_run');
};

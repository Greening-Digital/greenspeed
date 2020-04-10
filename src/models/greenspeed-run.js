const Schwifty = require('schwifty');
const Joi = require('@hapi/joi');

class GreenSpeedRun extends Schwifty.Model {
  static get tableName() {
    return 'greenspeed_run';
  }

  static get statuses() {
    return {
      PENDING: 1,
      FINISHED: 2
    }
  }

  static get joiSchema() {
    return Joi.object({
      id: Joi.number(),
      requester_email: Joi.string(),
      url: Joi.string().uri({scheme: ["http", "https"]}),
      sitespeed_request_at: Joi.date().timestamp(),
      sitespeed_response_at: Joi.date().timestamp(),
      sitespeed_status: Joi.number(),
      result_location: Joi.string(),
      created_at: Joi.date().timestamp(),
      updated_at: Joi.date().timestamp(),
    });
  }

  path() {
    const domain = new URL(this.url).host
    const epochTime = this.sitespeed_request_at.getTime()
    return `${domain}-${epochTime}`
  }

}

module.exports = GreenSpeedRun;
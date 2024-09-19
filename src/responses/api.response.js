// create class for response api
// return json response with status code and message and data
// format of response api is {data,status,message}

import uuid from '../utils/uuid.js';

export default class ResponseApi {
  constructor(data, pagination = null) {
    this.data = data;
    this.pagination = pagination;
  }

  static success(res, data, pagination) {
    return res.status(200).json(new ResponseApi(data, pagination).toJson());
  }

  static created(res, data) {
    return res.status(201).json(new ResponseApi(data).toJson());
  }

  static accepted(res, data) {
    return res.status(202).json(new ResponseApi(data).toJson());
  }

  static noContent(res) {
    return res.status(204).json(new ResponseApi({}).toJson());
  }

  toJson() {
    return {
      requestId: uuid(),
      requestTime: new Date().toISOString(),
      data: this.data || {},
      pagination: this.pagination || null,
    };
  }
}

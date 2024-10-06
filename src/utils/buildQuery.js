import mongoose from 'mongoose';
const ObjectId = mongoose.Types.ObjectId;

export class MongooseAggregationBuilder {
  constructor(model) {
    this.model = model;
    this.pipeline = [];
    this.matchStage = {};
    this.sortStage = {};
    this.skip = 0;
    this.limit = 0;
    this.populateFields = [];
    this.selectFields = {};
  }

  addSearchQuery(searchQuery) {
    const buildCondition = (key, value) => {
      if (
        typeof value === 'object' &&
        !Array.isArray(value) &&
        value !== null
      ) {
        return Object.entries(value).reduce((acc, [subKey, subValue]) => {
          acc[`${key}.${subKey}`] = this.buildQueryCondition(subKey, subValue);
          return acc;
        }, {});
      }
      return {[key]: this.buildQueryCondition(key, value)};
    };

    Object.entries(searchQuery).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (key === '$or' || key === '$and') {
          this.matchStage[key] = value.map((condition) =>
            Object.entries(condition).reduce((acc, [subKey, subValue]) => {
              Object.assign(acc, buildCondition(subKey, subValue));
              return acc;
            }, {}),
          );
        } else if (key === '$text') {
          this.matchStage.$text = {$search: value};
        } else {
          Object.assign(this.matchStage, buildCondition(key, value));
        }
      }
    });
    return this;
  }

  buildQueryCondition(key, value) {
    if (typeof value === 'number') {
      return value;
    } else if (key === '$regex') {
      return {$regex: value, $options: 'i'};
    } else if (typeof value === 'string') {
      // Check for ObjectId pattern (24 character hex string)
      if (mongoose.isValidObjectId(value)) {
        return new ObjectId(value);
      }
      // Check if the value contains commas
      if (value.includes(',')) {
        const arrayValues = value.split(',').map((v) => v.trim());
        return {$in: arrayValues};
      }
      return value;
    } else if (value instanceof Date) {
      return value;
    } else if (Array.isArray(value)) {
      return {$in: value};
    } else if (typeof value === 'object' && value !== null) {
      // Handle nested query conditions, for example, {$in: [ObjectId, ObjectId]}
      if (value.$in) {
        return {$in: value.$in.map((v) => new ObjectId(v))};
      }
      return value;
    }
  }

  addLookupStage(options) {
    const lookupStage = {
      $lookup: {
        from: options.from,
        localField: options.localField || '_id',
        foreignField:
          options.foreignField || `${options.from.toLowerCase()}_id`,
        as: options.as || options.from.toLowerCase(),
      },
    };

    if (options.pipeline) {
      lookupStage.$lookup.pipeline = options.pipeline;
    }

    this.pipeline.push(lookupStage);
    return this;
  }

  addFields(fields) {
    this.pipeline.push({$addFields: fields});
    return this;
  }

  sort(sort) {
    if (typeof sort === 'string') {
      const [field, order] = sort.split(':');
      this.sortStage[field] = order === 'desc' ? -1 : 1;
    } else if (typeof sort === 'object') {
      Object.assign(this.sortStage, sort);
    }
    return this;
  }

  paginate(page, perPage) {
    this.skip = (page - 1) * perPage;
    this.limit = perPage;
    return this;
  }

  populate(fields) {
    this.populateFields = Array.isArray(fields) ? fields : [fields];
    return this;
  }

  select(fields) {
    if (typeof fields === 'string') {
      fields.split(' ').forEach((field) => {
        this.selectFields[field] = 1;
      });
    } else if (Array.isArray(fields)) {
      fields.forEach((field) => {
        this.selectFields[field] = 1;
      });
    } else if (typeof fields === 'object') {
      Object.assign(this.selectFields, fields);
    }
    return this;
  }

  build() {
    if (Object.keys(this.matchStage).length > 0) {
      this.pipeline.push({$match: this.matchStage});
    }

    if (Object.keys(this.sortStage).length > 0) {
      this.pipeline.push({$sort: this.sortStage});
    }

    // Handle population
    this.populateFields.forEach((field) => {
      this.pipeline.push({
        $lookup: {
          from: field.toLowerCase() + 's', // Assuming the collection name is plural
          localField: field,
          foreignField: '_id',
          as: field,
        },
      });
      // Unwind the populated array to match the structure of a normal populate
      this.pipeline.push({
        $unwind: {path: `$${field}`, preserveNullAndEmptyArrays: true},
      });
    });

    if (Object.keys(this.selectFields).length > 0) {
      this.pipeline.push({$project: this.selectFields});
    }

    if (this.skip > 0) {
      this.pipeline.push({$skip: this.skip});
    }

    if (this.limit > 0) {
      this.pipeline.push({$limit: this.limit});
    }

    return this.model.aggregate(this.pipeline);
  }

  async execute() {
    const countPipeline = [...this.pipeline, {$count: 'total'}];
    const [countResult] = await this.model.aggregate(countPipeline);
    const count = countResult ? countResult.total : 0;

    const results = await this.build();

    return {results, count};
  }

  // Method to build a regular Mongoose query (non-aggregation)
  buildQuery() {
    let query = this.model.find(this.matchStage);

    if (Object.keys(this.sortStage).length > 0) {
      query = query.sort(this.sortStage);
    }

    if (Object.keys(this.selectFields).length > 0) {
      query = query.select(this.selectFields);
    }

    if (this.skip > 0) {
      query = query.skip(this.skip);
    }

    if (this.limit > 0) {
      query = query.limit(this.limit);
    }

    if (this.populateFields.length > 0) {
      query = query.populate(this.populateFields);
    }

    return query;
  }
}

export const buildAggregationPipeline = (model, options) => {
  const builder = new MongooseAggregationBuilder(model);

  if (options.search) builder.addSearchQuery(options.search);
  if (options.sort) builder.sort(options.sort);
  if (options.page && options.perPage)
    builder.paginate(options.page, options.perPage);
  if (options.populate) builder.populate(options.populate);
  if (options.select) builder.select(options.select);
  if (options.addFields) builder.addFields(options.addFields);
  if (options.lookup)
    options.lookup.forEach((lookup) => builder.addLookupStage(lookup));

  return builder;
};

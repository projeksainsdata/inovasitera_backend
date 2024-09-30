export class MongooseAggregationBuilder {
  constructor(model) {
    this.model = model;
    this.pipeline = [];
    this.matchStage = {};
    this.sortStage = {};
    this.skip = 0;
    this.limit = 0;
  }

  addSearchQuery(searchQuery) {
    Object.entries(searchQuery).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (key === '$or') {
          this.matchStage.$or = value.map((condition) =>
            this.buildNestedCondition(condition.field, condition.value),
          );
        } else {
          Object.assign(this.matchStage, this.buildNestedCondition(key, value));
        }
      }
    });
    return this;
  }

  selectFields(fields) {
    this.pipeline.push({$project: fields});
    return this;
  }

  buildNestedCondition(key, value) {
    const nestedKeys = key.split('.');
    if (nestedKeys.length > 1 && nestedKeys[0] !== '$') {
      // This is a nested field, so we need to add a $lookup stage
      this.addLookupStage(nestedKeys[0]);
      return {
        [`${nestedKeys[0]}.${nestedKeys.slice(1).join('.')}`]:
          this.buildQueryCondition(nestedKeys[nestedKeys.length - 1], value),
      };
    }
    return {[key]: this.buildQueryCondition(key, value)};
  }

  buildQueryCondition(key, value) {
    if (typeof value === 'number') {
      return value;
    } else if (typeof value === 'string') {
      return {$regex: value, $options: 'i'};
    } else if (value instanceof Date) {
      return value;
    } else if (Array.isArray(value)) {
      return {$in: value};
    } else {
      return value;
    }
  }

  addLookupStage(
    field,
    from = null,
    localField = null,
    foreignField = null,
    as = null,
  ) {
    const lookupStage = {
      $lookup: {
        from: from || field,
        localField: localField || '_id',
        foreignField: foreignField || `${field}_id`,
        as: as || field,
      },
    };

    this.pipeline.push(lookupStage);
  }

  addFields(fields) {
    this.pipeline.push({$addFields: fields});
    return this;
  }

  sort(sort, order) {
    this.sortStage = {[sort]: order === 'desc' ? -1 : 1};
    return this;
  }

  paginate(page, perPage) {
    this.skip = (page - 1) * perPage;
    this.limit = perPage;
    return this;
  }

  async execute() {
    if (Object.keys(this.matchStage).length > 0) {
      this.pipeline.push({$match: this.matchStage});
    }

    if (Object.keys(this.sortStage).length > 0) {
      this.pipeline.push({$sort: this.sortStage});
    }

    if (this.skip > 0) {
      this.pipeline.push({$skip: this.skip});
    }

    if (this.limit > 0) {
      this.pipeline.push({$limit: this.limit});
    }

    const results = await this.model.aggregate(this.pipeline);

    // Count total documents
    const countPipeline = this.pipeline.slice(0, -2); // Remove skip and limit stages
    countPipeline.push({$count: 'total'});
    const countResult = await this.model.aggregate(countPipeline);
    const count = countResult.length > 0 ? countResult[0].total : 0;

    return {results, count};
  }
}

export const buildAggregationPipeline = (
  model,
  searchQuery,
  sort,
  order,
  page,
  perPage,
) => {
  const builder = new MongooseAggregationBuilder(model);
  return builder
    .addSearchQuery(searchQuery)
    .sort(sort, order)
    .paginate(page, perPage);
};

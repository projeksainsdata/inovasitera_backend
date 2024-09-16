class WhereClauseBuilder {
  constructor(fixedParams = {}) {
    this.whereClause = { ...fixedParams }
  }

  addSearchQuery(searchQuery) {
    Object.entries(searchQuery).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        Object.assign(this.whereClause, buildNestedCondition(key, value))
      }
    })
    return this
  }

  addFixedParam(key, value) {
    if (value !== undefined && value !== null) {
      this.whereClause[key] = value
    }
    return this
  }

  build() {
    return this.whereClause
  }
}

const buildQueryCondition = (key, value) => {
  if (typeof value === 'number') {
    return { [key]: value }
  } else if (typeof value === 'string') {
    return { [key]: { contains: value, mode: 'insensitive' } }
  } else if (value instanceof Date) {
    return { [key]: value }
  } else if (Array.isArray(value)) {
    return { [key]: { in: value } }
  } else {
    return { [key]: { equals: value } }
  }
}

const buildNestedCondition = (key, value) => {
  const nestedKeys = key.split('.')
  let condition = {}
  let currentLevel = condition

  for (let i = 0; i < nestedKeys.length - 1; i++) {
    currentLevel[nestedKeys[i]] = {}
    currentLevel = currentLevel[nestedKeys[i]]
  }

  const lastKey = nestedKeys[nestedKeys.length - 1]
  currentLevel[lastKey] = buildQueryCondition(lastKey, value)[lastKey]

  return condition
}

export const buildOrderByClause = (sort, order) => {
  const orderBy = {}
  const nestedKeys = sort.split('.')
  let currentLevel = orderBy

  for (let i = 0; i < nestedKeys.length - 1; i++) {
    currentLevel[nestedKeys[i]] = {}
    currentLevel = currentLevel[nestedKeys[i]]
  }

  const lastKey = nestedKeys[nestedKeys.length - 1]
  currentLevel[lastKey] = order === 'desc' ? 'desc' : 'asc'

  return orderBy
}

export const buildWhereClause = (searchQuery, fixedParams = {}) => {
  return new WhereClauseBuilder(fixedParams).addSearchQuery(searchQuery).build()
}

export const buildPaginationParams = (page, perPage) => {
  return {
    skip: (page - 1) * perPage,
    take: perPage
  }
}

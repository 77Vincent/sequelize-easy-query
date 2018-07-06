const Sequelize = require('sequelize')
const querystring = require('querystring')

const { Op } = Sequelize

// Operators
const or = Op ? Op.or : '$or'
const like = Op ? Op.like : '$like'

/**
 * Get type
 */
const is = input => Object.prototype.toString.call(input)

/**
 * If a variable has meaningful value
 */
const hasValue = input => input !== undefined && input !== null && input !== ''

/**
 * Generate query object for the sequelize "where" or "order" clauses
 */
module.exports = (rawQuerystring = '', options = {}) => {
  if (is(options) !== '[object Object]') {
    throw new Error('The second parameter: options should be type of Object')
  }

  let {
    filter, filterBy, filterByAlias,
    order, orderBy, orderByAlias,
    search, searchBy,
  } = options

  if ((filter || filterBy || filterByAlias || search || searchBy) && (order || orderBy || orderByAlias)) {
    throw new Error('Configurations for "order" clause cannot be used with those for "where" clause at the same time.')
  }

  // Initial the output object
  const output = order || orderBy || orderByAlias ? [] : {}

  // Get full query string with pre-query values
  const fullQuerystring =
    `${rawQuerystring}&${querystring.stringify(filter || order)}&${querystring.stringify({ search })}`

  // Add pre-query values into query object
  const queryObject = querystring.parse(fullQuerystring)
  const alias = filterByAlias || orderByAlias || {}

  Object.keys(alias).map((key) => {
    const newKey = alias[key]
    if (newKey === key) {
      return null
    }
    // Remove the origin property
    if (Object.prototype.hasOwnProperty.call(queryObject, key)) {
      delete queryObject[key]
    }
    // Add a new property using alias and give it origin value
    if (Object.prototype.hasOwnProperty.call(queryObject, newKey)) {
      queryObject[key] = queryObject[newKey]
      delete queryObject[newKey]
    }
    return null
  })

  // Default values
  filter = filter || {}
  filterBy = filterBy || []
  filterByAlias = filterByAlias || {}

  order = order || {}
  orderBy = orderBy || []
  orderByAlias = orderByAlias || {}

  search = search || []
  searchBy = searchBy || []

  // Add keys defined in pre-query and queryByAlias into queryBy
  Object.keys(filter).map(key => filterBy.push(key))
  Object.keys(order).map(key => orderBy.push(key))
  Object.keys(filterByAlias).map(key => filterBy.push(key))
  Object.keys(orderByAlias).map(key => orderBy.push(key))

  // From here are the actual basic query
  // Filter by
  Object.keys(queryObject).map((key) => {
    if (filterBy.indexOf(key) !== -1 && key !== 'search') {
      const queryValue = queryObject[key]
      if (hasValue(queryValue)) {
        output[key] = String(queryValue).split(',').filter(value => hasValue(value))
      }
    }
    return null
  })

  // Search by
  if (searchBy.length && queryObject.search) {
    const arrayForSearch = searchBy.map(column => ({
      [column]: {
        [or]: String(queryObject.search)
          .split(',')
          .filter(value => hasValue(value))
          .map(value => ({ [like]: `%${value}%` })),
      },
    }))
    output[or] = arrayForSearch
  }

  // Order by
  Object.keys(queryObject).map((key) => {
    if (orderBy.indexOf(key) !== -1) {
      const queryValue = queryObject[key]
      if (hasValue(queryValue)) {
        output.push([key, String(queryValue).split(',')[0]])
      }
    }
    return null
  })

  // Only return when it has query object
  if (!Object.keys(output).length && !output[or]) { return null }
  return output
}

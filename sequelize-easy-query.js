const Sequelize = require('sequelize')
const querystring = require('querystring')

const { Op } = Sequelize

const is = input => Object.prototype.toString.call(input)

const isEmpty = input => input !== undefined && input !== null && input !== ''

const processAlias = (alias = {}, inputQueryObject = {}) => {
  const outputQueryObject = Object.assign({}, inputQueryObject)
  Object.keys(alias).map((key) => {
    const newKey = alias[key]
    if (newKey === key) {
      return null
    }
    // Remove the origin property
    if (Object.prototype.hasOwnProperty.call(outputQueryObject, key)) {
      delete outputQueryObject[key]
    }
    // Add a new property using alias and give it origin value
    if (Object.prototype.hasOwnProperty.call(outputQueryObject, newKey)) {
      outputQueryObject[key] = outputQueryObject[newKey]
      delete outputQueryObject[newKey]
    }
    return null
  })
  return outputQueryObject
}

/**
 * Generate query object for the sequelize "where" or "order" clauses
 */
module.exports = (rawQuerystring = '', options = { jjj: [] }) => {
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

  const queryObject = processAlias(filterByAlias || orderByAlias, querystring
    .parse(`${rawQuerystring}&${querystring.stringify(filter || order)}`))

  // Default values
  filter = filter || {}
  filterBy = filterBy || []
  filterByAlias = filterByAlias || {}

  order = order || {}
  orderBy = orderBy || []
  orderByAlias = orderByAlias || {}

  search = search || null
  searchBy = searchBy || []


  if (search) {
    queryObject.search = search
  }

  Object.keys(filter).map(key => filterBy.push(key))
  Object.keys(filterByAlias).map(key => filterBy.push(key))
  Object.keys(order).map(key => orderBy.push(key))
  Object.keys(orderByAlias).map(key => orderBy.push(key))

  // Filter by
  Object.keys(queryObject).map((key) => {
    if (filterBy.indexOf(key) !== -1 && key !== 'search') {
      const queryValue = queryObject[key]
      if (isEmpty(queryValue)) {
        switch (is(queryValue)) {
          case '[object Array]':
            output[key] = decodeURI(queryValue).split(',').filter(value => isEmpty(value))
            break
          default:
            output[key] = decodeURI(queryValue)
        }
      }
    }
    return null
  })

  // Search by
  if (searchBy.length && queryObject.search) {
    const arrayForSearch = searchBy.map(value => ({
      [value]: {
        [(Op ? Op.like : '$like')]: `%${decodeURI(queryObject.search)}%`,
      },
    }))
    output[(Op ? Op.or : '$or')] = arrayForSearch
  }

  // Order by
  Object.keys(queryObject).map((key) => {
    if (orderBy.indexOf(key) !== -1) {
      const queryValue = queryObject[key]
      if (isEmpty(queryValue)) {
        switch (is(queryValue)) {
          case '[object Array]':
            output.push([key, decodeURI(queryValue).split(',')[0]])
            break
          default:
            output.push([key, decodeURI(queryValue)])
        }
      }
    }
    return null
  })

  if (!Object.keys(output).length && !output[(Op ? Op.or : '$or')]) { return null }
  return output
}

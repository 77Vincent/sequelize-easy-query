const Sequelize = require('sequelize')
const querystring = require('querystring')

const { Op } = Sequelize

const is = input => Object.prototype.toString.call(input)

/**
 * This is a Class used for quick filtering and searching in sequelize
 * @class SequelizeWhere
 * @param {String} rawQuerystring The raw querystring from client
 * @param {Object} options Options and configurations
 * @returns {Object} Plain object that can be directly used for sequelize query
 */
class SequelizeWhere {
  constructor(rawQuerystring = '', options = {}) {
    if (is(rawQuerystring) !== '[object String]') {
      throw new Error('The first argument: the input querystring should be type of String')
    }
    if (is(options) !== '[object Object]') {
      throw new Error('The second argument: options should be type of Object')
    }

    this.options = {}
    this.options.prefilter = options.prefilter || {}
    this.options.alias = options.alias || {}
    this.options.search = options.search || null

    const readyQuerystring = `${rawQuerystring}&${querystring.stringify(this.options.prefilter)}`

    this.queryObject = {}
    Object.assign(this.queryObject, querystring.parse(readyQuerystring))

    // Add pre-search
    if (this.options.search) {
      this.queryObject.search = this.options.search
    }

    // Process alias
    Object.keys(this.options.alias).map((key) => {
      const alias = this.options.alias[key]
      // Remove the origin property
      if (Object.prototype.hasOwnProperty.call(this.queryObject, key)) {
        delete this.queryObject[key]
      }
      // Add a new property using alias and give it origin value
      if (Object.prototype.hasOwnProperty.call(this.queryObject, alias)) {
        this.queryObject[key] = this.queryObject[alias]
        delete this.queryObject[alias]
      }
      return null
    })
  }

  filterBy(keys = []) {
    Object.keys(this.options.prefilter).map((key) => {
      keys.push(key)
      return null
    })

    const source = this.queryObject
    Object.keys(source).map((key) => {
      if (keys.indexOf(key) !== -1) {
        const queryValue = source[key]
        if (queryValue !== undefined && queryValue !== null && queryValue !== '') {
          switch (is(queryValue)) {
            case '[object Array]':
              this[key] = decodeURI(queryValue).split(',')
              break
            default:
              this[key] = decodeURI(queryValue)
          }
        }
      }
      return null
    })
    return this
  }

  searchBy(keys = []) {
    const { search } = this.queryObject

    const arr = keys.map(value => ({
      [value]: {
        [Op.like]: `%${decodeURI(search)}%`,
      },
    }))

    if (search) {
      this[Op.or] = arr
    }
    return this
  }

  done() {
    // Return plain object for sequelize
    const outputQuery = {}
    Object.keys(this).map((key) => {
      outputQuery[key] = this[key]
      return null
    })

    if (this[Op.or]) {
      outputQuery[Op.or] = this[Op.or]
    }

    delete outputQuery.queryObject
    delete outputQuery.options
    if (!Object.keys(outputQuery).length && !outputQuery[Op.or]) { return null }
    return outputQuery
  }
}

module.exports = SequelizeWhere

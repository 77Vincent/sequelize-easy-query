# sequelize-easy-query
An easy and robust way of making filtering, searching and ordering in sequelize.

[![Build Status](https://travis-ci.org/77Vincent/sequelize-easy-query.svg?branch=master)](https://travis-ci.org/77Vincent/sequelize-easy-query)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation
```bash
npm install sequelize-easy-query --save
```

## Usage
Let's say we have a table called "User".
```js
// For demonstration purpose, only present the core part

module.exports.User = new Sequelize(configs).define('user', {
  gender: Sequelize.BOOLEAN,
  active: Sequelize.BOOLEAN,
  age: Sequelize.TINYINT,
  motto: Sequelize.STRING,
  bio: Sequelize.STRING,
  updated_at: Sequelize.Date,
})
```

By doing as follow, "User" now supports multiple queries using query string with safety.
```js
const seq = require('sequelize-easy-query')

const data = await User.findAll({
  where: seq.where('raw query string', {
    filterBy: ['gender', 'active'],
    searchBy: ['motto', 'bio'],
  }),
  order: seq.order('raw query string', {
    orderBy: ['age', 'updated_at']
  })
})
```
#### Filtering
```bash
example.com/api/users?gender=0&active=1
```
#### Searching
```bash
example.com/api/users?search=some_value
```
#### Ordering
```bash
example.com/api/users?age=DESC
```
#### Combination
```bash
example.com/api/users?gender=0&search=some_value&age=DESC
```
#### No error will occur under these cases:
- Pass column names that are not defined in the table
```bash
example.com/api/users?nonexistent_column=some_value
```
- Incomplete query string
```bash
example.com/api/users?key
```
```bash
example.com/api/users?key=
```

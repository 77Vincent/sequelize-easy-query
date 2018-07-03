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
module.exports.User = new Sequelize(configs).define('user', {
  gender: Sequelize.BOOLEAN,
  active: Sequelize.BOOLEAN,
  age: Sequelize.TINYINT,
  motto: Sequelize.STRING,
  bio: Sequelize.STRING,
  updated_at: Sequelize.Date,
})
```

By doing as follow, "User" now supports multiple queries using querystring with safety.
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
All the keys declared in filterBy can now be used for query, individually or in combination.
```bash
example.com/api/users?gender=0&active=1
```

Similar as filterBy, when orderBy is presented, keys defined in there can now be used for ordering, but with only two options: "ASC" or "DESC".
```bash
example.com/api/users?age=DESC
```

A little different when using searchBy, keys defined in there is to tell the database what columns to be searched, the key to trigger a search query is "search".
```bash
example.com/api/users?search=some_value
```

All of those queries can be made in combination.
```bash
example.com/api/users?gender=0&search=some_value&age=DESC
```

No error will occur when passing keys that are not defined in the table
```bash
example.com/api/users?nonexistent_column=some_value
```
or with incomplete query string like
```bash
example.com/api/users?key=

example.com/api/users?key
```

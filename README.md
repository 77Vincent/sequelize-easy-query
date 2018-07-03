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
// For demonstration purpose some codes are omitted.

module.exports.User = new Sequelize(configs).define('user', {
  gender: Sequelize.BOOLEAN,
  active: Sequelize.BOOLEAN,
  age: Sequelize.TINYINT,
  motto: Sequelize.STRING,
  bio: Sequelize.STRING,
})
```

By doing as follow, User table now supports:
- Filtered 
```js
const seq = require('sequelize-easy-query')

const data = await User.findAll({
  where: seq.where('raw query string', {
    filterBy: ['gender'],
    searchBy: ['motto'],
  }),
})
```

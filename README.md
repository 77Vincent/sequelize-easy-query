# sequelize-easy-query
An easy and robust way of making filtering, searching and ordering using querystring in sequelize.

[![Build Status](https://travis-ci.org/77Vincent/sequelize-easy-query.svg?branch=master)](https://travis-ci.org/77Vincent/sequelize-easy-query)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation
```bash
npm install sequelize-easy-query --save
```

## Usage
Let's say we have a "User" table.
```js
const Sequelize = require('sequelize')
const seq = require('sequelize-easy-query')

module.exports.User = new Sequelize(configs).define('user', {
  gender: Sequelize.BOOLEAN,
  active: Sequelize.BOOLEAN,
  age: Sequelize.TINYINT,
  motto: Sequelize.STRING,
  bio: Sequelize.STRING,
  updated_at: Sequelize.Date,
})
```

### filterBy
To filter the "User" table by "gender" and "active" column, simply do:
```js
const users = await User.findAll({
  where: seq.where('raw query string', {
    filterBy: ['gender', 'active'],
  }),
})
```
Now you can filter with querystring individually or in combination.
```bash
example.com/api/users?gender=0&active=1
```
Multiple selection
```bash
example.com/api/users?gender=0&gender=1
```

### searchBy
To search the "User" table by content in "bio" or "motto" column, simply do:
```js
const users = await User.findAll({
  where: seq.where('raw query string', {
    searchBy: ['bio', 'motto'],
  }),
})
```
Unlike filterBy, the key word 
```bash
example.com/api/users?search=some_value
```

#### Search
A little different when using searchBy, keys defined in there is to tell the database what columns to be searched, the key to trigger a search query is "search".


#### Combination
All of those queries can be made in combination.
```bash
example.com/api/users?gender=0&search=some_value&age=DESC
```

#### No error
No error will occur when passing keys that are not defined in the table
```bash
example.com/api/users?nonexistent_column=some_value
```
or with incomplete query string like
```bash
example.com/api/users?key=

example.com/api/users?key

example.com/api/users?key=&key2=
```

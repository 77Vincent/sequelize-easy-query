# sequelize-easy-query
An easy and robust way of making filtering, searching and ordering using querystring in sequelize.

[![Build Status](https://travis-ci.org/77Vincent/sequelize-easy-query.svg?branch=master)](https://travis-ci.org/77Vincent/sequelize-easy-query)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation
```bash
npm install sequelize-easy-query --save
```

## Quick Start
Let's say we have a "User" table, we want to implement filtering, ordering and searching using querystring, with the native sequelize "where" and "order" clause.
```js
// user-model.js
// For demonstration purpose, some codes are omitted

const Sequelize = require('sequelize')

module.exports.User = new Sequelize(configs).define('user', {
  gender: Sequelize.BOOLEAN,
  active: Sequelize.BOOLEAN,
  age: Sequelize.TINYINT,
  motto: Sequelize.STRING,
  bio: Sequelize.STRING,
  updated_at: Sequelize.Date,
})
```
```js
// user-router.js

const seq = require('sequelize-easy-query')

const users = await User.findAll({
  where: seq('raw query string', {
    filterBy: ['gender', 'active'],
    searchBy: ['bio', 'motto'],
  }),
  order: seq('raw query string', {
    orderBy: ['age', 'updated_at'],
  }),
})
```
Now you can make query using querystring individually or in combination with safety:
```bash
example.com/api/users?gender=0&active=1&search=programmer&search=confident&cost=DESC
```
Passing incomplete querystring or nonexistent column names won't cause any error, in below cases, the whole table without any filtering will be returned:
```bash
example.com/api/users?&foo=1
```
```bash
example.com/api/users?gender
```
```bash
example.com/api/users?search&&
```


## Table of API
##### Basic query
* [filterBy](#filterBy)
* [searchBy](#searchBy)
* [orderBy](#orderBy)
##### Query with alias
* [filterByAlias](#filterByAlias)
* [orderByAlias](#orderByAlias)
##### Pre-query
* [filter](#filter)
* [search](#search)
* [order](#order)


## Basic Query
### <a name="filterBy"></a>filterBy: string[ ]
Filter users by "gender" and "active" column:
```js
const users = await User.findAll({
  where: seq('raw query string', {
    filterBy: ['gender', 'active'],
  }),
})
```
Making query in combination, this will return users with gender=0 **AND** active=1
```bash
example.com/api/users?gender=0&active=1
```
Multiple selection, this will return users with gender=0 **OR** users with gender=1
```bash
example.com/api/users?gender=0&gender=1
```

### <a name="searchBy"></a>searchBy: string[ ]
Search users if they have certain content in their "bio" **OR** "motto" column:
```js
const users = await User.findAll({
  where: seq('raw query string', {
    searchBy: ['bio', 'motto'],
  }),
})
```
Use key "search" to trigger a search:
```bash
example.com/api/users?search=some_values
```
Multiple search, this will return users that have "value_1" **OR** "value_2":
```bash
example.com/api/users?search=value_1&search=value_2
```

### <a name="orderBy"></a>orderBy: string[ ]
Order users by their "age" **OR** "updated_at" value:
```js
const users = await User.findAll({
  order: seq('raw query string', {
    orderBy: ['age', 'updated_at'],
  }),
})
```
Only two options are usable: DESC or ASC:
```bash
example.com/api/users?age=DESC
```
```bash
example.com/api/users?updated_at=ASC
```
Multiple ordering is meaningless, only the first one will work:
```bash
example.com/api/users?age=DESC&updated_at=ASC
```

## Query With Alias
### <a name="filterByAlias"></a>filterByAlias: {}
Sometimes you want the key used for query not to be the same as its corresponding column name:
```js
const users = await User.findAll({
  where: seq('raw query string', {
    filterByAlias: {
      gender: 'isMale',
      active: 'isAvailale',
    },
  }),
})
```
Now you can filter users by using the new keys and the original ones can no longer be used:
```bash
example.com/api/users?isMale=0&isAvailable=1
```
This feature is especially useful when you have included other associated models, you want to filter the main model based on columns from those associated models but not to affect the main model:
```js
const users = await User.findAll({
  include: [{
    model: Puppy,
    where: seq('raw query string', {
      filterByAlias: {
        gender: 'puppy_gender'
      }
    })
  }],
  where: seq('raw query string', {
    filterBy: ['gender']
  }),
})
```
Now "puppy_gender" is used to filter users based on their puppies' gender, but not they themselves' gender:
```bash
example.com/api/users?puppy_gender=1
```
While "gender" is still used to filter users by users' gender:
```bash
example.com/api/users?gender=1
```

Alias can also be given the same value as the original column name, it's totally fine:
```js
const users = await User.findAll({
  where: seq('raw query string', {
    filterByAlias: {
      gender: 'gender',
      active: 'active',
    },
  }),
})

// is same as
const users = await User.findAll({
  where: seq('raw query string', {
    filterBy: ['gender', 'active'],
  }),
})
```

### <a name="orderByAlias"></a>orderByAlias: {}
Please refer to [filterByAlias](#filterByAlias) which is for the same purpose and with the same behaviour.

## Pre-query
### <a name="filter"></a>filter: {}
Pre-filter without any querystring from client:
```js
const users = await User.findAll({
  where: seq('raw query string', {
    filter: {
      gender: 1,
      active: 0,
    }
  }),
})
```

### <a name="search"></a>search: string[]
Pre-search without any querystring from client, "searchBy" is still needed to be declared as it tells database on which columns to perform the search:
```js
const users = await User.findAll({
  where: seq('raw query string', {
    search: ['some content', 'some other content'],
    searchBy: ['bio', 'motto'],
  }),
})
```

### <a name="order"></a>order: {}
Pre-order without any querystring from client, it can only take one key-value pairs at a time:
```js
const users = await User.findAll({
  order: seq('raw query string', {
    order: {
      age: 'DESC',
    }
  }),
})
```

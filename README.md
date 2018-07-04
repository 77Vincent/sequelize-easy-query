# sequelize-easy-query
An easy and robust way of making filtering, searching and ordering using querystring in sequelize.

[![Build Status](https://travis-ci.org/77Vincent/sequelize-easy-query.svg?branch=master)](https://travis-ci.org/77Vincent/sequelize-easy-query)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation
```bash
npm install sequelize-easy-query --save
```

## Usage
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
Now you are able to perform multiple queries on the table using querystring with safety:
```bash
example.com/api/users?gender=0&active=1&search=programmer&cost=DESC
```
Passing incomplete querystring or nonexistent column names won't cause any error:
```bash
example.com/api/users?&status=1&gender=
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

### <a name="filterBy"></a>filterBy: string[ ]
To filter the "User" table by "gender" and "active" column, simply do:
```js
const users = await User.findAll({
  where: seq('raw query string', {
    filterBy: ['gender', 'active'],
  }),
})
```
Now you can filter with querystring individually or in combination:
```bash
example.com/api/users?gender=0&active=1
```
Multiple selections on the same column, this will return users with gender 1 **OR** 0
```bash
example.com/api/users?gender=0&gender=1
```

### <a name="searchBy"></a>searchBy: string[ ]
To search users by content in their "bio" **OR** "motto" column, simply do:
```js
const users = await User.findAll({
  where: seq('raw query string', {
    searchBy: ['bio', 'motto'],
  }),
})
```
Now you can trigger a search by using the key "search", which will give you those users that have "some_values" in their "bio" **OR** "motto" field:
```bash
example.com/api/users?search=some_values
```
Unlike filterBy, multiple searches is **NOT SUPPORTED** yet, only one search can be given at a time:
```bash
example.com/api/users?search=some_values&search=some_other_values
```

### <a name="orderBy"></a>orderBy: string[ ]
To order users by their "age" or "updated_at" value, simply do:
```js
const users = await User.findAll({
  order: seq('raw query string', {
    orderBy: ['age', 'updated_at'],
  }),
})
```
Now you can order the table by "age" **OR** "updated_at" respectively, only two options are usable: DESC or ASC:
```bash
example.com/api/users?age=DESC
```
```bash
example.com/api/users?updated_at=ASC
```
Multiple ordering is meaningless, only the first query will work:
```bash
example.com/api/users?age=DESC&updated_at=ASC
```

### <a name="filterByAlias"></a>filterByAlias: {}
Sometimes you want the key used for query not to be the same as its corresponding column name, you can do:
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
```
Then everything will be just like using filterBy:
```bash
example.com/api/users?gender=0&active=1
```

### <a name="orderByAlias"></a>orderByAlias: {}
Please refer to [filterByAlias](#filterByAlias) which is for the same purpose and with the same behaviour.

### <a name="filter"></a>filter: {}
If you want to pre-filter the table without any querystring from client, simply do:
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
You can still add querystring for further filtering, this will be the same as doing "?gender=1&gender=0&active=0":
```bash
example.com/api/users?gender=0
```

### <a name="search"></a>search: string
If you want to pre-search the table without any querystring from client, simply do as follow, to be noticed that "searchBy" is still needed to be declared as it tells database on which columns to perform the search:
```js
const users = await User.findAll({
  where: seq('raw query string', {
    search: 'content to search',
    searchBy: ['bio', 'motto'],
  }),
})
```
Because multiple search is not supported yet, if you keep adding querystring for search, it won't give you new result:
```bash
example.com/api/users?search=some_other_content
```

### <a name="order"></a>order: {}
If you want to pre-order the table, simply do as follow, to be notice that it can only order the table based on one column at a time:
```js
const users = await User.findAll({
  order: seq('raw query string', {
    order: {
      age: 'DESC'
    }
  }),
})
```
You can still add querystring for further ordering, the new added query will take place:
```bash
example.com/api/users?updated_at=DESC
```

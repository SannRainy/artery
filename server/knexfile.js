const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST_TEST || 'localhost',
      port: process.env.DB_PORT_TEST || 3306,
      database: process.env.DB_NAME_TEST || 'artery',
      user: process.env.DB_USER_TEST || 'root',
      password: process.env.DB_PASSWORD_TEST || '',
      charset: 'utf8mb4'
    },

    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  },
  production: {
    client: 'pg',
    connection:process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations'
    }
  },
  test: {   
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST_TEST || 'localhost',
      port: process.env.DB_PORT_TEST || 3306,
      database: process.env.DB_NAME_TEST || 'artery_test',
      user: process.env.DB_USER_TEST || 'root',
      password: process.env.DB_PASSWORD_TEST || '',
      charset: 'utf8mb4'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  }
};
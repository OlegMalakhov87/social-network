require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    use_env_variable: process.env.DB_URL ? "DB_URL" : undefined,
    dialect: "postgres",
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    use_env_variable: process.env.DB_URL ? "DB_URL" : undefined,
    dialect: "postgres",
  },
  production: {
    username: process.env.DB_USER_PROD,
    password: process.env.DB_PASS_PROD,
    database: process.env.DB_NAME_PROD,
    host: process.env.DB_HOST_PROD,
    use_env_variable: process.env.DB_URL_PROD ? "DB_URL_PROD" : undefined,
    dialect: "postgres",
  },
};

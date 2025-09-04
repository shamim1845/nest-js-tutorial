import * as joi from 'joi';

export const envValidationSchema = joi.object({
  NODE_ENV: joi
    .string()
    .valid('development', 'production', 'test')
    .default('development')
    .required(),
  DB_TYPE: joi.string().valid('postgres').default('postgres').required(),
  DB_HOST: joi.string().default('localhost').required(),
  DB_PORT: joi.number().port().default(5432).required(),
  DB_NAME: joi.string().required(),
  DB_USER_NAME: joi.string().required(),
  DB_PASSWORD: joi.string().required(),
  DB_SYNC: joi.boolean().default(false).required(),
  DB_AUTO_LOAD_ENTITIES: joi.boolean().default(false).required(),
  SECRET_KEY: joi.string().required(),
});

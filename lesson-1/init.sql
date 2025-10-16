-- Initial database setup
-- This file is executed when the PostgreSQL container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- You can add any initial data or schema modifications here
-- For example:
-- CREATE TABLE IF NOT EXISTS initial_setup (
--     id SERIAL PRIMARY KEY,
--     setup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- Insert any initial data here
-- INSERT INTO initial_setup (setup_date) VALUES (CURRENT_TIMESTAMP);

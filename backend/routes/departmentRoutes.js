const express = require('express');
const { pool } = require('../db'); // Wait, the db is usually exported from a db.js file. I need to check how server.js gets the pool.

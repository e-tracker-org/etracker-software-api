const express = require('express');
const router = express.Router();
const historyController = require('../controller/history.controller');

// Create a new History entry
router.post('/', historyController.createHistory);

// Find a single History entry by tenant email
router.get('/:email', historyController.findOneByEmail);

// Update a History entry by ID
router.put('/:id', historyController.update);

// Delete a History entry by ID
router.delete('/:id', historyController.delete);

// Delete all History entries
router.delete('/', historyController.deleteAll);

module.exports = router;

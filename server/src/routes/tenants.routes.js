const express = require('express')
const router = express.Router()
const taskController = require('../controller/tenant.controller');

// Retrieve all tenants
router.get('/', taskController.findAll);

// Create a new task
router.post('/create', taskController.create);

// Retrieve property tenant
router.get('/property/:propertyId', taskController.propertyTenant);

router.get('/landlord-properties/:landlordId', taskController.landlordTenant);

router.get('/transactions/:tenantId', taskController.findTenantTransaction);

// Update a task with id
router.put('/update/:id', taskController.update);

// approve leave 
router.put('/completed/:id', taskController.completed);

// disapprove leave
router.put('/pending/:id', taskController.pending);


// Retrieve a single task with id
router.get('details/:id', taskController.findOne);

// Delete a task with id
router.delete('/delete/:id', taskController.delete);

module.exports = router
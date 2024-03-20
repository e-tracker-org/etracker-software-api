const express = require('express')
const router = express.Router()
const tenantController = require('../controller/tenant.controller');

// Retrieve all tenants
router.get('/', tenantController.findAll);

// Create a new task
router.post('/create', tenantController.create);

// Retrieve property tenant
router.get('/property/:propertyId', tenantController.propertyTenant);

router.get('/landlord-properties/:landlordId', tenantController.landlordTenant);

router.get('/transactions/:tenantId', tenantController.findTenantTransaction);

router.get('/files/:tenantId', tenantController.findTenantFiles);

// Update a task with id
router.put('/update/:id', tenantController.update);

// approve leave 
router.put('/completed/:id', tenantController.completed);

// disapprove leave
router.put('/pending/:id', tenantController.pending);


// Retrieve a single task with id
router.get('details/:id', tenantController.findOne);

// Delete a task with id
router.delete('/delete/:id', tenantController.delete);

module.exports = router
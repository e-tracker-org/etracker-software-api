const express = require('express');
const router = express.Router();
const tenantController = require('../controller/tenant.controller');
const defaultContainer = require('../controller/tenantDefault.controller');

// Retrieve all tenants
router.get('/', tenantController.findAll);

// Create a new task
router.post('/create', tenantController.create);

// Retrieve property tenant
router.get('/property/:propertyId', tenantController.propertyTenant);

router.get('/tenant-property/:tenantId', tenantController.findPropertiesByTenantId);

router.get('/landlord-properties/:landlordId', tenantController.landlordTenant);

router.get('/transactions/:tenantId', tenantController.findTenantTransaction);

router.get('/files/:tenantId', tenantController.findTenantFiles);

// Update a task with id
router.put('/update/:id', tenantController.update);

router.put('/update-rating/:id', tenantController.updateRating);

// Retrieve a single task with id
router.get('details/:id', tenantController.findOne);

// Delete a task with id
router.delete('/delete/:id', tenantController.delete);

router.put('/completed/:id', tenantController.completed);

//Invite Tenant
router.post('/invite', tenantController.inviteTenant);

// DEFAULT URLS
// Route to create a rating
router.post('/default/create-default', defaultContainer.create);

// Route to find the tenant rating
router.get('/default/landlord/:landlordId', defaultContainer.getTenantLandlordDefault);

router.get('/default/all', defaultContainer.getTenantDefault);

router.put('/default/approve/:id', defaultContainer.approveDefaultRequest);

module.exports = router;

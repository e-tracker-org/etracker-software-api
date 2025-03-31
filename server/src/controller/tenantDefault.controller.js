const db = require('../models');
const TenantDefault = db.tenantDefault;
exports.create = (req, res) => {
  //   if(!req.headers.authorization) {
  //     return res.status(401).send({ message: "Unauthorized request" });
  //   }
  // Validate request
  if (!req.body) {
    res.status(400).send({ message: 'Content can not be empty!' });
    return;
  }

  // Create a Tenant
  const tenant = new TenantDefault({
    propertyAddress: req.body.propertyAddress,
    landlordID: req.body.landlordId,
    complaints: req.body.complaints,
    proof: req.body.proof,
    tenantGender: req.body.tenantGender,
    tenantEmail: req.body.tenantEmail,
    tenantPhone: req.body.tenantPhone,
    tenantName: req.body.tenantName,
    landlordNIN: req.body.landlordNIN,
    tenantNIN: req.body.tenantNIN,
    status: 'SUBMITTED',
    image_list: req.body.imageList,
  });

  console.log(tenant, 'tenant');

  // Save Tenant in the database
  tenant
    .save(tenant)
    .then((data) => {
      console.log('data', data);
      res.status(200).send(data);
    })
    .catch((err) => {
      console.log('err', err);
      res.status(500).send({
        message: err.message || 'Some error occurred while creating the Tenant.',
      });
    });
};

// Controller function to find the tenant tenantDefault
exports.getTenantLandlordDefault = (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'Unauthorized request' });
  }
  const id = req.params.landlordId;

  TenantDefault.find({ landlordID: id })
    .then((data) => {
      if (!data) res.status(404).send({ message: 'Not found Tenant with id ' + id });
      else res.status(200).send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: 'Error retrieving Tenant transactions with id=' + id });
    });
};

exports.getTenantDefault = (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'Unauthorized request' });
  }

  TenantDefault.find()
    .then((data) => {
      if (!data) res.status(404).send({ message: 'Not found Tenant with id ' + id });
      else res.status(200).send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: 'Error retrieving Tenant transactions with id=' + id });
    });
};

exports.approveDefaultRequest = (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'Unauthorized request' });
  }

  const id = req.params.id;

  TenantDefault.findByIdAndUpdate(req.params.id, { status: 'APPROVED' }, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update Tenant with id=${id}. Maybe Tenant was not found!`,
        });
      } else res.send({ message: 'Tenant was updated successfully.' });
    })
    .catch((err) => {
      res.status(500).send({
        message: 'Error updating Tenant with id=' + id,
      });
    });
};

exports.getAllDefaultTenants = (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'Unauthorized request' });
  }

  TenantDefault.find()
    .then((data) => {
      if (!data) {
        res.status(404).send({ message: 'No default tenants found' });
      } else {
        res.status(200).send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({ message: 'Error retrieving default tenants' });
    });
};

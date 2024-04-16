const db = require('../models');
const { PropertyStatus } = require('../modules/property/property.model');
const Tenant = db.tenant;
const Transaction = db.transaction;
const Files = db.files;
const { sendEmail } = require('../modules/email-service');
// import sendEndAgreementTemaplate from '../utils/email-templates';
const { sendEndAgreementTemaplate, inviteTenantLinkTemplate } = require('../utils/email-templates');
const { findById } = require('../modules/property/property.service');
const User = db.user;

// Create and Save a new Tenant
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
  const tenant = new Tenant({
    userId: req.body.userId,
    propertyId: req.body.propertyId,
    landlordId: req.body.landlordId,
    status: PropertyStatus.INCOMPLETE,
  });

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
  const tenant = new Tenant({
    userId: req.body.userId,
    propertyId: req.body.propertyId,
    landlordID: req.body.landlordID,
    status: PropertyStatus.INCOMPLETE,
  });

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

// Retrieve all Tenant from the database.
exports.findAll = (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'Unauthorized request' });
  }

  Tenant.find()
    .then((tenantData) => {
      const userIds = tenantData.map((tenant) => tenant.userId);

      return User.find({ userId: { $in: userIds } }).then((userData) => {
        const combinedData = tenantData.map((tenant) => {
          const user = userData.find((u) => u.id === tenant.userId);

          return {
            tenantData: tenant,
            userData: user,
          };
        });

        const sortedData = combinedData.sort((a, b) => {
          return new Date(b.userData.createdAt) - new Date(a.userData.createdAt);
        });

        res.status(200).send(sortedData);
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || 'Some error occurred while retrieving data.',
      });
    });
};

// updat tenant rating
exports.updateRating = (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'Unauthorized request' });
  }

  const id = req.params.id;
  const ratingUpdate = req.body.ratingUpdate;

  User.findById(id)
    .then((tenant) => {
      if (!tenant) {
        return res.status(404).send({
          message: `Cannot update Tenant with id=${id}. Tenant not found!`,
        });
      }

      let updatedRating = tenant.rating + ratingUpdate;

      return User.findByIdAndUpdate(id, { rating: updatedRating }, { useFindAndModify: false });
    })
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: `Cannot update Tenant with id=${id}. Maybe Tenant was not found!`,
        });
      }
      res.status(200).send({ message: 'Tenant rating was updated successfully.', status: 200 });
    })
    .catch((err) => {
      console.error('Error updating Tenant:', err);
      res.status(500).send({
        message: 'Error updating Tenant with id=' + id,
      });
    });
};

// property tenants
exports.propertyTenant = (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'Unauthorized request' });
  }
  Tenant.find({ propertyId: req.params.propertyId })
    .then((tenantData) => {
      const userIds = tenantData.map((tenant) => tenant.userId);

      return User.find({ userId: { $in: userIds } }).then((userData) => {
        const combinedData = tenantData.map((tenant) => {
          const user = userData.find((u) => u.id === tenant.userId);

          return {
            tenantData: tenant,
            userData: user,
          };
        });

        const sortedData = combinedData.sort((a, b) => {
          return new Date(b.userData.createdAt) - new Date(a.userData.createdAt);
        });

        res.status(200).send(sortedData);
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || 'Some error occurred while retrieving data.',
      });
    });
};

// Landord tenants
exports.landlordTenant = (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'Unauthorized request' });
  }

  Tenant.find({ landlordId: req.params.landlordId })
    .then((tenantData) => {
      console.log('Fetched Data:', tenantData);

      if (tenantData.length === 0) {
        return res.status(404).send({ message: 'No data found for the specified landlordId' });
      }
      const userIds = tenantData.map((tenant) => tenant.userId);

      return User.find({ userId: { $in: userIds } }).then((userData) => {
        const combinedData = tenantData.map((tenant) => {
          const user = userData.find((u) => u.id === tenant.userId);

          return {
            tenantData: tenant,
            userData: user,
          };
        });

        //   const sortedData = combinedData.sort((a, b) => {
        //     return new Date(b.userData.createdAt) - new Date(a.userData.createdAt);
        //   });

        res.status(200).send(combinedData);
      });
    })
    .catch((err) => {
      res.status(200).send({
        message: err.message || 'Some error occurred while retrieving data.',
      });
    });
};

// Find a single Tenant with an id
exports.findOne = (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'Unauthorized request' });
  }
  const id = req.params.id;

  Tenant.findOne(id)
    .then((data) => {
      if (!data) res.status(404).send({ message: 'Not found Tenant with id ' + id });
      else res.status(200).send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: 'Error retrieving Tenant with id=' + id });
    });
};

// Find a single Tenant with an id
exports.findTenantTransaction = (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'Unauthorized request' });
  }
  const id = req.params.tenantId;

  Transaction.find({ received_by: id })
    .then((data) => {
      if (!data) res.status(404).send({ message: 'Not found Tenant transactions with id ' + id });
      else res.status(200).send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: 'Error retrieving Tenant transactions with id=' + id });
    });
};

// Find tenant files
exports.findTenantFiles = (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'Unauthorized request' });
  }
  const id = req.params.tenantId;

  Files.find({ userId: id })
    .then((data) => {
      if (!data) res.status(404).send({ message: 'Not found Tenant transactions with id ' + id });
      else res.status(200).send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: 'Error retrieving Tenant transactions with id=' + id });
    });
};

// complete tenant
exports.completed = (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'Unauthorized request' });
  }
  const id = req.params.id;
  Tenant.findByIdAndUpdate(id, { status: PropertyStatus.COMPLETE }, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update Tenant with id=${id}. Maybe Tenant was not found!`,
        });
      } else res.status(200).send({ message: 'Tenant was updated successfully.' });
    })
    .catch((err) => {
      res.status(500).send({
        message: 'Error updating Tenant with id=' + id,
      });
    });
};

// incomplete tenant
exports.pending = (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'Unauthorized request' });
  }
  const id = req.params.id;
  Tenant.findByIdAndUpdate(req.params.id, { status: PropertyStatus.INCOMPLETE }, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update Tenant with id=${id}. Maybe Tenant was not found!`,
        });
      } else res.status(200).send({ message: 'Tenant was updated successfully.' });
    })
    .catch((err) => {
      res.status(500).send({
        message: 'Error updating Tenant with id=' + id,
      });
    });
};

// Update a Tenant by the id in the request
exports.update = (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'Unauthorized request' });
  }
  if (!req.body) {
    return res.status(400).send({
      message: 'Data to update can not be empty!',
    });
  }

  const id = req.params.id;

  Tenant.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
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

// close
exports.close = (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'Unauthorized request' });
  }
  const id = req.params.id;
  Tenant.findByIdAndUpdate(req.params.id, { status: 'closed' }, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update Tenant with id=${id}. Maybe Tenant was not found!`,
        });
      } else res.status(200).send({ message: 'Ticked was closed !' });
    })
    .catch((err) => {
      res.status(500).send({
        message: 'Error updating Tenant with id=' + id,
      });
    });
};

// Delete a Tenant with the specified id in the request
exports.delete = async (req, res) => {
  let id;
  try {
    if (!req.headers.authorization) {
      return res.status(401).send({ message: 'Unauthorized request' });
    }
    id = req.params.id;
    const { email, property, name, tenantId } = req.body;

    // Find the tenant document by ID and remove it
    const deletedTenant = await Tenant.findByIdAndRemove(id, { useFindAndModify: false });

    if (!deletedTenant) {
      return res.status(404).send({
        message: `Cannot delete Tenant with id=${id}. Maybe Tenant was not found!`,
      });
    }

    // Retrieve the property document associated with the deleted tenant
    const propertyData = await findById(property.id);

    console.log(propertyData, 'propertyData');

    console.log(id, 'id');
    // Find the index of the tenant in the property's tenant list
    const propertyTenantIndex = propertyData.tenant.findIndex((propertyTenant) => propertyTenant.tenantId === tenantId);
    console.log(propertyTenantIndex, 'propertyTenantIndex');

    if (propertyTenantIndex === -1) {
      return res.status(404).send({
        message: `Tenant with the provided id=${tenantId} does not exist under this landlord's property `,
      });
    }

    const propertyTenant = propertyData.tenant[propertyTenantIndex];

    if (propertyTenant) {
      // Remove the tenant from the property's tenant list
      propertyData.tenant.splice(propertyTenantIndex, 1);

      // Save the updated property document
      await propertyData.save();

      res.send({
        message: 'Tenant was deleted successfully!',
      });
      sendEndAgreementEmail(email, property, name);
    } else {
      res.status(400).send({
        message: 'Cannot delete active tenant. Please deactivate the tenant first.',
      });
    }
  } catch (error) {
    console.error('Error deleting tenant:', error);
    res.status(500).send({
      message: 'Could not delete Tenant with id=' + id,
    });
  }
};

// Delete all  from the database.
exports.deleteAll = (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'Unauthorized request' });
  }
  Tenant.deleteMany({})
    .then((data) => {
      res.send({
        message: `${data.deletedCount}  were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || 'Some error occurred while removing all .',
      });
    });
};

exports.count = (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'Unauthorized request' });
  }
  Tenant.countDocuments()
    .then((data) => {
      res.status(200).json({ totalTasks: data });
    })
    .catch((err) => {
      res.status(500).json({
        message: err.message || 'Some error occurred while retrieving.',
      });
    });
};

exports.inviteTenant = async (req, res) => {
  const { propertyId, email, propertyName } = req.body;

  if (propertyId && email) {
    await sendTenantInvite(propertyId, email, propertyName);
    res.status(200).json({ message: 'Tenant invited successfully' });
  } else {
    res.status(400).json({ message: 'Missing propertyId or email in request' });
  }
};

export const sendTenantInvite = async (propertyId, email, propertyName) => {
  return await sendEmail(email, `Invitation to Join ${propertyName} as a Tenant`, inviteTenantLinkTemplate(propertyId));
};

const sendEndAgreementEmail = async (email, property, name) => {
  const subject = `Tenancy agreement has ended`;
  return await sendEmail(email, subject, sendEndAgreementTemaplate(property, name));
};

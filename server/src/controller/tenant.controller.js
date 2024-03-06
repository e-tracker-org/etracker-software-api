const db = require("../models");
const { PropertyStatus } = require("../modules/property/property.model");
const Tenant = db.tenant;
const User = db.user;

// Create and Save a new Tenant
exports.create = (req, res) => {
//   if(!req.headers.authorization) {
//     return res.status(401).send({ message: "Unauthorized request" });
//   }
  // Validate request
  if (!req.body) {
    res.status(400).send({ message: "Content can not be empty!" });
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
    .then(data => {
      console.log('data', data)
      res.status(200).send(data);
    })
    .catch(err => {
      console.log('err', err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Tenant."
      });
    });
};

exports.create = (req, res) => {
//   if(!req.headers.authorization) {
//     return res.status(401).send({ message: "Unauthorized request" });
//   }
  // Validate request
  if (!req.body) {
    res.status(400).send({ message: "Content can not be empty!" });
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
    .then(data => {
      console.log('data', data)
      res.status(200).send(data);
    })
    .catch(err => {
      console.log('err', err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Tenant."
      });
    });
};

// Retrieve all Tenant from the database.
exports.findAll = (req, res) => {
    if (!req.headers.authorization) {
      return res.status(401).send({ message: "Unauthorized request" });
    }
  
    Tenant.find()
      .then(tenantData => {
        const userIds = tenantData.map(tenant => tenant.userId);
  
        return User.find({ userId: { $in: userIds } })
          .then(userData => {
            const combinedData = tenantData.map(tenant => {
              const user = userData.find(u => u.id === tenant.userId);

              return {
                tenantData: tenant,
                userData: user
              };
            });
  
            const sortedData = combinedData.sort((a, b) => {
              return new Date(b.userData.createdAt) - new Date(a.userData.createdAt);
            });
  
            res.status(200).send(sortedData);
          });
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving data."
        });
      });
  };
  

// property tenants
exports.propertyTenant = (req, res) => {
  if(!req.headers.authorization) {
    return res.status(401).send({ message: "Unauthorized request" });
  }
    Tenant.find({ propertyId: req.params.propertyId })
    .then(tenantData => {
        const userIds = tenantData.map(tenant => tenant.userId);
  
        return User.find({ userId: { $in: userIds } })
          .then(userData => {
            const combinedData = tenantData.map(tenant => {
              const user = userData.find(u => u.id === tenant.userId);

              return {
                tenantData: tenant,
                userData: user
              };
            });
  
            const sortedData = combinedData.sort((a, b) => {
              return new Date(b.userData.createdAt) - new Date(a.userData.createdAt);
            });
  
            res.status(200).send(sortedData);
          });
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving data."
        });
      });
};

// Landord tenants
exports.landlordTenant = (req, res) => {
    if(!req.headers.authorization) {
      return res.status(401).send({ message: "Unauthorized request" });
    }

      Tenant.find({ landlordId: req.params.landlordId })
      .then(tenantData => {
        console.log("Fetched Data:", tenantData);

        if (tenantData.length === 0) {
            return res.status(404).send({ message: "No data found for the specified landlordId" });
          }
          const userIds = tenantData.map(tenant => tenant.userId);
    
          return User.find({ userId: { $in: userIds } })
            .then(userData => {
              const combinedData = tenantData.map(tenant => {
                const user = userData.find(u => u.id === tenant.userId);
  
                return {
                  tenantData: tenant,
                  userData: user
                };
              });
    
              const sortedData = combinedData.sort((a, b) => {
                return new Date(b.userData.createdAt) - new Date(a.userData.createdAt);
              });
    
              res.status(200).send(sortedData);
            });
        })
        .catch(err => {
          res.status(200).send({
            message:
              err.message || "Some error occurred while retrieving data."
          });
        });
  };

// Find a single Tenant with an id
exports.findOne = (req, res) => {
  if(!req.headers.authorization) {
    return res.status(401).send({ message: "Unauthorized request" });
  }
  const id = req.params.id;

  Tenant.findOne(id)
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Not found Tenant with id " + id });
      else res.status(200).send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Error retrieving Tenant with id=" + id });
    });
};


// complete tenant
exports.completed = (req, res) => {
  if(!req.headers.authorization) {
    return res.status(401).send({ message: "Unauthorized request" });
  }
    const id = req.params.id;
    Tenant.findByIdAndUpdate(id, { status: PropertyStatus.COMPLETE }, { useFindAndModify: false })
      .then(data => {
          if (!data) {
              res.status(404).send({
                  message: `Cannot update Tenant with id=${id}. Maybe Tenant was not found!`
              });
          } else res.status(200).send({ message: "Tenant was updated successfully." });
      })
      .catch(err => {
          res.status(500).send({
              message: "Error updating Tenant with id=" + id
          });
      });
  };
  
  // incomplete tenant
  exports.pending = (req, res) => {
    if(!req.headers.authorization) {
      return res.status(401).send({ message: "Unauthorized request" });
    }
    const id = req.params.id;
    Tenant.findByIdAndUpdate(req.params.id,{ status: PropertyStatus.INCOMPLETE }, { useFindAndModify: false })
    .then(data => {
        if (!data) {
            res.status(404).send({
                message: `Cannot update Tenant with id=${id}. Maybe Tenant was not found!`
            });
        } else res.status(200).send({ message: "Tenant was updated successfully." });
    })
    .catch(err => {
        res.status(500).send({
            message: "Error updating Tenant with id=" + id
        });
    });
  };

// Update a Tenant by the id in the request
exports.update = (req, res) => {
  if(!req.headers.authorization) {
    return res.status(401).send({ message: "Unauthorized request" });
  }
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const id = req.params.id;

  Tenant.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update Tenant with id=${id}. Maybe Tenant was not found!`
        });
      } else res.send({ message: "Tenant was updated successfully." });
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Tenant with id=" + id
      });
    });
};

  
  // close
  exports.close = (req, res) => {
    if(!req.headers.authorization) {
      return res.status(401).send({ message: "Unauthorized request" });
    }
    const id = req.params.id;
    Tenant.findByIdAndUpdate(req.params.id,{ status: 'closed' }, { useFindAndModify: false })
    .then(data => {
        if (!data) {
            res.status(404).send({
                message: `Cannot update Tenant with id=${id}. Maybe Tenant was not found!`
            });
        } else res.status(200).send({ message: "Ticked was closed !" });
    })
    .catch(err => {
        res.status(500).send({
            message: "Error updating Tenant with id=" + id
        });
    });
  };

// Delete a Tenant with the specified id in the request
exports.delete = (req, res) => {
  if(!req.headers.authorization) {
    return res.status(401).send({ message: "Unauthorized request" });
  }
  const id = req.params.id;

  Tenant.findByIdAndRemove(id, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete Tenant with id=${id}. Maybe Tenant was not found!`
        });
      } else {
        res.send({
          message: "Tenant was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Tenant with id=" + id
      });
    });
};

// Delete all  from the database.
exports.deleteAll = (req, res) => {
  if(!req.headers.authorization) {
    return res.status(401).send({ message: "Unauthorized request" });
  }
  Tenant.deleteMany({})
    .then(data => {
      res.send({
        message: `${data.deletedCount}  were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all ."
      });
    });
};

exports.count = (req, res) => {
  if(!req.headers.authorization) {
    return res.status(401).send({ message: "Unauthorized request" });
  }
  Tenant.countDocuments()
  .then(data => {
    res.status(200).json({ totalTasks: data });
  })
  .catch(err => {
    res.status(500).json({
      message:
        err.message || "Some error occurred while retrieving."
    });
  });
}
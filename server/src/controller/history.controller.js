const db = require('../models');

const History = db.history;
// import { findById as findPropertyById } from '../modules/property/property.service';

// async function getProperty(propertyId) {
//   if (!isValid(propertyId)) throw 'Invalid Property ID';
//   const property = await findPropertyById(propertyId);
//   if (!property) throw 'Property not found';
//   return property;
// }

// Create and save a new History entry
exports.createHistory = async (req, res) => {
  try {
    // Validate request
    // if (!req.body.userId || !req.body.tenantEmail || !req.body.status) {
    //   return res.status(400).send({ message: 'Required fields cannot be empty!' });
    // }

    // Check if history entry already exists for the tenant email
    // const property = await getProperty(propertyId);

    const existingHistory = await History.findOne({ tenantEmail: req.body.tenantEmail });
    if (existingHistory) {
      // Check if landlordId and propertyId are not already included in the arrays
      const isNewLandlord = !existingHistory.landlordId.includes(req.body.landlordId);
      const isNewProperty = !existingHistory.propertyId.includes(req.body.propertyId);

      if (isNewLandlord) {
        existingHistory.landlordId.push(req.body.landlordId);
      }
      if (isNewProperty) {
        existingHistory.propertyId.push(req.body.propertyId);
      }

      // Save the updated history entry
      const updatedHistory = await existingHistory.save();
      return res.status(200).send(updatedHistory);
    } else {
      // Create a new history entry
      const history = new History({
        userId: req.body.userId,
        tenantEmail: req.body.tenantEmail,
        propertyId: [req.body.propertyId],
        landlordId: [req.body.landlordId],
        status: req.body.status,
      });

      // Save the new history entry in the database
      const savedHistory = await history.save();
      return res.status(201).send(savedHistory);
    }
  } catch (error) {
    return res.status(500).send({
      message: error.message || 'Some error occurred while creating the History entry.',
    });
  }
};

// Find a single History entry by tenant email
exports.findOneByEmail = (req, res) => {
  const email = req.params.email;

  History.findOne({ tenantEmail: email })
    .then((data) => {
      if (!data) res.status(404).send({ message: 'History entry not found with email ' + email });
      else res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: 'Error retrieving History entry with email=' + email });
    });
};

// Update a History entry by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: 'Data to update cannot be empty!',
    });
  }

  const id = req.params.id;

  History.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update History entry with id=${id}. Maybe History entry was not found!`,
        });
      } else res.send({ message: 'History entry was updated successfully.' });
    })
    .catch((err) => {
      res.status(500).send({
        message: 'Error updating History entry with id=' + id,
      });
    });
};

// Delete a History entry with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  History.findByIdAndRemove(id)
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete History entry with id=${id}. Maybe History entry was not found!`,
        });
      } else {
        res.send({
          message: 'History entry was deleted successfully!',
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: 'Could not delete History entry with id=' + id,
      });
    });
};

// Delete all History entries from the database
exports.deleteAll = (req, res) => {
  History.deleteMany({})
    .then((data) => {
      res.send({
        message: `${data.deletedCount} History entries were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || 'Some error occurred while removing all History entries.',
      });
    });
};

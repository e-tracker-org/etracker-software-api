const db = require('../models');
const User = db.user;

exports.updateUserAccountType = (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'Unauthorized request' });
  }
  if (!req.body || !req.body.accountType) {
    return res.status(400).send({
      message: 'Invalid data provided for accountType update.',
    });
  }

  const id = req.params.id;
  const accountTypeToAdd = req.body.accountType;

  // Check if the accountType already exists in the user's accountTypes array
  User.findById(id)
    .then((user) => {
      if (!user) {
        return res.status(404).send({
          message: `Cannot update User with id=${id}. User not found!`,
        });
      }

      const { accountTypes } = user;

      // Check if the accountTypeToAdd is already present in the array
      if (!accountTypes.includes(accountTypeToAdd)) {
        // Update the user's accountTypes array only if the accountTypeToAdd is not present
        User.findByIdAndUpdate(id, { $push: { accountTypes: accountTypeToAdd } }, { new: true })
          .then((updatedUser) => {
            res.send({ message: 'User was updated successfully.', updatedUser });
          })
          .catch((err) => {
            res.status(500).send({
              message: 'Error updating User with id=' + id,
            });
          });
      } else {
        // Account type already exists, no need to update
        res.send({ message: 'Account type already exists for this user.' });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: 'Error finding User with id=' + id,
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

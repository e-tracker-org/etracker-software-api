const db = require('../models');

const VerificationRequest = require('../models/VerificationRequest');

const TenantDefault = db.tenantDefault;

exports.getAllVerificationRequests = async (req, res) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).send({ message: 'Unauthorized request' });
    }

    const requests = await VerificationRequest.find({ status: 'paid' });
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).send({ message: 'Error retrieving verification requests' });
  }
};

exports.getAllDefaultTenants = async (req, res) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).send({ message: 'Unauthorized request' });
    }

    const tenants = await TenantDefault.find({ status: 'SUBMITTED' });
    res.status(200).json(tenants);
  } catch (err) {
    res.status(500).send({ message: 'Error retrieving default tenants' });
  }
};

exports.approveRequest = async (req, res) => {
  try {
    const { id, type } = req.params;
    
    if (type === 'verification') {
      const request = await VerificationRequest.findByIdAndUpdate(
        id,
        { status: 'approved', updatedAt: Date.now() },
        { new: true }
      );
      if (!request) {
        return res.status(404).send({ message: 'Verification request not found' });
      }
    } else if (type === 'tenant') {
      const tenant = await TenantDefault.findByIdAndUpdate(
        id,
        { status: 'approved', updatedAt: Date.now() },
        { new: true }
      );
      if (!tenant) {
        return res.status(404).send({ message: 'Default tenant not found' });
      }
    }

    res.status(200).send({ message: 'Request approved successfully' });
  } catch (err) {
    res.status(500).send({ message: 'Error approving request' });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const { id, type } = req.params;
    
    if (type === 'verification') {
      const request = await VerificationRequest.findByIdAndUpdate(
        id,
        { status: 'rejected', updatedAt: Date.now() },
        { new: true }
      );
      if (!request) {
        return res.status(404).send({ message: 'Verification request not found' });
      }
    } else if (type === 'tenant') {
      const tenant = await TenantDefault.findByIdAndUpdate(
        id,
        { status: 'rejected', updatedAt: Date.now() },
        { new: true }
      );
      if (!tenant) {
        return res.status(404).send({ message: 'Default tenant not found' });
      }
    }

    res.status(200).send({ message: 'Request rejected successfully' });
  } catch (err) {
    res.status(500).send({ message: 'Error rejecting request' });
  }
};
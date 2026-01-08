import express from 'express';
import { runPropertyTypeMigration, getMigrationStatus } from './migration.controller';
import { authorize } from '../../middleware/authorize';

const router = express.Router();

// Admin only migration endpoints
router.get('/status', authorize(['ADMIN']), getMigrationStatus);
router.post('/property-types', authorize(['ADMIN']), runPropertyTypeMigration);

export default router;
import express from 'express';
import {
  getApplications,
  createApplication,
  updateApplicationStatus,
  updateApplicationDetails,
  deleteApplication,
} from '../controllers/tracker.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All tracker routes are protected
router.use(protect);

router.get('/', getApplications);
router.post('/', createApplication);
router.patch('/:id/status', updateApplicationStatus);
router.put('/:id', updateApplicationDetails);
router.delete('/:id', deleteApplication);

export default router;

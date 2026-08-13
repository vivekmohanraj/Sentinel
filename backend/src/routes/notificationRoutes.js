import express from 'express';
import {
  listNotifications,
  readNotification,
  readAllNotifications
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', listNotifications);
router.put('/read-all', readAllNotifications);
router.put('/:id/read', readNotification);

export default router;

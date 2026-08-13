import express from 'express';
import {
  getProfile,
  getUserDetails,
  updateProfile,
  getAllUsersList,
  adminUpdateUserRole,
  adminCreateUser,
  adminToggleDisable,
  adminDeleteUser
} from '../controllers/userController.js';
import { getUserByEmail, ADMIN_EMAIL } from '../models/userModel.js';
import { auth } from '../auth.js';

const router = express.Router();

// Middleware to enforce Admin-only access
const requireAdmin = async (req, res, next) => {
  try {
    let email = req.query.email || req.body.adminEmail;

    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (session?.user?.email) {
        email = session.user.email;
      }
    } catch (err) {
      // Non-fatal
    }

    if (!email) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      return next();
    }

    const user = await getUserByEmail(email);
    if (!user || user.role !== 'Admin') {
      return res.status(403).json({ success: false, error: 'Access denied. Administrator privileges required.' });
    }

    next();
  } catch (err) {
    next(err);
  }
};

// Middleware to enforce Admin or Manager access
const requireAdminOrManager = async (req, res, next) => {
  try {
    let email = req.query.email || req.body.requesterEmail;

    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (session?.user?.email) {
        email = session.user.email;
      }
    } catch (err) {
      // Non-fatal
    }

    if (!email) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      return next();
    }

    const user = await getUserByEmail(email);
    if (!user || (user.role !== 'Admin' && user.role !== 'Engineering Manager (Project owner)')) {
      return res.status(403).json({ success: false, error: 'Access denied. Admin or Engineering Manager privileges required.' });
    }

    next();
  } catch (err) {
    next(err);
  }
};

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/details/:id', requireAdminOrManager, getUserDetails);

// Admin-only endpoints
router.get('/all', requireAdmin, getAllUsersList);
router.put('/role', requireAdmin, adminUpdateUserRole);
router.post('/create', requireAdmin, adminCreateUser);
router.put('/disable', requireAdmin, adminToggleDisable);
router.delete('/:id', requireAdmin, adminDeleteUser);

export default router;

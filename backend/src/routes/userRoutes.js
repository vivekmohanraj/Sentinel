import express from 'express';
import {
  getProfile,
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

    // Check Better Auth session headers/cookies
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

    // Check if requesting user is super admin email or Admin role in DB
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

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Admin-only endpoints
router.get('/all', requireAdmin, getAllUsersList);
router.put('/role', requireAdmin, adminUpdateUserRole);
router.post('/create', requireAdmin, adminCreateUser);
router.put('/disable', requireAdmin, adminToggleDisable);
router.delete('/:id', requireAdmin, adminDeleteUser);

export default router;

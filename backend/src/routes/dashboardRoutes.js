import express from 'express';
import {
  getSummary,
  getRepos,
  addRepo,
  removeRepo,
  getSystemTelemetry,
  exportReportData
} from '../controllers/dashboardController.js';
import { getUserByEmail, ADMIN_EMAIL } from '../models/userModel.js';
import { auth } from '../auth.js';

const router = express.Router();

// Admin-only middleware check for telemetry
const requireAdmin = async (req, res, next) => {
  try {
    let email = req.query.email || req.body.adminEmail;

    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (session?.user?.email) email = session.user.email;
    } catch (err) {}

    if (!email) return res.status(401).json({ success: false, error: 'Authentication required.' });

    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) return next();

    const user = await getUserByEmail(email);
    if (!user || user.role !== 'Admin') {
      return res.status(403).json({ success: false, error: 'Access denied. Administrator privileges required.' });
    }

    next();
  } catch (err) {
    next(err);
  }
};

router.get('/summary', getSummary);
router.get('/repositories', getRepos);
router.post('/repositories', addRepo);
router.delete('/repositories/:id', removeRepo);
router.get('/telemetry', requireAdmin, getSystemTelemetry);
router.get('/export', exportReportData);

export default router;

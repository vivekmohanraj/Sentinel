import { getUserById, getUserByEmail, getLatestUser, updateUserProfile } from '../models/userModel.js';
import { auth } from '../auth.js';

export const getProfile = async (req, res, next) => {
  try {
    let email = req.query.email;
    let userId = req.query.userId;

    // Try extracting Better Auth session from headers/cookies
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (session?.user) {
        email = session.user.email || email;
        userId = session.user.id || userId;
      }
    } catch (err) {
      // Non-fatal if session evaluation is bypassed
    }

    let user = null;

    if (email) {
      user = await getUserByEmail(email);
    } else if (userId) {
      user = await getUserById(userId);
    } else {
      // If no session email is specified, grab latest created user
      user = await getLatestUser();
    }

    if (!user) {
      return res.status(200).json({
        success: true,
        data: {
          id: 'demo-user-id',
          firstName: email ? email.split('@')[0] : 'User',
          lastName: '',
          name: email ? email.split('@')[0] : 'User',
          email: email || 'user@sentinel.engineering',
          phone: '',
          role: 'Engineering Manager (Project owner)',
          weeklyReports: true,
          githubSync: true
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, role, weeklyReports, githubSync } = req.body;
    let targetEmail = email || req.query.email;

    // Try extracting Better Auth session from headers/cookies
    try {
      const session = await auth.api.getSession({ headers: req.headers });
      if (session?.user?.email) {
        targetEmail = session.user.email;
      }
    } catch (err) {
      // Non-fatal
    }

    if (!targetEmail) {
      return res.status(400).json({ success: false, error: 'Target account email is required.' });
    }

    const updated = await updateUserProfile(targetEmail, {
      firstName,
      lastName,
      email: targetEmail,
      phone,
      role,
      weeklyReports,
      githubSync
    });

    return res.status(200).json({
      success: true,
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

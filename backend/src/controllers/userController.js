import { getUserById, getFirstUser, updateUserProfile } from '../models/userModel.js';

export const getProfile = async (req, res, next) => {
  try {
    // If authenticated via Better Auth session
    const userId = req.user?.id || req.session?.userId;
    let user = null;

    if (userId) {
      user = await getUserById(userId);
    } else {
      user = await getFirstUser();
    }

    if (!user) {
      // Fallback default user if no records exist yet
      return res.status(200).json({
        success: true,
        data: {
          id: 'demo-user-id',
          firstName: 'Sarah',
          lastName: 'Vanderbilt',
          name: 'Sarah Vanderbilt',
          email: 'sarah.dev@sentinel.engineering',
          phone: '+1 (555) 234-8901',
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

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required.' });
    }

    const userId = req.user?.id || req.session?.userId;
    let targetUserId = userId;

    if (!targetUserId) {
      const firstUser = await getFirstUser();
      if (firstUser) {
        targetUserId = firstUser.id;
      }
    }

    if (!targetUserId) {
      // Return updated profile payload directly if no DB user is initialized
      return res.status(200).json({
        success: true,
        data: {
          id: 'demo-user-id',
          firstName: firstName || 'Sarah',
          lastName: lastName || 'Dev',
          name: `${firstName || 'Sarah'} ${lastName || 'Dev'}`,
          email,
          phone: phone || '',
          role: role || 'Engineering Manager (Project owner)',
          weeklyReports: weeklyReports !== false,
          githubSync: githubSync !== false
        }
      });
    }

    const updated = await updateUserProfile(targetUserId, {
      firstName,
      lastName,
      email,
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

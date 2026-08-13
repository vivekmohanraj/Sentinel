import {
  getUserById,
  getUserByEmail,
  getLatestUser,
  updateUserProfile,
  getAllUsers,
  getUserDetailedProfile,
  updateUserRoleByAdmin,
  createUserByAdmin,
  toggleUserDisableByAdmin,
  deleteUserByAdmin,
  ADMIN_EMAIL
} from '../models/userModel.js';
import { auth } from '../auth.js';

export const getProfile = async (req, res, next) => {
  try {
    let email = req.query.email;
    let userId = req.query.userId;

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
      user = await getLatestUser();
    }

    // Automatically upsert real user account in PostgreSQL if not found
    if (!user && (email || userId)) {
      const targetEmail = email || 'user@sentinel.engineering';
      const namePart = targetEmail.split('@')[0];
      user = await updateUserProfile(targetEmail, {
        firstName: namePart,
        lastName: '',
        email: targetEmail
      });
    }

    if (!user) {
      user = await getLatestUser();
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

export const getUserDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: 'User ID parameter is required.' });
    }

    const details = await getUserDetailedProfile(id);
    if (!details) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      data: details
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, role, weeklyReports, githubSync } = req.body;
    let targetEmail = email || req.query.email;

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

export const getAllUsersList = async (req, res, next) => {
  try {
    const users = await getAllUsers();
    return res.status(200).json({
      success: true,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

export const adminUpdateUserRole = async (req, res, next) => {
  try {
    const { userId, role } = req.body;
    if (!userId || !role) {
      return res.status(400).json({ success: false, error: 'userId and role are required parameters.' });
    }

    const updated = await updateUserRoleByAdmin(userId, role);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

export const adminCreateUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required fields.' });
    }

    const created = await createUserByAdmin({ name, email, password, role });
    return res.status(201).json({
      success: true,
      data: created
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message || 'Failed to create user account.'
    });
  }
};

export const adminToggleDisable = async (req, res, next) => {
  try {
    const { userId, isDisabled } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId parameter is required.' });
    }

    const updated = await toggleUserDisableByAdmin(userId, isDisabled);
    return res.status(200).json({
      success: true,
      data: updated
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message || 'Failed to update user account status.'
    });
  }
};

export const adminDeleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: 'User ID is required.' });
    }

    await deleteUserByAdmin(id);
    return res.status(200).json({
      success: true,
      message: 'User deleted successfully.'
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message || 'Failed to delete user account.'
    });
  }
};

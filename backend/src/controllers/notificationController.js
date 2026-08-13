import {
  getNotificationsByUser,
  markAsRead,
  markAllAsRead
} from '../models/notificationModel.js';

export const listNotifications = async (req, res, next) => {
  try {
    const { email } = req.query;
    const notifications = await getNotificationsByUser(email);
    return res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (err) {
    next(err);
  }
};

export const readNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await markAsRead(id);
    return res.status(200).json({
      success: true,
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

export const readAllNotifications = async (req, res, next) => {
  try {
    const { email } = req.body;
    await markAllAsRead(email);
    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (err) {
    next(err);
  }
};

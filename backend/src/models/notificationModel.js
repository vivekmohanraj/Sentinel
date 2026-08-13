import pool from '../config/db.js';

export const getNotificationsByUser = async (email) => {
  let query = `
    SELECT n.id, n.type, n.title, n.message, n.is_read, n.created_at
    FROM tbl_notification n
  `;
  const params = [];

  if (email) {
    query += ` LEFT JOIN tbl_user u ON n.user_id = u.id WHERE u.email IS NULL OR LOWER(u.email) = LOWER($1)`;
    params.push(email);
  }

  query += ` ORDER BY n.created_at DESC LIMIT 50`;

  const result = await pool.query(query, params);
  return result.rows;
};

export const markAsRead = async (id) => {
  const result = await pool.query(
    `UPDATE tbl_notification SET is_read = true WHERE id = $1 RETURNING id, is_read`,
    [id]
  );
  return result.rows[0];
};

export const markAllAsRead = async (email) => {
  if (email) {
    await pool.query(
      `UPDATE tbl_notification n
       SET is_read = true
       FROM tbl_user u
       WHERE (n.user_id = u.id AND LOWER(u.email) = LOWER($1)) OR n.user_id IS NULL`,
      [email]
    );
  } else {
    await pool.query(`UPDATE tbl_notification SET is_read = true`);
  }
  return true;
};

export const createNotification = async ({ email, type = 'INFO', title, message }) => {
  let userId = null;
  if (email) {
    const userRes = await pool.query(`SELECT id FROM tbl_user WHERE LOWER(email) = LOWER($1)`, [email]);
    if (userRes.rows.length > 0) userId = userRes.rows[0].id;
  }

  const result = await pool.query(
    `INSERT INTO tbl_notification (user_id, type, title, message, is_read)
     VALUES ($1, $2, $3, $4, false)
     RETURNING id, type, title, message, is_read, created_at`,
    [userId, type, title, message]
  );
  return result.rows[0];
};

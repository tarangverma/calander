const nodemailer = require('nodemailer');
const cron = require('node-cron');
const pool = require('../config/db');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const reminderService = {
  init: () => {
    // Check for reminders every minute
    cron.schedule('* * * * *', async () => {
      try {
        const currentTime = new Date();
        const result = await pool.query(`
          SELECT e.*, u.email 
          FROM events e
          JOIN users u ON e.user_id = u.id
          WHERE e.reminder_time <= $1 
          AND e.reminder_time > $2
          AND e.reminder_sent = false
        `, [currentTime, new Date(currentTime - 60000)]);

        for (const event of result.rows) {
          await reminderService.sendReminder(event);
        }
      } catch (error) {
        console.error('Error processing reminders:', error);
      }
    });
  },

  sendReminder: async (event) => {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: event.email,
        subject: `Reminder: ${event.title}`,
        html: `
          <h2>Event Reminder</h2>
          <p>Your event "${event.title}" is starting soon!</p>
          <p><strong>Start Time:</strong> ${new Date(event.start_time).toLocaleString()}</p>
          <p><strong>Description:</strong> ${event.description || 'No description provided'}</p>
        `,
      });

      await pool.query(
        'UPDATE events SET reminder_sent = true WHERE id = $1',
        [event.id]
      );

      console.log(`Reminder sent for event: ${event.id}`);
    } catch (error) {
      console.error(`Failed to send reminder for event ${event.id}:`, error);
    }
  },
};

module.exports = reminderService;

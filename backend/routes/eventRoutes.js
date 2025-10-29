const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth');
const { validateEvent } = require('../middleware/validation');

router.use(auth); // Protect all routes

router.post('/', validateEvent, eventController.createEvent);
router.post('/:eventId/send-invites', eventController.sendEmailInvites);
router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEvent);
router.put('/:id', validateEvent, eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);

module.exports = router;

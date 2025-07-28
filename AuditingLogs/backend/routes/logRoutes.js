const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');

router.post('/', logController.createLog);
router.get('/', logController.getAllLogs);
router.get('/:userId', logController.getLogsByUserId);

module.exports = router;

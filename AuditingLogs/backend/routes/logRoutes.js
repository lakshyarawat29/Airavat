const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');

router.post('/', logController.createLog);
router.get('/', logController.getAllLogs);
router.get('/:userId', logController.getLogsByUserId);
router.post('/refresh-cache', logController.refreshCache);

module.exports = router;

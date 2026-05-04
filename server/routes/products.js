const express = require('express');
const router = express.Router();
const {
  getAll,
  getById,
  create,
  update,
  partialUpdate,
  remove,
} = require('../controllers/productsController');

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.patch('/:id', partialUpdate);
router.delete('/:id', remove);

module.exports = router;

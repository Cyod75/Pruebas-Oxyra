const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/nutritionController');
const auth    = require('../middlewares/authMiddleware');

//  Objetivos nutricionales 
router.get ('/goals',         auth, ctrl.getGoals);
router.put ('/goals',         auth, ctrl.upsertGoals);

//  Ingestas del día
router.get ('/today',         auth, ctrl.getToday);
router.post('/log',           auth, ctrl.addEntry);
router.delete('/log/:id',     auth, ctrl.deleteEntry);

//  Hidratación
router.post  ('/water',       auth, ctrl.addWater);
router.delete('/water',       auth, ctrl.removeWater);

//  Historial
router.get ('/history',       auth, ctrl.getHistory);

//  Alimentos personalizados
router.get   ('/custom-foods',     auth, ctrl.getCustomFoods);
router.post  ('/custom-foods',     auth, ctrl.createCustomFood);
router.delete('/custom-foods/:id', auth, ctrl.deleteCustomFood);

//  OpenFoodFacts Proxy (Sin auth para acceso rápido del frontend) 
router.get ('/off/search', ctrl.proxyOpenFoodFacts);
router.get ('/off/barcode/:code', ctrl.proxyOpenFoodFactsBarcode);

module.exports = router;

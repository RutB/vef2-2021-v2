const xss = require('xss');
const express = require('express');
const { check, validationResult } = require('express-validator/check');
const { sanitize } = require('express-validator/filter');

const { catchErrors } = require('./utils');
const { saveToDb } = require('./db');

const router = express.Router();

const formValidation = [
  check('name')
    .isLength({ min: 1 })
    .withMessage('Nafn má ekki vera tómt'),

  check('email')
    .isLength({ min: 1 })
    .withMessage('Netfang má ekki vera tómt'),

  check('email')
    .isEmail()
    .withMessage('Netfang verður að vera netfang'),

  check('ssn')
    .isLength({ min: 1 }).withMessage('Kennitala má ekki vera tóm'),
  check('ssn')
    .matches(/^[0-9]{6}-?[0-9]{4}$/).withMessage('Kennitala verður að vera á formi 000000-0000'),

  check('amount').isInt({ gt: 0 }).withMessage('Fjöldi verður að vera tala, stærri en 0'),

  sanitize('name').trim(),
];

function form(req, res) {
  const data = {};
  res.render('form', { data, title: 'Form' });
}

async function formPost(req, res) {
  // fá öll gögn úr formi
  const {
    body: {
      name = '',
      email = '',
      ssn = '',
      amount = 0,
    } = {},
  } = req;

  // öll gögn hreinsuð úr formi
  const data = {
    name: xss(name),
    email: xss(email),
    ssn: xss(ssn),
    amount: xss(amount),
  };

  const validation = validationResult(req);

  if (!validation.isEmpty()) {
    const errors = validation.array();
    return res.render('form', { errors, data, title: 'Form' });
  }

  await saveToDb(data);

  return res.redirect('/thanks');
}

function thanks(req, res) {
  return res.render('thanks', { title: 'Takk fyrir' });
}

router.get('/', form);
router.post('/', formValidation, catchErrors(formPost));
router.get('/thanks', thanks);

module.exports = router;
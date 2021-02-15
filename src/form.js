// import express from 'express';
// import { query } from './db.js';  //bæta við savetoDB og select eins og vav
// import { saveToDB, fetchData } from './db.js';
// import xss from 'xss';
// import { body, validationResult } from 'express-validator';

// //í post
// //connst { data } = req.body;
// //await insertSafe(data)
// export const router = express.Router();
// const nationalIdPattern = '^[0-9]{6}-?[0-9]{4}$';
// let result ='';
// function catchErrors(fn) {
//   return (req, res, next) => fn(req, res, next).catch(next);
// }

// async function form(req, res){
//     result = await fetchData();

//     const data = {
//         result,
//         name: '',
//         comment: '',
//         nationalId: '',
//         nationalIdPattern,
//         anonymous: false,
//         errors: []
//     }

//     res.render('index', { title : 'Listinn', data });
// }

// const validations = [
//     body('name')
//       .isLength({ min: 1 })
//       .withMessage('Nafn má ekki vera tómt'),
//     body('nationalId')
//       .isLength({ min: 1 })
//       .withMessage('Kennitala má ekki vera tóm'),
//     body('nationalId')
//       .matches(new RegExp(nationalIdPattern))
//       .withMessage('Kennitala verður að vera á formi 000000-0000 eða 0000000000'),
//     body('comment')
//       .isLength({ max: 400 })
//       .withMessage('Athugasemd má að hámarki vera 400 stafir'),
//   ];

// const sanitize = [
//     /* Nú sanitizeum við gögnin, þessar aðgerðir munu breyta gildum í body.req */
//     // Fjarlægja whitespace frá byrjun og enda
//     // „Escape“ á gögn, breytir stöfum sem hafa merkingu í t.d. HTML í entity
//     // t.d. < í &lt;
//     body('name').trim().escape(),
//     body('comment').trim().escape(),

//     // Fjarlægjum - úr kennitölu, þó svo við leyfum í innslátt þá viljum við geyma
//     // á normalizeruðu formi (þ.e.a.s. allar geymdar sem 10 tölustafir)
//     // Hér gætum við viljað breyta kennitölu í heiltölu (int) en... það myndi
//     // skemma gögnin okkar, því kennitölur geta byrjað á 0
//     body('nationalId').blacklist('-')
// ];

// async function seeErrors(req, res, next) {
//     const {
//       name = '',
//       comment = '',
//       nationalId = '',
//       anonymous =' '
//     } = req.body;

//     const data = {
//         result,
//         name,
//         comment,
//         nationalId,
//         nationalIdPattern,
//         anonymous
//     }

//     const errors = validationResult(req);

//     console.log("bunny2");
//     if (!errors.isEmpty()) {
//       const errorMessages = errors.array().map(i => i.msg);

//       data.errors = errorMessages
//       return res.render('index', { title : 'Listinn', data });
//     }

//     return next();
// }

// async function formPost(req, res){
//     const {
//         name,
//         comment,
//         nationalId,
//         anonymous,
//     } = req.body;

//     console.log('hvað er anonymous? ', anonymous);

//     if(anonymous === undefined){
//         await saveToDB({ name, comment, nationalId, anonymous: false});
//         console.log("vistast án anon");
//     } else {
//         await saveToDB({ name, comment, nationalId, anonymous});
//         console.log("vistast þetta?");
//     }

//     return res.redirect('/');
// }


// router.get('/', catchErrors(form));
// router.post('/', validations, seeErrors, sanitize, catchErrors(formPost));



















// // router.get('/', async (req, res) => {
// //     const result = await query("SELECT * FROM signatures;");
// //    // console.log('result: ', result.rows);
// //    console.log('formið er best');
// //     res.render('index', { title : 'Listinn', result });
// // });

// // router.get('/get', (req, res) => {
// //     res.send(`GET gögn: ${req.query.data}`);
// // })

// // router.post('/post', (req, res) => {
// //     console.log('Form skjalið : req body :>>', req.body);
// //     res.send(`POST gögn: ${JSON.stringify(req.body)}`);
// // })




import express from 'express';
import xss from 'xss';
import { body, validationResult } from 'express-validator';
import { saveToDB, fetchData } from './db.js';

export const router = express.Router();

router.use(express.urlencoded({ extended: true }));
let result = '';
const nationalIdPattern = '^[0-9]{6}-?[0-9]{4}$';
function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

async function index(req, res) {
  result = await fetchData();

  const data = {
    result,
    title: 'Undirskriftalisti',
    name: '',
    comment: '',
    nationalId: '',
    anonymous: false,
    errors: [],
  };

  res.render('index', data);
}

const validations = [
  body('name')
    .isLength({ min: 1 })
    .withMessage('Nafn má ekki vera tómt'),
  body('name')
    .isLength({ max: 128 })
    .withMessage('Nafn má ekki vera lengra en 128 stafir'),
  body('nationalId')
    .isLength({ min: 1 })
    .withMessage('Kennitala má ekki vera tóm'),
  body('nationalId')
    .matches(new RegExp(nationalIdPattern))
    .withMessage('Kennitala verður að vera á formi 000000-0000 eða 0000000000'),
  body('athugasemd')
    .isLength({ max: 400 })
    .withMessage('Athugasemd má að hámarki vera 400 stafir'),
];

function sanitizeXss(fieldName) {
  return (req, res, next) => {
    if (!req.body) {
      next();
    }
    const field = req.body[fieldName];
    if (field) {
      req.body[fieldName] = xss(field);
    }
    next();
  };
}

const sanitizations = [
  /* Nú sanitizeum við gögnin, þessar aðgerðir munu breyta gildum í body.req */
  // Fjarlægja whitespace frá byrjun og enda
  // „Escape“ á gögn, breytir stöfum sem hafa merkingu í t.d. HTML í entity
  // t.d. < í &lt;
  body('name').trim().escape(),
  sanitizeXss('name'),
  body('comment').trim().escape(),
  sanitizeXss('comment'),

  // Fjarlægjum - úr kennitölu, þó svo við leyfum í innslátt þá viljum við geyma
  // á normalizeruðu formi (þ.e.a.s. allar geymdar sem 10 tölustafir)
  // Hér gætum við viljað breyta kennitölu í heiltölu (int) en... það myndi
  // skemma gögnin okkar, því kennitölur geta byrjað á 0
  body('nationalId').blacklist('-'),
  sanitizeXss('nationalId'),
];

async function showErrors(req, res, next) {
  const {
    name = '',
    comment = '',
    nationalId = '',
    anonymous = '',
  } = req.body;

  const data = {
    result,
    title: 'Undirskriftalisti',
    name,
    comment,
    nationalId,
    anonymous,
  };

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    data.errors = errors.array();
    return res.render('index', data);
  }

  return next();
}

async function postForm(req, res) {
  const {
    name,
    comment,
    nationalId,
    anonymous,
  } = req.body;

  if (anonymous === undefined) {
    await saveToDB({
      name, comment, nationalId, anonymous: false,
    });
  } else {
    await saveToDB({
      name, comment, nationalId, anonymous,
    });
  }

  return res.redirect('/');
}

router.get('/', catchErrors(index));
router.post('/', validations, showErrors, sanitizations, catchErrors(postForm));

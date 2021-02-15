//  //import path from 'path';
//  import express from 'express';
//  import dotenv from 'dotenv';
//  import { router as r } from './form.js';
//  import { body, validationResult } from 'express-validator';

//  dotenv.config();

//  //const dirname = path.resolve();
//  const app = express();

//  const viewsPath = new URL('./views', import.meta.url).pathname;
//  app.set('./views', viewsPath);
//  app.set('view engine', 'ejs');
//  app.use(express.static('public'));
//  app.use(express.static('src'));
//  app.use(express.urlencoded({exteded:true}));
//  app.use('/', r);

//  const {
//   PORT: port = 3000,
// } = process.env;

// const toNormalDate = (date) =>  `${date.getDate()}.${(date.getMonth() + 1)}.${date.getFullYear()}`;

// app.locals.formatDate = (date) => {
//   return moment(date).format('DD.MM.YYYY');;
// }

// app.locals.isInvalid = (param, errors) => {
//   if (!errors) {
//     return false;
//   }

//   return Boolean(errors.find(i => i.param === param));
// };

// const nationalIdPattern = '^[0-9]{6}-?[0-9]{4}$';
// app.locals.list = [];
// app.locals.normalDate = toNormalDate;

// // app.get('/', (req, res) => {
// //   res.render('index');
// // });

// //app.use(notFoundHandler);
// //app.use(errorHandler);


// // // Verðum að setja bara *port* svo virki á heroku
// // app.listen(port, () => {
// //   console.info(`Server running at http://localhost:${port}/`);
// // });
// const hostname = '127.0.0.1';
// //const port = 3000;

// app.listen(port, hostname, () => {
//   console.info(`Server running at http://${hostname}:${port}/`);
// });
import express from 'express';
import dotenv from 'dotenv';
import { router as r } from './form.js';
import moment from 'moment';

dotenv.config();

const app = express();

const viewsPath = new URL('./views', import.meta.url).pathname;

app.set('./views', viewsPath);
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.static('src'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', r);

app.locals.isInvalid = (param, errors) => {
  if (!errors) {
    return false;
  }
  return Boolean(errors.find(i => i.param === param));
};

 app.locals.formatDate = (date) => {
   return moment(date).format('DD.MM.YYYY');;
}


function notFoundHandler(req, res) {
  res.status(404).render('error', { title: '', titleMessage: '404 Not Found', message: 'Þú virðist hafa villst!' });
}

function errorHandler(err, req, res, next) { // eslint-disable-line
  console.error(err);
  const title = ' ';
  const titleMessage = 'Get ekki skráð á listann!';
  const message = 'Það er búið að skrá þig inn áður?';
  res.status(500).render('error', { title, titleMessage, message });
}

app.use(notFoundHandler);
app.use(errorHandler);

const {
  PORT: port = 3000,
} = process.env;

// Verðum að setja bara *port* svo virki á heroku
app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
/**
 * Sms message analyzer from yandex emulator
 *
 * @author Setest <itman116@gmail.com>
 */

const axios     = require('axios'),
      loggerMod = require('./logger'),
      logger    = loggerMod.getLogger(),
      md5       = require('md5'),
      faker     = require('faker')
;

logger.info('start', true);

let cacheData = new Map();
let counter = matchesCounter = 0;

let finish = function () {
  console.log('Finish');
  logger.info(`Finish, counter: ${counter}`);
}

process.stdin.resume();
process.on('SIGINT', () => {
  finish();
  process.exit(0);
});

const transformRequest = (jsonData = {}) =>
  Object.entries(jsonData)
  .map(x => `${encodeURIComponent(x[0])}=${encodeURIComponent(x[1])}`)
  .join('&');

const getTransaction = function (isRun = true) {
  counter++;
  if ((counter%500) === 0) {
    logger.info(`current counter: ${counter}`);
  }
  let requestData = {
    "receiver": "41001" + faker.random.number({
      'min': 1000000000,
      'precision': 10
    }),
    "sum": faker.random.number({
      'min': 1,
      'max': 1000
    })
  };

  axios('https://funpay.ru/en/yandex/emulator', {
      method: 'post',
      cache: 'no-cache',
      responseType: 'text',
      responseEncoding: 'utf8',
      data: requestData,
      transformRequest: jsonData => transformRequest(jsonData),
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:74.0) Gecko/20100101 Firefox/74.0',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest'
      },

    })
    .then((response, err) => {
      let result = response.data;
      if (response.status === 200 && result && result.length) {
        matchesCounter++;
        let result = response.data;

        let data = result.replace(/(\d(?:,\d)?)*/g, ''); // удаляем цифры
        let dataMd5 = md5(data);
        if (!cacheData.has(dataMd5)) {
          cacheData.set(dataMd5, data);
          logger.info({matchesCounter, result});
        }
      }
      else {
        logger.error('Responce is wrong', response);
      }
    })
    .catch(error => {
      let msg = `[request error] ${error.errno}, ${error.code}`
      console.warn(msg);
      logger.error(msg);
    })
    .then(function () {
      if (!isRun) {
        finish();
      }
      return true;
    });
};

let timerId = setTimeout(function tick() {
  let time = faker.random.number({
    'min': 300,
    'max': 1000,
    'precision': 100,
  })

  let isRun = true; //  = (counter < 10000);
  getTransaction(isRun);
  if (isRun) {
    timerId = setTimeout(tick, time);
  }
}, 0);
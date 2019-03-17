import os from 'os';
import nodemailer from 'nodemailer';
import utility from 'utility';

import config from '../../config/app.config';

const mailConfig = config.mail;
var smtpConfig;
if (mailConfig.auth) {
  // new style
  smtpConfig = mailConfig;
} else {
  smtpConfig = {
    enable: mailConfig.enable,
    // backward compat
    host: mailConfig.host,
    port: mailConfig.port,
    secure: mailConfig.secure || mailConfig.ssl,
    debug: mailConfig.debug,
    auth: {
      user: mailConfig.user,
      pass: mailConfig.pass
    }
  };
}

function create(level) {
  return function (to, subject, html, callback) {
    sendLogMail(to, level, subject, html, callback);
  };
}

export default {
  notice: sendLogMail,
  send: sendMail,
  log: create('log'),
  warn: create('warn'),
  error: create('error'),
}


var transport;

/**
 * Send notice email with mail level and appname.
 *
 * @param {String|Array} to, email or email list.
 * @param {String} level, e.g.: 'log, warn, error'.
 * @param {String} subject
 * @param {String} html
 * @param {Function(err, result)} callback
 */
function sendLogMail(to, level, subject, html, callback) {
  subject = '[' + mailConfig.appname + '] [' + level + '] [' + os.hostname() + '] ' + subject;
  html = String(html);
  send(to, subject, html.replace(/\n/g, '<br/>'), callback);
};

/**
 * Send email.
 * @param {String|Array} to, email or email list.
 * @param {String} subject
 * @param {String} html
 * @param {Function(err, result)} callback
 */
function sendMail(to, subject, html, callback) {
  callback = callback || utility.noop;

  if (mailConfig.enable === false) {
    console.log('[send mail debug] [%s] to: %s, subject: %s\n%s', Date(), to, subject, html);
    return callback();
  }

  if (!transport) {
    transport = nodemailer.createTransport(smtpConfig);
  }

  var message = {
    from: mailConfig.from || mailConfig.sender,
    to: to,
    subject: subject,
    html: html,
  };

  transport.sendMail(message, function (err, result) {
    callback(err, result);
  });
};

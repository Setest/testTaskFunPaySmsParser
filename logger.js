/**
 * Prepare and initialize logger, use as module.
 *
 * @author Setest
 */

const winston = require('winston'),
      { createLogger, format, transports } = require('winston'),
      fs = require('fs'),
      path = require('path'),
      del = require('del')
;

let winstonLogger = {
   config : {
     path_log: 'logs'
   },
   getLogger : function() {
     return this.logger
   },

   initialize : function() {
     this.clean()
         .createLogger();
   },

   clean : function() {
     if ( !fs.existsSync( this.config.path_log ) ) {
         // Create the directory if it does not exist
         fs.mkdirSync( this.config.path_log );
     }else{
       del.sync(path.join(this.config.path_log,'/**/*'));
     }
     return this;
   },

   createLogger : function() {
     this.logger = createLogger({
       level: 'debug',
       format: format.combine(
         format.timestamp(),
         format.json(),
       ),
       transports: [
         new winston.transports.File({ filename: path.join(this.config.path_log, '/error.log'), level: 'error' }),
         new winston.transports.File({ filename: path.join(this.config.path_log, '/combined.log') }),
       ]
     });
     return this;
  },


  showLog : function() {
    if (!this.logger) {
      console.error('Can not initialize logger');
      return false;
    }

    this.logger.add(new winston.transports.Console({
      format: format.combine(
        format.timestamp({
          format : 'YYYY-MM-DD hh:mm:ss.SSS'
        }),
        format.printf(info => `${info.timestamp} [${info.level}] ${info.message}`),
        format.colorize({ all: true })
      ),
    }));

  }

}
// Create new role type called super_role
var logger = Object.create(winstonLogger);
logger.initialize();

module.exports = logger;
module.exports.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
};

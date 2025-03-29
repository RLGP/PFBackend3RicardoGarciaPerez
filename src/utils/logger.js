import winston from 'winston';

const customLevelsOptions = {
  levels: {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5
  },
  colors: {
    fatal: 'red',
    error: 'magenta',
    warning: 'yellow',
    info: 'blue',
    http: 'green',
    debug: 'white'
  }
};

const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'info';
};

const logger = winston.createLogger({
  levels: customLevelsOptions.levels,
  level: level(),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.colorize({ all: true }),
        winston.format.printf(info => `${info.timestamp} - ${info.level}: ${info.message}`)
      )
    }),
    new winston.transports.File({
      filename: 'errors.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json()
      )
    })
  ]
});

winston.addColors(customLevelsOptions.colors);

export default logger;
import pino from "pino";

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime
});

export default logger;

const fs = require('fs');

function mandatory(name) {
  if (name === undefined) {
    throw new Error('Mandatory parameter name is not specified');
  }
  if (typeof name !== 'string' || name.length <= 0) {
    throw new Error('Mandatory parameter name must be non-empty string');
  }
  throw new Error(`Mandatory parameter '${name}' is missing`);
}

function enrichError(
  error = mandatory('error'),
  message = mandatory('message')
) {
  const newError = new Error(message);
  newError.stack += `\nOriginal error:\n${error.stack}`;
  return newError;
}

// TODO: tests
function flattenArray(arr, recursive = false) {
  return arr.reduce(
    (acc, val) =>
      Array.isArray(val) && recursive
        ? acc.concat(flattenArray(val))
        : acc.concat(val),
    []
  );
}

function sleep(ms = mandatory('ms')) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Force loging of unhandledRejection events.
 *
 * Most likely should be used only for entrypoints.
 *
 * @param {boolean} exitWithError - Call process.exit(1) after log
 */
function logUnhandledRejections(exitWithError = false) {
  /* istanbul ignore next */
  // In Node v7 unhandled promise rejections will terminate the process
  if (!process.env.LOG_UNHANDLED_REJECTION) {
    process.on('unhandledRejection', (err) => {
      // eslint-disable-next-line no-console
      console.error('Unhandled Rejection:', err);

      if (exitWithError) {
        process.exit(1);
      }
    });

    // Avoid memory leak by adding too many listeners
    process.env.LOG_UNHANDLED_REJECTION = true;
  }
}

/**
 * Force throwing of unhandledRejection events.
 *
 * Most likely should be used only for entrypoints.
 */
function throwUnhandledRejections() {
  /* istanbul ignore next */
  // In Node v7 unhandled promise rejections will terminate the process
  if (!process.env.LISTENING_TO_UNHANDLED_REJECTION) {
    process.on('unhandledRejection', (err) => {
      throw err;
    });

    // Avoid memory leak by adding too many listeners
    process.env.LISTENING_TO_UNHANDLED_REJECTION = true;
  }
}

function getPrefixedEnvVars(prefix = mandatory('prefix')) {
  const prefixPattern = new RegExp(`^${prefix}`, 'i');
  const params = {};

  Object.entries(process.env).forEach(([k, v]) => {
    if (prefixPattern.test(k)) {
      params[k.replace(prefixPattern, '')] = v;
    }
  });

  return params;
}

function humanReadableTimeToMS(timeString = mandatory('timeString')) {
  if (typeof timeString !== 'string') {
    throw new Error(
      `Time must be a string(i.e '60s', '10m'). Now: ${typeof timeString}`
    );
  }

  const type = timeString[timeString.length - 1];
  const interval = parseInt(timeString.slice(0, timeString.length - 1), 10);

  let intervalMultiplier;

  switch (type) {
    case 's':
      intervalMultiplier = 1;
      break;
    case 'm':
      intervalMultiplier = 60;
      break;
    case 'h':
      intervalMultiplier = 60 * 60;
      break;
    case 'd':
      intervalMultiplier = 60 * 60 * 24;
      break;
    case 'w':
      intervalMultiplier = 60 * 60 * 24 * 7;
      break;
    default:
      throw new Error(
        `Unknown time modifier: "${type}". Available modifiers: s, m, h, d, w`
      );
  }

  return interval * 1000 * intervalMultiplier;
}

/**
 * Converts string to RegExp
 * @param {string} str
 * @returns {RegExp}
 */
function stringToRegExp(str = mandatory('str')) {
  const lastSlashIndex = str.lastIndexOf('/');
  const pattern = str.slice(1, lastSlashIndex);
  const flags = str.slice(lastSlashIndex + 1);

  return new RegExp(pattern, flags);
}

/**
 * Move file
 * @param {string} sourcePath
 * @param {string} targetPath
 */
function moveFile(sourcePath, targetPath) {
  try {
    fs.renameSync(sourcePath, targetPath);
  } catch (renameErr) {
    try {
      if (renameErr.code === 'EXDEV') {
        // Source and target paths on different devices
        fs.copyFileSync(sourcePath, targetPath);
      } else {
        throw renameErr;
      }
    } finally {
      fs.unlinkSync(sourcePath);
    }
  }
}

module.exports = {
  mandatory,
  enrichError,
  flattenArray,
  sleep,
  logUnhandledRejections,
  throwUnhandledRejections,
  getPrefixedEnvVars,
  humanReadableTimeToMS,
  stringToRegExp,
  moveFile,
};

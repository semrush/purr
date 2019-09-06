const serverPattern = new RegExp('^[0-9A-Za-z.-_-]*$');

function isServerAllowed(value) {
  return serverPattern.test(value);
}

function isSchemaAllowed(value) {
  return ['http', 'https'].includes(value);
}

function isDomain(value) {
  return ['www.example.com', 'example.com'].includes(value);
}

module.exports = {
  isServerAllowed,
  isSchemaAllowed,
  isDomain,
};

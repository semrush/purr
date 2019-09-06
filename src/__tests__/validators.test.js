const validators = require('../validators');

test.each(['', null, '@', '_', 'azAZ19-_@a'])(
  'pass: validators.isServerAllowed(%s)',
  (value) => {
    expect(validators.isServerAllowed(value)).toEqual(true);
  }
);

test.each(['$', '%', '"', "'"])(
  'reject: validators.isServerAllowed(%s)',
  (value) => {
    expect(validators.isServerAllowed(value)).toEqual(false);
  }
);

test.each(['http', 'https'])(
  'pass: validators.isSchemaAllowed(%s)',
  (value) => {
    expect(validators.isSchemaAllowed(value)).toEqual(true);
  }
);

test.each(['', null, 'ftp'])(
  'reject: validators.isSchemaAllowed(%s)',
  (value) => {
    expect(validators.isSchemaAllowed(value)).toEqual(false);
  }
);

test.each(['www.example.com', 'example.com'])(
  'pass: validators.isDomain(%s)',
  (value) => {
    expect(validators.isDomain(value)).toEqual(true);
  }
);

test.each(['www.google.com', '', null])(
  'pass: validators.isDomain(%s)',
  (value) => {
    expect(validators.isDomain(value)).toEqual(false);
  }
);

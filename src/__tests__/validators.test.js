const validators = require('../validators');

test.each(['', null, '@', '_', 'azAZ19-_@a'])(
  'return true for allowed server(%s)',
  (value) => {
    expect(validators.isServerAllowed(value)).toEqual(true);
  }
);

test.each(['$', '%', '"', "'"])(
  'return false for not-allowed server(%s)',
  (value) => {
    expect(validators.isServerAllowed(value)).toEqual(false);
  }
);

test.each(['http', 'https'])('return true for allowed schema(%s)', (value) => {
  expect(validators.isSchemaAllowed(value)).toEqual(true);
});

test.each(['', null, 'ftp'])(
  'return false for not-allowed schema(%s)',
  (value) => {
    expect(validators.isSchemaAllowed(value)).toEqual(false);
  }
);

test.each(['www.example.com', 'example.com'])(
  'return true for allowed domain(%s)',
  (value) => {
    expect(validators.isDomainAllowed(value)).toEqual(true);
  }
);

test.each(['www.google.com', '', null])(
  'return false for not-allowed domain(%s)',
  (value) => {
    expect(validators.isDomainAllowed(value)).toEqual(false);
  }
);

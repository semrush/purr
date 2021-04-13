const utils = require('../utils');

describe('mandatory', () => {
  test('fail when name argument is not specified', () => {
    expect(() => {
      utils.mandatory();
    }).toThrow('Mandatory parameter name is not specified');
  });

  test.each([[''], [null], [1]])(
    'fail when name argument is invalid ("%s")',
    (name) => {
      expect(() => {
        utils.mandatory(name);
      }).toThrow('Mandatory parameter name must be non-empty string');
    }
  );

  function someFunc(someParam = utils.mandatory('someParam')) {
    return someParam;
  }

  test('fail when it was used as default value', () => {
    expect(someFunc).toThrow("Mandatory parameter 'someParam' is missing");
  });

  test('skip if param value specified', () => {
    expect(someFunc('someValue')).toEqual('someValue');
  });
});

describe('enrichError', () => {
  test('fail when error argument is not specified', () => {
    expect(() => {
      utils.enrichError();
    }).toThrow("Mandatory parameter 'error' is missing");
  });

  test('fail when message argument is not specified', () => {
    expect(() => {
      utils.enrichError('test');
    }).toThrow("Mandatory parameter 'message' is missing");
  });

  test('skip if param value specified', () => {
    const originErrorMessage = 'Origin Error Message';
    const newErrorMessage = 'New Error Message';
    const originError = new Error(originErrorMessage);
    const newError = utils.enrichError(originError, newErrorMessage);
    expect(newError.message).toEqual(newErrorMessage);
    expect(newError.stack).toEqual(
      expect.stringContaining(`Error: ${originErrorMessage}`)
    );
  });
});

describe('sleep', () => {
  test('sleep is running, at least', () => {
    return expect(utils.sleep(100)).resolves.toBe(undefined);
  });

  test('fail when ms argument is not specified', () => {
    expect(() => {
      utils.sleep();
    }).toThrow("Mandatory parameter 'ms' is missing");
  });
});

describe('stringToRegExp', () => {
  test("fail when 'str' argument is not specified", () => {
    expect(() => {
      utils.stringToRegExp();
    }).toThrow("Mandatory parameter 'str' is missing");
  });

  test('skip if param value specified', () => {
    expect(utils.stringToRegExp(String.raw`/^test_[a-z-]{1,3}$/`)).toEqual(
      /^test_[a-z-]{1,3}$/
    );
    expect(utils.stringToRegExp(String.raw`/^test_\/[a-z]{1,3}$/`)).toEqual(
      /^test_\/[a-z]{1,3}$/
    );
    expect(utils.stringToRegExp(String.raw`/^test_[a-z-]{1,3}$/gi`)).toEqual(
      /^test_[a-z-]{1,3}$/gi
    );
    expect(utils.stringToRegExp(String.raw`/^test_\/[a-z]{1,3}$/gi`)).toEqual(
      /^test_\/[a-z]{1,3}$/gi
    );
  });
});

test('splitArray', () => {
  const originArray = ['a', 'b', 'c', 'd', 'e'];

  expect(utils.splitArray(originArray.slice(), 1)).toEqual([originArray]);
  expect(utils.splitArray(originArray.slice(), 2)).toEqual([
    ['a', 'b', 'c'],
    ['d', 'e'],
  ]);
  expect(utils.splitArray(originArray.slice(), 3)).toEqual([
    ['a', 'b'],
    ['c', 'd'],
    ['e'],
  ]);
  expect(utils.splitArray(originArray.slice(), 4)).toEqual([
    ['a', 'b'],
    ['c'],
    ['d'],
    ['e'],
  ]);
  expect(utils.splitArray(originArray.slice(), 5)).toEqual([
    ['a'],
    ['b'],
    ['c'],
    ['d'],
    ['e'],
  ]);
  expect(utils.splitArray(originArray.slice(), 6)).toEqual([
    ['a'],
    ['b'],
    ['c'],
    ['d'],
    ['e'],
    [],
  ]);
});

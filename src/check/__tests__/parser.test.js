const { CheckParser } = require('../parser');
const config = require('../../config');

jest.mock('../../config');

let parser;

beforeEach(async () => {
  parser = new CheckParser();
});

afterEach(async () => {
  // await browser.close();
});

describe('CheckParser', () => {
  test('fail when name not passed', () => {
    expect(parser.getScenario).toThrow("Mandatory parameter 'name' is missing");
  });

  test('fail when check does not exists', () => {
    expect(() => {
      parser.getScenario('non_existing_check');
    }).toThrow("Check with name 'non_existing_check' does not exist");
  });

  test('fail when check is not an object', () => {
    expect(() => {
      parser.getScenario('check-with-invalid-step');
    }).toThrow("Step with index 0 should be 'object', not 'string'.");
  });

  test('get check scenario', () => {
    // TODO: Use more smart assert
    expect(parser.getScenario('mocked-check')).toBeTruthy();
  });

  test('get check scenario with params', () => {
    // TODO: Use more smart assert
    // TODO: Add different usage of parameters
    const scenario = parser.getScenario('mocked-check-with-params', {
      test: 1,
      TARGET_SCHEMA: 'ht',
    });
    expect(scenario).toBeTruthy();
  });

  test('fail when name argument not passed', () => {
    expect(parser.getScenario).toThrow("Mandatory parameter 'name' is missing");
  });

  test('get scenario', () => {
    // TODO: use mock for files from vars int test instead __/mocks__/check.yml
    // const data = {
    //   parameters: {}, // FIXME: if parameters not used?
    //   steps: [
    //     {
    //       waitFor: [1],
    //     },
    //     {
    //       waitFor: [2, 3],
    //     },
    //   ],
    // };
    const dataExpected = [
      ['someAction', [3600]],
      ['anotherAction', ['someArgument', { anotherArgument: 'anotherValue' }]],
    ];

    expect(parser.getScenario('mocked-check')).toEqual(dataExpected);
  });

  test('get scenario with default parameters', () => {
    const dataExpected = [
      ['someAction', ['SomeValue']],
      ['anotherAction', ['SomeValue', { anotherArgument: '.with.it' }]],
    ];

    expect(parser.getScenario('mocked-check-with-params')).toEqual(
      dataExpected
    );
  });

  test('get scenario with default parameters and action template', () => {
    const dataExpected = parser.getScenario('check-with-template-expected');

    expect(parser.getScenario('check-with-template')).toEqual(dataExpected);
  });

  test('get scenario with default parameters and nested action template', () => {
    const dataExpected = parser.getScenario(
      'check-with-nested-template-expected'
    );

    expect(parser.getScenario('check-with-nested-template')).toEqual(
      dataExpected
    );
  });

  test('get scenario with custom parameters', () => {
    const customParameters = {
      SOME_PARAMETER: 'OverriddenValue',
      SOME_COMPLEX_PARAMETER: 'Overridden.Complex.Value',
    };
    const dataExpected = [
      ['someAction', [customParameters.SOME_PARAMETER]],
      [
        'anotherAction',
        [
          customParameters.SOME_PARAMETER,
          {
            anotherArgument: `.${customParameters.SOME_COMPLEX_PARAMETER.split(
              '.'
            )
              .slice(-2)
              .join('.')}`,
          },
        ],
      ],
    ];

    expect(
      parser.getScenario('mocked-check-with-params', customParameters)
    ).toEqual(dataExpected);
  });

  test('get scenario with custom parameters from env', () => {
    const originEnv = Object.assign({}, process.env);

    const prefix = config.envVarParamPrefix;
    const customParameters = {
      SOME_PARAMETER: 'OverriddenValue',
      SOME_COMPLEX_PARAMETER: 'Overridden.Complex.Value',
    };
    const envParameters = {
      [`${prefix}SOME_PARAMETER`]: customParameters.SOME_PARAMETER,
      [`${prefix}SOME_COMPLEX_PARAMETER`]: customParameters.SOME_COMPLEX_PARAMETER,
    };
    const dataExpected = [
      ['someAction', [customParameters.SOME_PARAMETER]],
      [
        'anotherAction',
        [
          customParameters.SOME_PARAMETER,
          {
            anotherArgument: `.${customParameters.SOME_COMPLEX_PARAMETER.split(
              '.'
            )
              .slice(-2)
              .join('.')}`,
          },
        ],
      ],
    ];

    Object.assign(process.env, envParameters);

    expect(parser.getScenario('mocked-check-with-params')).toEqual(
      dataExpected
    );

    process.env = originEnv;
  });
});

//   test('handle scenario failes', async () => {
//     const scenario = [
//       ['waitFor', [1]],
//       ['waitFor', [2, 3]],
//       ['waitFor', [{ a: 2 }, 3]],
//     ];

//     const page = await check.preparePage(browser);
//     page.waitFor = jest
//       .fn(async () => {
//         return Promise.reject(new Error('fake fail'));
//       })
//       .mockImplementationOnce(async () => {
//         return true;
//       })
//       .mockName('waitFor');

//     await expect(check.execPageScenario(page, scenario)).rejects.toThrow(
//       'fake fail'
//     );
//     expect(page.waitFor).toBeCalledTimes(2);
//   });

// test('execute scenario', async () => {
//   const data = [
//     {
//       waitFor: [1],
//     },
//     {
//       waitFor: [2, 3],
//     },
//     {
//       waitFor: [{ a: 2 }, 3],
//     },
//   ];
//   const scenario = [
//     ['waitFor', [1]],
//     ['waitFor', [2, 3]],
//     ['waitFor', [{ a: 2 }, 3]],
//   ];

//   const page = await check.preparePage(browser);
//   page.waitFor = jest.fn(async () => true).mockName('waitFor');

//   await check.execPageScenario(page, scenario);

//   expect(page.waitFor).toBeCalledTimes(3);
//   expect(page.waitFor.mock.calls[0]).toEqual(scenario[0][1]);
//   expect(page.waitFor.mock.calls[1]).toEqual(scenario[1][1]);
//   expect(page.waitFor.mock.calls[2]).toEqual(scenario[2][1]);

//   // TODO: add test that initial scenario was not changed
//   expect(check.CheckParser.getScenario(data)).toEqual(scenario);
// });

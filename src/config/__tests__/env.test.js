const { EnvParams } = require('../env');

describe('Test EnvParams', () => {
  it('Should return empty object if no keys given in env', () => {
    const config = new EnvParams();
    expect(Object.keys(config)).toHaveLength(0);
  });

  it('Should skip unknown keys', () => {
    process.env[`${EnvParams.PREFIX}NO_SUCH_KEY`] = '123';
    const config = new EnvParams();
    expect(config.NO_SUCH_KEY).toBeFalsy();
    expect(Object.keys(config)).toHaveLength(0);
  });

  it('Should add known keys', () => {
    process.env[`${EnvParams.PREFIX}SCREENSHOTS`] = 'true';
    process.env[`${EnvParams.PREFIX}NAVIGATION_TIMEOUT`] = '10';
    const config = new EnvParams();
    expect(config.SCREENSHOTS).toEqual('true');
    expect(config.NAVIGATION_TIMEOUT).toEqual('10');
  });
});

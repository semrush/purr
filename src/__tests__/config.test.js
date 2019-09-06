const config = jest.requireActual('../config');

test('config', () => {
  expect(config).toBeInstanceOf(Object);
  expect(typeof config.userAgent).toBe('string');
});

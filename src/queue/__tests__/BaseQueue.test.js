jest.unmock('../BaseQueue');
jest.unmock('../../utils');

const BaseQueue = require('../BaseQueue');

const queue = new BaseQueue();

test('fail when name is not specified', async () => {
  await expect(queue.add()).rejects.toThrow(
    "Mandatory parameter 'name' is missing"
  );
});

test('fail when checkId is not specified', async () => {
  await expect(queue.add(10)).rejects.toThrow(
    "Mandatory parameter 'checkId' is missing"
  );
});

test('fail on non implemented call `close`', async () => {
  await expect(queue.close()).rejects.toThrow('Not implemented');
});

test('fail on non implemented call `add`', async () => {
  await expect(queue.add(10, 10)).rejects.toThrow('Not implemented');
});

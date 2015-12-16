'use strict';

describe(`$logglyProvider`, () => {
  const moduleName = require('../src');
  let provider;

  beforeEach(() => {
    mock.module(moduleName);
    mock.module($logglyProvider => {
      provider = $logglyProvider;
      console.log('set the thing');
    });
  });

  it(`should be an object`, () => {
    expect(provider)
      .to
      .be
      .an('object');
  });
});

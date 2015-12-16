# angular-loggly-mixin

> AngularJS module to pass $log calls thru to Loggly

## Summary

The purpose of this module is to allow you to use [Loggly](https://loggly.com) in your AngularJS module with as little impact to your existing code as possible.

It works by decorating AngularJS' [`$log`](https://code.angularjs.org/1.4.8/docs/api/ng/service/$log) service to pass calls through to Loggly.  This means if you're already using `$log` in your app, you simply need to configure a Loggly key, and it's ready to use.

This module provides *sensible defaults*, but also allows you to configure it to your liking.

## Example

```js
angular.module('myModule', ['fv.loggly-mixin'])
  .config($logglyProvider => {
    // replace with your key
    $logglyProvider.logglyKey('00000000-0000-0000-0000-000000000000');
      .decorate()
  })
  .run($log => {
    $log.info('Ready to work!');
    // sends the following to Loggly:
    // {desc: 'Ready to work!'}
  });
```

## Configuration

All configuration options (as defaults) are shown here:

```js
angular.module('myModule', ['fv.loggly-mixin'])
  .config($logglyProvider => {
    // (there is no default key; you probably want to set it, unless
    // you have your own Loggly server)
    $logglyProvider.logglyKey('00000000-0000-0000-0000-000000000000')
      // tracker url
      .logglyUrl('//cloudfront.loggly.com/js/loggly.tracker.js')
      // whether to pass uncaught errors to Loggly
      .allowUncaught(true)
      // whether or not to allow Loggly to trap calls to console.error()
      .sendConsoleErrors(false)
      // message formatting function.  accepts these two parameters
      // and should return an object.  use this to custom-tailor your
      // data.
      .formatter((level, body) => {
        body.desc = body.desc || '(no description)';
        return Object.assign({level}, body);
      })
      // mapping of new method names to original method names.
      // you can define custom "levels" in this manner, or "forward" all
      // calls from one to another.
      // if `$log.debug` doesn't exist or is disabled, `$log.log` will be used.
      //
      .levelMapping({
        debug: 'debug',
        log: 'log',
        info: 'info',
        warn: 'warn',
        error: 'error'
      });

    // in addition, a convenience method exists to map a method;
    // this causes `$log.foo()` to call `$log.log()`.  returns $logglyProvider
    // instance.
    $logglyProvider.mapLevel('foo', 'log');

    // finally, you can grab the entire configuration this way:
    $logglyProvider.config();

    // call this when finished to decorate the service.
    $logglyProvider.decorate();
  })
  .run($log => {
    // you can also pull the config at runtime
    $log.config();

    // or send an object directly to Loggly
    $log.send({
      foo: 'bar'
    });
  });
```

## Events

Once the Loggly tracker is "ready", a `fv.loggly-mixin:ready` event will be emitted (not broadcast) on the `$rootScope`.

## Timers

Since `$log` has no timing functionality, and it's often useful to send timer information to Loggly, `$log` will now have two more functions:

### $log.time(label)

Starts a timer for `String` `label`.

### $log.timeEnd(label, desc, data)

Ends the timer for `label`, and sends a message to Loggly of the following format, where `ms` is elapsed time in milliseconds:

```js
const msg = {
  level: "log",
  ms: ms,
  desc: desc,
  data: data
}
```

## Author

[Christopher Hiller](https://github.com/boneskull)

## License

© 2015 FocusVision Worldwide.  Licensed MIT.

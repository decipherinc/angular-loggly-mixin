# angular-loggly-mixin

> AngularJS module to pass $log calls thru to Loggly

[![Travis CI](https://travis-ci.org/decipherinc/angular-loggly-mixin.svg)](https://travis-ci.org/decipherinc/angular-loggly-mixin) [![Code Climate](https://codeclimate.com/github/decipherinc/angular-loggly-mixin/badges/gpa.svg)](https://codeclimate.com/github/decipherinc/angular-loggly-mixin) [![Coveralls](https://coveralls.io/repos/decipherinc/angular-loggly-mixin/badge.svg?branch=master&service=github)](https://coveralls.io/github/decipherinc/angular-loggly-mixin?branch=master)

## Summary

The purpose of this module is to allow you to use [Loggly](https://loggly.com) in your AngularJS module with as little impact to your existing code as possible.

It works by decorating AngularJS' [`$log`](https://code.angularjs.org/1.4.8/docs/api/ng/service/$log) service to pass calls through to Loggly.  This means if you're already using `$log` in your app, you simply need to configure a Loggly key, and it's ready to use.

This module provides *sensible defaults*, but also allows you to configure it to your liking.

## Example

```js
angular.module('myModule', ['fv.loggly-mixin'])
  .config($logglyProvider => {
    // replace with your key.  the "sensible default" is an empty string,
    // which I guess is not so sensible.    
    $logglyProvider.logglyKey('00000000-0000-0000-0000-000000000000')
      // this must be called to decorate the $log service.
      // if you just want the connection to Loggly established (to say, use
      // `$loggly.send()` to communicate directly), omit this.
      .decorate();
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
      // this function runs in a `null` context.
      .formatter((level, body) => {
        body.desc = body.desc || '(no description)';
        return Object.assign({level}, body);
      })
      // mapping of new method names to original method names.
      // you can define custom "levels" in this manner, or "forward" all
      // calls from one to another.
      // if `$log.debug` doesn't exist or is disabled, `$log.log` will be used.
      // note that this function will not *remove* any existing settings;
      // $log.error() will still be $log.error() unless you override it.
      .levelMapping({
        debug: 'debug',
        log: 'log',
        info: 'info',
        warn: 'warn',
        error: 'error',
        time: 'log'
      })
      // set the level used by the $log.timeEnd() method to 'time'.
      // it should correspond to a key in the level mapping object.
      // see "Timers" section below for more info.
      .timerLevel('time')

    // in addition, a convenience method exists to map a method;
    // this causes `$log.foo()` to call `$log.log()`.  returns $logglyProvider
    // instance.
    $logglyProvider.mapLevel('foo', 'log');

    // finally, you can grab the entire configuration object this way.
    // property `logglyConfig` is data which will be sent to Loggly; feel free
    // to manually add anything else here.
    // property `providerConfig` is used internally and does not get sent to 
    // Loggly.
    console.dir($logglyProvider.config);

    // call this when finished to decorate the service.
    $logglyProvider.decorate();
  })
  .run($log => {
    // you can also pull the config at runtime
    console.dir($log.config);

    // or send something directly to Loggly
    $log.send({
      foo: 'bar'
    });
  });
```
## Timers

Since `$log` has no timing functionality, and it's often useful to send timer information to Loggly, `$log` will now have two more functions:

### $log.timer(label)

Starts a timer with the given `{string}` label.  Returns `undefined`.

### $log.timerEnd(label, [desc], [data])

Ends the timer for `{string}` `label`, with an optional description `{string}` `desc` and optional data `{*}` `data`.  Sends a message to Loggly of the following format, where `{number}` `ms` is elapsed time in milliseconds:

```js
const msg = {
  level: 'time',
  ms: ms,
  desc: desc,
  data: data
}
``` 

If you've used `$logglyProvider.timerLevel()` to set a different level value, it will
be used instead of `time`.

Returns `undefined`.

## $loggly Service

A `$loggly` service is available, however, it's mostly for internal usage.  `$loggly`'s' main responsibility is to use the configuration as defined in `$logglyProvider` to initiate communcation with Loggly.

The following members may be of use:

### send(data)

Sends `{*}` `data` directly to Loggly.  

Returns the `$loggly` service, and is thusly chainable.
 
### config

An `Object` representation of the configuration as set by `$logglyProvider` is available here.  Modifying it is *unsupported* at the time of this writing.

## Events

Events are emitted (not broadcast) on `$rootScope`.

- `fv.loggly-mixin:ready`: Once the Loggly tracker is "ready", this event is emitted.

- `fv.loggly-mixin:timer-started`: When a timer has been started via `$log.timer()`, this event is emitted with the `label` and a `timestamp` (from the epoch).

- `fv.loggly-mixin:timer-stopped`: When a timer has ended via `$log.timerEnd()`, this event is emitted with the `label`, any description, extra data, and a `ms` field indicating elapsed time.

## Author

[Christopher Hiller](https://github.com/boneskull)

## License

© 2015 FocusVision Worldwide.  Licensed [Apache-2.0](https://github.com/decipherinc/angular-loggly-mixin/blob/master/LICENSE).

describe('util', function() {
  beforeEach(module('material.core'));

  var $rootScope, $timeout, $$mdAnimate;
  beforeEach( inject(function(_$animate_,_$rootScope_,_$timeout_) {
      $animate = _$animate_;
      $rootScope = _$rootScope_;
      $timeout = _$timeout_;
  }));

  describe('disconnect',function(){
    var disconnectScope, reconnectScope;
    beforeEach(inject(function($mdUtil) {
      disconnectScope = $mdUtil.disconnectScope;
      reconnectScope = $mdUtil.reconnectScope;
    }));

    it('disconnectScope events', inject(function($rootScope) {
      var scope1 = $rootScope.$new();

      var spy = jasmine.createSpy('eventSpy');
      scope1.$on('event', spy);

      disconnectScope(scope1);

      $rootScope.$broadcast('event');
      expect(spy).not.toHaveBeenCalled();

      reconnectScope(scope1);

      $rootScope.$broadcast('event');
      expect(spy).toHaveBeenCalled();
    }));

  });

  describe('throttle', function() {
    var delay = 500;
    var nowMockValue;
    var originalFn;
    var throttledFn;

    beforeEach(inject(function($mdUtil) {
      $mdUtil.now = function () { return nowMockValue; };
      originalFn = jasmine.createSpy('originalFn');
      throttledFn = $mdUtil.throttle(originalFn, delay);
      nowMockValue = 1;    // Not 0, to prevent `!recent` inside `throttle()` to
                           // evaluate to true even after `recent` has been set
    }));

    it('should immediately invoke the function on first call', function() {
      expect(originalFn).not.toHaveBeenCalled();
      throttledFn();
      expect(originalFn).toHaveBeenCalled();
    });

    it('should not invoke the function again before (delay + 1) milliseconds', function() {
      throttledFn();
      expect(originalFn.calls.count()).toBe(1);

      throttledFn();
      expect(originalFn.calls.count()).toBe(1);

      nowMockValue += delay;
      throttledFn();
      expect(originalFn.calls.count()).toBe(1);

      nowMockValue += 1;
      throttledFn();
      expect(originalFn.calls.count()).toBe(2);
    });

    it('should pass the context to the original function', inject(function($mdUtil) {
      var obj = {
        called: false,
        fn: function() { this.called = true; }
      };
      var throttled = $mdUtil.throttle(obj.fn, delay);

      expect(obj.called).toBeFalsy();
      throttled.call(obj);
      expect(obj.called).toBeTruthy();
    }));

    it('should pass the arguments to the original function', function() {
      throttledFn(1, 2, 3, 'test');
      expect(originalFn).toHaveBeenCalledWith(1, 2, 3, 'test');
    });
  });

  function flush() {
    $rootScope.$digest();
    $animate.triggerCallbacks();
    $timeout.flush();
  }
});

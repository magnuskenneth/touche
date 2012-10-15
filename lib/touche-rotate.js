(function() {
	'use strict';

	var T = window.Touche;

	/**
	 * Bind a rotate gesture. Supports a rotation threshold that is used to measure when the gesture starts.
	 * Triggers `start`, `update` and `end` events.
	 * @name G#rotate
	 * @param {DOMElement} elem
	 * @param {Object} Data to set up the gesture
	 */
	T.rotate = function(elem, gesture) {
		gesture = T.utils.extend({
			options: {
				rotationThreshold: 12,
				preventDefault: true
			},
			start: function() {},
			update: function() {},
			end: function() {}
		}, gesture);

		var inst = T.cache.get(elem),
			touches = 2,
			preventDefault = gesture.options.preventDefault,
			rotationThreshold = gesture.options.rotationThreshold,
			startAngle, currentAngle,
			rotation, countTouches;

		inst.context.addGesture(T.gesture(elem, 'rotate', {
			options: gesture.options,
			start: function(event, data) {
				this.rotate = {
					start: {},
					current: {}
				};
				this.rotationstartFired = false;

				countTouches = 0;
				countTouches = event.touches && event.touches.length > countTouches ? event.touches.length : 1;
				if(countTouches > 0 && countTouches > touches) {
					inst.context.cancelGestures('rotate');
					return;
				}

				this.rotate.start.point1 = data.points[0];
				this.rotate.start.point2 = data.points[1];

				if(preventDefault) {
					event.preventDefault();
				}
			},
			update: function(event, data) {
				countTouches = event.touches && event.touches.length > countTouches ? event.touches.length : countTouches;
				if(countTouches > 0 && countTouches > touches) {
					inst.context.cancelGestures('rotate');
					return;
				} else if(countTouches === touches) {
					if(!this.rotate.start.point2) {
						this.rotate.start.point2 = data.points[1];
					} else {
						this.rotate.current.point1 = data.points[0];
						this.rotate.current.point2 = data.points[1];
						startAngle = T.utils.getDeltaAngle(this.rotate.start.point2, this.rotate.start.point1);
						currentAngle = T.utils.getDeltaAngle(this.rotate.current.point2, this.rotate.current.point1);
						rotation = currentAngle - startAngle;
						data.rotation = rotation;

						if(!this.rotationstartFired && rotation >= rotationThreshold) {
							this.rotationstartFired = true;
							inst.context.cancelGestures('tap').cancelGestures('swipe').cancelGestures('pinch');
							gesture.start.call(this, event, data);
						} else if(this.rotationstartFired) {
							gesture.update.call(this, event, data);
						}
					}
				}

				if(preventDefault) {
					event.preventDefault();
				}
			},
			end: function(event, data) {
				if(this.rotationstartFired) {
					gesture.end.call(this, event, data);
				}

				if(preventDefault) {
					event.preventDefault();
				}
			},
			cancel: function() {
				gesture.cancel.call(gesture);
			}
		}));
		return T;
	};
})();
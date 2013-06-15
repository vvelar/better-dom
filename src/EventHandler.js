define(["SelectorMatcher"], function(SelectorMatcher, DOMElement, _map) {
    "use strict";

    /**
     * Helper type to create an event handler
     * @private
     * @constructor
     */
    var EventHandler = (function() {
        var hooks = {};

        hooks.currentTarget = function(event, currentTarget) {
            return DOMElement(currentTarget);
        };

        if (document.addEventListener) {
            hooks.target = function(event) {
                return DOMElement(event.target);
            };
        } else {
            hooks.target = function(event) {
                return DOMElement(event.srcElement);
            };
        }
        
        if (document.addEventListener) {
            hooks.relatedTarget = function(event) {
                return DOMElement(event.relatedTarget);
            };
        } else {
            hooks.relatedTarget = function(event, currentTarget) {
                var propName = ( event.toElement === currentTarget ? "from" : "to" ) + "Element";

                return DOMElement(event[propName]);
            };
        }

        return function(type, selector, options, callback, extras, context, thisArg) {
            var currentTarget = thisArg._node,
                matcher = SelectorMatcher(selector),
                defaultEventHandler = function(e) {
                    if (EventHandler.veto !== type) {
                        var event = e || window.event,
                            fn = typeof callback === "string" ? context[callback] : callback,
                            args;

                        // handle modifiers
                        if (options.cancel === true) {
                            event.preventDefault ? event.preventDefault() : event.returnValue = false;
                        }

                        if (options.stop === true) {
                            event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true;
                        }

                        // populate extra event arguments
                        if (options.args) {
                            args = _map(options.args, function(name) {
                                var hook = hooks[name];

                                return hook ? hook(event, currentTarget) : event[name];
                            });
                            
                            if (extras) args.push.apply(args, extras);
                        } else {
                            args = extras ? extras.slice(0) : [];
                        }

                        if (fn) fn.apply(context, args);
                    }
                };

            return !selector ? defaultEventHandler : function(e) {
                var el = window.event ? window.event.srcElement : e.target;

                for (; el && el !== currentTarget; el = el.parentNode) {
                    if (matcher.test(el)) {
                        defaultEventHandler(e);

                        break;
                    }
                }
            };
        };
    }());
});

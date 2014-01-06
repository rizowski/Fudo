(function ($, validation) {
    var sources = {};
    var defineSource = function (key, source) {
        sources[key] = source;
    };

    var ValidationMode = {
        Live: 'live',
        Triggered: 'triggered'
    };

    // Notification structures
    // -----------------------

    function ValidationMessage(field, token, element, context) {
        this.field = field;
        this.token = token;
        this.element = element;
        this.context = context || {};
    }

    ValidationMessage.prototype = {
        toHash: function () {
            return this.field + ':' + this.token.toString();
        },
        toString: function () {
            var message = this.token.toString();
            var context = this.context;

            if (this.element) {
                var label = this.element.data('localized-label');
                if (typeof (label) != 'undefined') {
                    message = message.replace('{field}', label);
                }
                else {
                    message = message.replace('{field}', this.element.attr('name'));
                }
            }

            for (var key in context) {
                message = message.replace('{' + key + '}', context[key]);
            }

            return message;
        }
    };

    function ValidationNotification() {
        this.messages = {};
    };

    ValidationNotification.prototype = {
        messagesFor: function (field) {
            var messages = this.messages[field];
            if (typeof (messages) == 'undefined') {
                messages = [];
                this.messages[field] = messages;
            }

            return messages;
        },

        registerMessage: function (field, token, element, context) {
            var message = new ValidationMessage(field, token, element, context);
            var existing = null;
            this.eachMessage(function (msg) {
                if (message.toHash() == msg.toHash()) {
                    existing = msg;
                }
            });

            if (existing != null) return existing;

            var messages = this.messagesFor(field);
            messages.push(message);

            return message;
        },

        allMessages: function () {
            var messages = [];

            this.eachMessage(function (msg) { messages.push(msg); });

            return messages;
        },

        eachMessage: function (action) {
            for (var key in this.messages) {
                var values = this.messages[key];
                _.each(values, function (value) {
                    action(value);
                });
            }
        },

        isValid: function () {
            return this.allMessages().length == 0;
        },

        toContinuation: function () {
            var continuation = new $fubu.continuations.continuation();
            continuation.success = this.isValid();
            continuation.mode = this.mode;

            var messages = this.allMessages();
            for (var i = 0; i < messages.length; i++) {
                var message = messages[i];
                var label = message.element.data('localized-label');
                if (typeof (label) == 'undefined') {
                    label = message.field;
                }

                continuation.errors.push({
                    field: message.field,
                    label: label,
                    message: message.toString(),
                    element: message.element,
                    source: message.context
                });
            }

            return continuation;
        },

        importForTarget: function (notification, target) {
            this.mode = notification.mode;
            this.messages[target.fieldName] = notification.messagesFor(target.fieldName);
        }
    };

    // Helpers used for tracking validation context
    // -------------

    function ValidationTarget(fieldName, value, correlationId) {
        this.fieldName = fieldName;
        this.rawValue = value;
        this.correlationId = correlationId;
        this.messages = null;
    };

    ValidationTarget.prototype = {
        useLocalizationMessages: function (messages) {
            this.messages = messages;
        },
        localizedMessageFor: function (key) {

            var messages = this.messages;
            if (messages == null) {
                var data = this.element.data('localization');
                if (typeof (data) == 'undefined') return null;

                messages = data.Messages;
            }

            var message = messages[key];
            if (typeof (message) == 'undefined') return null;

            return message;
        },
        value: function () {
            var value = this.rawValue;
            if (typeof (this.element) != 'undefined') {
                value = $(this.element).val();
            }

            return $.trim(value);
        },
        toHash: function () {
            return 'correlationId:' + this.correlationId + '&fieldName=' + this.fieldName;
        }
    };

    ValidationTarget.forElement = function (element, correlationId, form) {
        var target = new ValidationTarget(element.attr('name'), null, correlationId);
        target.element = element;
        target.form = form;

        return target;
    };

    function ValidationContext(target, notification) {
        this.target = target;
        this.notification = notification || new ValidationNotification();
    };

    ValidationContext.prototype = {
        withTemplateContext: function (context) {
            var clone = new ValidationContext(this.target, this.notification);
            clone.templateContext = context;

            return clone;
        },
        registerMessage: function (token) {
            return this.registerMessageForElement(token, this.target.fieldName, this.target.element);
        },
        registerMessageForElement: function (token, fieldName, element) {
            var message = token;
            if (typeof (token.key) != 'undefined') {
                var key = token.key.toLowerCase();
                var localizedMsg = this.target.localizedMessageFor(key);
                if (localizedMsg) {
                    message = localizedMsg;
                }
            }

            return this.notification.registerMessage(fieldName, message, element, this.templateContext);
        }
    };

    // Essentially a Settings class for the Validator

    function ValidationOptions(options) {
        this.mode = ValidationMode.Live;
        this.elementTimeout = 500;
        $.extend(true, this, options);
    }

    ValidationOptions.prototype = {
        modeFor: function (element, rule) {
            var field;
            _.each(this.fields, function (x) {
                if (x.field == element.attr('name') || x.field == element.attr('id')) {
                    field = x;
                }
            });

            if (field) {
                return this.modeForRule(field, rule);
            }

            return this.mode;
        },
        modeForRule: function (field, ruleAlias) {
            var rule;
            _.each(field.rules, function (x) {
                if (x.rule == ruleAlias) {
                    rule = x;
                }
            });

            if (rule) {
                return rule.mode;
            }

            return field.mode;
        },
        shouldValidate: function (element, rule, mode) {
            if (mode == ValidationMode.Triggered) {
                return true;
            }

            return this.modeFor(element, rule) == mode;
        }
    };

    ValidationOptions.fromForm = function (form) {
        var hash = form.data('validationOptions');
        return new ValidationOptions(hash);
    };

    // The main Validator

    function Validator(sources) {
        this.sources = sources || [];

        var self = this;
        var hash = function (target) { return target.toHash(); };
        this.rulesFor = _.memoize(function (target) {
            var rules = [];
            _.each(self.sources, function (src) {
                var targetRules = src.rulesFor(target);
                rules = rules.concat(targetRules);
            });

            return rules;
        }, hash);
    };

    Validator.prototype = {
        registerSource: function (source) {
            this.sources.push(source);
        },
        validate: function (target, options, mode, notification) {
            var plan = this.planFor(target, options, mode, notification);
            return plan.execute();
        },
        planFor: function (target, options, mode, notification) {
            options = options || new ValidationOptions({
                fields: []
            });

            var root = notification || new ValidationNotification();
            root.mode = mode;

            var elementNotification = new ValidationNotification();
            elementNotification.mode = mode;

            var self = this;
            var context = new ValidationContext(target, elementNotification);
            var rules = this.rulesFor(target);
            var plan = new ValidationPlan(root, context);

            _.each(rules, function (rule) {

                if (!options.shouldValidate(context.target.element, rule.name, mode)) {
                    return;
                }

                var ruleContext = context.withTemplateContext(rule);
                var runner = self.runnerFor(rule, ruleContext);
                plan.queueRunner(runner);
            });

            return plan;
        },
        runnerFor: function (rule, context) {
            if (rule.async === true) {
                return new AsyncRuleRunner(rule, context);
            }

            return new RuleRunner(rule, context);
        }
    };

    Validator.basic = function () {
        var validationSources = [];
        for (var key in sources) {
            validationSources.push(sources[key]);
        }

        return new Validator(validationSources);

    };

    // Execution Model
    // ---------------

    // Synchronous Runner
    function RuleRunner(rule, context) {
        this.rule = rule;
        this.context = context;
    }

    RuleRunner.prototype = {
        run: function () {
            this.rule.validate(this.context);
            return {};
        }
    };

    // Asynchronous Runner
    function AsyncRuleRunner(rule, context) {
        this.rule = rule;
        this.context = context;
    }

    AsyncRuleRunner.prototype = {
        run: function () {
            return this.rule.validate(this.context);
        }
    };

    function ValidationPlan(root, context) {
        this.root = root;
        this.runners = [];
        this.context = context;
    }

    ValidationPlan.prototype = {
        queueRunner: function (runner) {
            this.runners.push(runner);
        },
        execute: function () {
            var self = this;
            var promise = $.Deferred();

            var promises = _.map(this.runners, function (runner) {
                return runner.run();
            });

            $.when.apply($, promises).always(function () {
                self.root.importForTarget(self.context.notification, self.context.target);
                promise.resolve(self.root);
            });

            return promise;
        },
        isEmpty: function () {
            return this.runners.length == 0;
        }
    };

    // Validation Sources
    // ---------------

    function CssValidationAliasRegistry() {
        this.rules = {};
        this.registerDefaults();
    };

    CssValidationAliasRegistry.prototype = {
        registerDefaults: function () {
            this.registerRule('required', validation.Rules.Required);
            this.registerRule('email', validation.Rules.Email);
            this.registerRule('date', validation.Rules.Date);
            this.registerRule('number', validation.Rules.Number);
        },

        ruleFor: function (alias, target) {
            var builder = this.rules[alias];
            if (typeof (builder) == 'undefined') {
                return null;
            }

            return builder(target);
        },

        registerRule: function (alias, rule) {
            var builder = rule;
            if (typeof (builder) != 'function') {
                builder = function () { return rule; };
            }
            this.rules[alias] = builder;
        }
    };

    function CssValidationRuleSource(registry) {
        this.registry = registry;
    };

    CssValidationRuleSource.prototype = {
        classesFor: function (element) {
            var classes = element.attr('class');
            if (typeof (classes) == 'undefined' || !classes || classes == '') {
                return [];
            }

            return classes.split(' ');
        },
        rulesFor: function (target) {
            var rules = [];
            var classes = this.classesFor(target.element);
            var registry = this.registry;

            _.each(classes, function (alias) {
                var rule = registry.ruleFor(alias, target);
                if (rule) {
                    rules.push(rule);
                }
            });

            return rules;
        }
    };

    CssValidationRuleSource.basic = function () {
        return new CssValidationRuleSource(new CssValidationAliasRegistry());
    };

    function rulesForData(target, data, continuation) {
        var rules = [];

        var value = target.element.data(data);
        if (typeof (value) != 'undefined') {
            rules.push(continuation(value));
        }

        return rules;
    };

    defineSource('CssRules', CssValidationRuleSource.basic());
    defineSource('MinLength', {
        rulesFor: function (target) {
            return rulesForData(target, 'minlength', function (value) {
                return new validation.Rules.MinLength(value);
            });
        }
    });
    defineSource('MaxLength', {
        rulesFor: function (target) {
            var rules = [];

            var value = target.element.attr('maxlength');
            if (typeof (value) != 'undefined') {
                rules.push(new validation.Rules.MaxLength(parseInt(value)));
            }

            return rules;
        }
    });
    defineSource('RangeLength', {
        rulesFor: function (target) {
            return rulesForData(target, 'rangelength', function (value) {
                return new validation.Rules.RangeLength(value.min, value.max);
            });
        }
    });
    defineSource('Min', {
        rulesFor: function (target) {
            return rulesForData(target, 'min', function (value) {
                return new validation.Rules.Min(value);
            });
        }
    });
    defineSource('Max', {
        rulesFor: function (target) {
            return rulesForData(target, 'max', function (value) {
                return new validation.Rules.Max(value);
            });
        }
    });
    defineSource('RegularExpression', {
        rulesFor: function (target) {
            return rulesForData(target, 'regex', function (value) {
                return new validation.Rules.RegularExpression(value);
            });
        }
    });
    defineSource('FieldEquality', {
        rulesFor: function (target) {
            if (!target.form) return [];

            var data = target.form.data('fieldEquality');
            var rules = [];

            if (typeof (data) != 'undefined') {
                _.each(data.rules, function (ruleDef) {
                    if (ruleDef.property1.field == target.fieldName || ruleDef.property2.field == target.fieldName) {
                        rules.push(new validation.Rules.FieldEquality(ruleDef));
                    }
                });
            }

            return rules;
        }
    });
    defineSource('Remote', {
        rulesFor: function (target) {
            var value = target.element.data('remoteRule');
            if (typeof (value) == 'undefined') {
                return [];
            }

            var rules = [];

            _.each(value.rules, function (hash) {
                rules.push(new validation.Rules.Remote(value.url, hash));
            });

            return rules;
        }
    });

    $.extend(true, validation, {
        'Core': {
            'Context': ValidationContext,
            'Message': ValidationMessage,
            'Notification': ValidationNotification,
            'Options': ValidationOptions,
            'Validator': Validator,
            'Target': ValidationTarget,
            'CssAliasRegistry': CssValidationAliasRegistry,
            'ValidationMode': ValidationMode,
            'RuleRunner': RuleRunner,
            'AsyncRuleRunner': AsyncRuleRunner,
            'ValidationPlan': ValidationPlan
        },
        'Sources': sources
    });

}(jQuery, jQuery.fubuvalidation));
/*!
angular-features v0.3.0 2015-09-13, Jim Schubert (c) 2015 MIT License
Purl: Licensed under an MIT-style license. See https://github.com/allmarkedup/jQuery-URL-Parser/blob/master/LICENSE for details.
*/
(function() {
    (function() {
        "use strict";
        /* global angular */
        var MODULE_NAME = "inc.features.services", FEATURE_INCLUSION_SERVICE = "featureInclusion";
        var module = angular.module(MODULE_NAME, [ "inc.features.urlparser" ]);
        /**
     * Defines the module for feature exclusion
     */
        module.provider(FEATURE_INCLUSION_SERVICE, function FeatureInclusionProvider() {
            var self = this;
            var prefix = "data", attribute = "feature", extensions = [ "html" ], loggingEnabled = true, logPrefix = "[" + MODULE_NAME + "|" + FEATURE_INCLUSION_SERVICE + "] ", features = [], cache = true;
            /**
         * Set the HTML5 attribute's prefix. Defaults to 'data'. This can be set to an empty string
         * to prevent prefixing.
         *
         * @param {String} p The prefix to be used for feature detection attributes.
         *
         * @returns {FeatureInclusionProvider}
         */
            self.setPrefix = function(p) {
                if (!angular.isString(p)) {
                    throw new Error(logPrefix + "setPrefix requires a string parameter");
                }
                prefix = p;
                return self;
            };
            /**
         * Set the HTML5 attribute's key for use in querying for feature exclusion.
         *
         * @param {String} a The attribute key which defines a feature
         *
         * @returns {FeatureInclusionProvider}
         */
            self.setAttribute = function(a) {
                if (!angular.isString(a)) {
                    throw new Error(logPrefix + "setAttribute requires a string parameter");
                }
                attribute = a;
                return self;
            };
            /**
         * Adds a file extension to be handled by the services.
         * Default settings include only files with the 'html' extension.
         *
         * @param {String} ext The extension to add.
         *
         * @returns {FeatureInclusionProvider}
         */
            self.addExtension = function(ext) {
                if (!angular.isString(ext)) {
                    throw new Error(logPrefix + "addExtension requires a string parameter");
                }
                if (-1 === extensions.indexOf(ext)) {
                    extensions.push(ext);
                }
                return self;
            };
            /**
         * Allows for configuration of feature caching.
         *
         * @param {Boolean} [val] True or false, whether or not to cache responses.
         *
         * @returns {FeatureInclusionProvider}
         */
            self.enableCaching = function(val) {
                if (angular.isUndefined(val)) {
                    val = true;
                }
                cache = val;
                return self;
            };
            /**
         * Allows for configuration of internal service logging.
         *
         * @param {Boolean} [val] True or false, whether or not to enable internal logging.
         *
         * @returns {FeatureInclusionProvider}
         */
            self.enableLogging = function(val) {
                if (angular.isUndefined(val)) {
                    val = true;
                }
                loggingEnabled = val;
                return self;
            };
            /**
         * Adds a single feature to be included. A feature passed to this function
         * is considered to be in 'limited preview' and will not be excluded from view.
         *
         * @param {String} feature The feature to make visible to the user
         *
         * @returns {FeatureInclusionProvider}
         */
            self.addFeature = function(feature) {
                if (-1 === features.indexOf(feature)) {
                    features.push(feature);
                }
                return self;
            };
            /**
         * Defines the list of all available features for the user. This would be used
         * as a whole rather than calling `addFeature` iteratively.
         *
         * @param {String[]} f The array of features to enable for a user.
         *
         * @returns {FeatureInclusionProvider}
         */
            self.defineAllFeatures = function(f) {
                if (angular.isArray(f)) {
                    features = f;
                } else {
                    throw new Error(logPrefix + "defineAllFeatures must be passed an array of strings");
                }
                return self;
            };
            /**
         * Service definition for feature inclusion
         * @type {*[]}
         */
            this.$get = [ "$log", "$q", "$templateCache", "urlparser", function($log, $q, $templateCache, urlparser) {
                var EXT = /[^\.]*?\.(.*)/, key = [ prefix, attribute ].join("-");
                function FeatureInclusionService(features, extensions) {
                    // To prevent runtime access to the actual arrays, these are clones.
                    // The interceptor methods will still use the closed over arrays, so directives can't modify
                    // these definitions dynamically (that would cause a lot of problems).
                    this.features = features;
                    this.extensions = extensions;
                }
                /**
            * Provides a services containing an interceptor for an $http response
            *
            * @param {Object} response
            * @param {Object} response.config
            * @param {*} response.data
            * @param {Function} response.headers
            * @param {Number} response.status
            * @param {String} response.statusText
            * @returns {*}
            */
                FeatureInclusionService.prototype.response = function FeatureInclusionServiceResponseInterceptor(response) {
                    var contents, url, extension;
                    try {
                        // If the url is cached and index 0 is not a string, it was cached elsewhere, otherwise use it here.
                        if (cache && (contents = $templateCache.get(response.config.url)) && angular.isString(contents[0])) {
                            response.data = contents;
                        } else {
                            // Get a workable URL information object
                            url = urlparser.parse(response.config.url);
                            // If this interceptor is handling the extension
                            if ((extension = EXT.exec(url.file)) && -1 !== extensions.indexOf(extension[1])) {
                                // get the contents of the response
                                contents = angular.element(response.data);
                                if (angular.isDefined(contents[0])) {
                                    contents = contents[0];
                                    // find all feature elements in the response
                                    // TODO: Support query selector with optional data- prefix?
                                    var featureElements = contents.querySelectorAll("[" + key + "]");
                                    if (featureElements.length === 1 && featureElements[0] === contents) {
                                        contents.innerHTML = "";
                                    } else {
                                        // This walks all feature elements in the response and removes any
                                        // to which the user hasn't been given explicit access
                                        angular.forEach(featureElements, function(child) {
                                            // TODO: Verify this excludes or includes features correctly
                                            if (-1 === features.indexOf(angular.element(child).attr(key))) {
                                                child.remove();
                                            }
                                        });
                                    }
                                    if (cache) {
                                        $templateCache.put(response.config.url, contents.innerHTML);
                                    }
                                    // Update the response's data with the modified contents, including only user's accessible features
                                    response.data = contents.innerHTML;
                                }
                            } else {
                                if (loggingEnabled) {
                                    $log.debug(logPrefix + "FileType not included for processing");
                                }
                            }
                        }
                    } catch (e) {
                        $log.error(logPrefix + "Unexpected error.");
                        $q.reject(response);
                    }
                    return response;
                };
                /**
            * Handles response errors. Simply logs (if enabled) a message and rejects the response.
            *
            * @param response
            * @returns {*}
            */
                FeatureInclusionService.prototype.responseError = function(response) {
                    if (loggingEnabled) {
                        $log.warn(logPrefix + "Unable to evaluate response due to external error");
                    }
                    return $q.reject(response);
                };
                return new FeatureInclusionService(features.slice(0), extensions.slice(0));
            } ];
        });
    })();
})();
//# sourceMappingURL=angular-features.interceptors.js.map
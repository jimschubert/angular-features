/*! angular-features v0.2.0 2015-09-13, Jim Schubert (c) 2015 MIT License */

(function() {
    "use strict";
    // Source: src/all.js
    angular.module("inc.features", [ "inc.features.urlparser", "inc.features.services" ]);
    // Source: src/interceptors.js
    (function() {
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
    // Source: src/url.js
    (function() {
        var purl;
        /* This is a hackish little fake amd loader so Purl source can be copied and pasted. below */
        var define = function(factory) {
            purl = factory();
        };
        define.amd = true;
        angular.module("inc.features.urlparser", []).service("urlparser", [ function() {
            return {
                /**
                     * Parses a URL into a helpful definition of the URL object.
                     *
                     * @param url
                     * @returns {{url: (*|{}), protocol: (*|{}), host: (*|{}), path: (*|{}), directory: (*|{}), file: (*|{}), query: (*|{}), hash: (*|{})}}
                     */
                parse: function(url) {
                    var result = purl(url);
                    return {
                        url: result.attr("url"),
                        protocol: result.attr("protocol"),
                        host: result.attr("host"),
                        path: result.attr("path"),
                        directory: result.attr("directory"),
                        file: result.attr("file"),
                        query: result.attr("query"),
                        hash: result.attr("hash")
                    };
                }
            };
        } ]);
        (function(factory) {
            if (typeof define === "function" && define.amd) {
                define(factory);
            } else {
                window.purl = factory();
            }
        })(function() {
            var tag2attr = {
                a: "href",
                img: "src",
                form: "action",
                base: "href",
                script: "src",
                iframe: "src",
                link: "href",
                embed: "src",
                object: "data"
            }, key = [ "source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "fragment" ], // keys available to query
            aliases = {
                anchor: "fragment"
            }, // aliases for backwards compatability
            parser = {
                strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
                //less intuitive, more accurate to the specs
                loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
            }, isint = /^[0-9]+$/;
            function parseUri(url, strictMode) {
                var str = decodeURI(url), res = parser[strictMode || false ? "strict" : "loose"].exec(str), uri = {
                    attr: {},
                    param: {},
                    seg: {}
                }, i = 14;
                while (i--) {
                    uri.attr[key[i]] = res[i] || "";
                }
                // build query and fragment parameters
                uri.param["query"] = parseString(uri.attr["query"]);
                uri.param["fragment"] = parseString(uri.attr["fragment"]);
                // split path and fragement into segments
                uri.seg["path"] = uri.attr.path.replace(/^\/+|\/+$/g, "").split("/");
                uri.seg["fragment"] = uri.attr.fragment.replace(/^\/+|\/+$/g, "").split("/");
                // compile a 'base' domain attribute
                uri.attr["base"] = uri.attr.host ? (uri.attr.protocol ? uri.attr.protocol + "://" + uri.attr.host : uri.attr.host) + (uri.attr.port ? ":" + uri.attr.port : "") : "";
                return uri;
            }
            function getAttrName(elm) {
                var tn = elm.tagName;
                if (typeof tn !== "undefined") return tag2attr[tn.toLowerCase()];
                return tn;
            }
            function promote(parent, key) {
                if (parent[key].length === 0) return parent[key] = {};
                var t = {};
                for (var i in parent[key]) t[i] = parent[key][i];
                parent[key] = t;
                return t;
            }
            function parse(parts, parent, key, val) {
                var part = parts.shift();
                if (!part) {
                    if (isArray(parent[key])) {
                        parent[key].push(val);
                    } else if ("object" == typeof parent[key]) {
                        parent[key] = val;
                    } else if ("undefined" == typeof parent[key]) {
                        parent[key] = val;
                    } else {
                        parent[key] = [ parent[key], val ];
                    }
                } else {
                    var obj = parent[key] = parent[key] || [];
                    if ("]" == part) {
                        if (isArray(obj)) {
                            if ("" !== val) obj.push(val);
                        } else if ("object" == typeof obj) {
                            obj[keys(obj).length] = val;
                        } else {
                            obj = parent[key] = [ parent[key], val ];
                        }
                    } else if (~part.indexOf("]")) {
                        part = part.substr(0, part.length - 1);
                        if (!isint.test(part) && isArray(obj)) obj = promote(parent, key);
                        parse(parts, obj, part, val);
                    } else {
                        if (!isint.test(part) && isArray(obj)) obj = promote(parent, key);
                        parse(parts, obj, part, val);
                    }
                }
            }
            function merge(parent, key, val) {
                if (~key.indexOf("]")) {
                    var parts = key.split("[");
                    parse(parts, parent, "base", val);
                } else {
                    if (!isint.test(key) && isArray(parent.base)) {
                        var t = {};
                        for (var k in parent.base) t[k] = parent.base[k];
                        parent.base = t;
                    }
                    if (key !== "") {
                        set(parent.base, key, val);
                    }
                }
                return parent;
            }
            function parseString(str) {
                return reduce(String(str).split(/&|;/), function(ret, pair) {
                    try {
                        pair = decodeURIComponent(pair.replace(/\+/g, " "));
                    } catch (e) {}
                    var eql = pair.indexOf("="), brace = lastBraceInKey(pair), key = pair.substr(0, brace || eql), val = pair.substr(brace || eql, pair.length);
                    val = val.substr(val.indexOf("=") + 1, val.length);
                    if (key === "") {
                        key = pair;
                        val = "";
                    }
                    return merge(ret, key, val);
                }, {
                    base: {}
                }).base;
            }
            function set(obj, key, val) {
                var v = obj[key];
                if (typeof v === "undefined") {
                    obj[key] = val;
                } else if (isArray(v)) {
                    v.push(val);
                } else {
                    obj[key] = [ v, val ];
                }
            }
            function lastBraceInKey(str) {
                var len = str.length, brace, c;
                for (var i = 0; i < len; ++i) {
                    c = str[i];
                    if ("]" == c) brace = false;
                    if ("[" == c) brace = true;
                    if ("=" == c && !brace) return i;
                }
            }
            function reduce(obj, accumulator) {
                var i = 0, l = obj.length >> 0, curr = arguments[2];
                while (i < l) {
                    if (i in obj) curr = accumulator.call(undefined, curr, obj[i], i, obj);
                    ++i;
                }
                return curr;
            }
            function isArray(vArg) {
                return Object.prototype.toString.call(vArg) === "[object Array]";
            }
            function keys(obj) {
                var key_array = [];
                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop)) key_array.push(prop);
                }
                return key_array;
            }
            function purl(url, strictMode) {
                if (arguments.length === 1 && url === true) {
                    strictMode = true;
                    url = undefined;
                }
                strictMode = strictMode || false;
                url = url || window.location.toString();
                return {
                    data: parseUri(url, strictMode),
                    // get various attributes from the URI
                    attr: function(attr) {
                        attr = aliases[attr] || attr;
                        return typeof attr !== "undefined" ? this.data.attr[attr] : this.data.attr;
                    },
                    // return query string parameters
                    param: function(param) {
                        return typeof param !== "undefined" ? this.data.param.query[param] : this.data.param.query;
                    },
                    // return fragment parameters
                    fparam: function(param) {
                        return typeof param !== "undefined" ? this.data.param.fragment[param] : this.data.param.fragment;
                    },
                    // return path segments
                    segment: function(seg) {
                        if (typeof seg === "undefined") {
                            return this.data.seg.path;
                        } else {
                            seg = seg < 0 ? this.data.seg.path.length + seg : seg - 1;
                            // negative segments count from the end
                            return this.data.seg.path[seg];
                        }
                    },
                    // return fragment segments
                    fsegment: function(seg) {
                        if (typeof seg === "undefined") {
                            return this.data.seg.fragment;
                        } else {
                            seg = seg < 0 ? this.data.seg.fragment.length + seg : seg - 1;
                            // negative segments count from the end
                            return this.data.seg.fragment[seg];
                        }
                    }
                };
            }
            purl.jQuery = function($) {
                if ($ != null) {
                    $.fn.url = function(strictMode) {
                        var url = "";
                        if (this.length) {
                            url = $(this).attr(getAttrName(this[0])) || "";
                        }
                        return purl(url, strictMode);
                    };
                    $.url = purl;
                }
            };
            purl.jQuery(window.jQuery);
            return purl;
        });
    })();
})();
//# sourceMappingURL=angular-features.js.map
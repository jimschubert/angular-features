# angular-features

[![Join the chat at https://gitter.im/jimschubert/angular-features](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/jimschubert/angular-features?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Code Climate](https://codeclimate.com/github/jimschubert/angular-features/badges/gpa.svg)](https://codeclimate.com/github/jimschubert/angular-features)

Easily constrain client access to beta features.

This isn't meant to be an authorization plugin or to restrict access to areas
of your application. This works more like A-B testing of features for a subset
of users.

## Build

Install grunt:

    npm install -g grunt

Install dependencies:

    npm install -d

Run grunt:

    grunt

## Install

`bower install angular-features`  

## Usage

The http interceptor will, by default, remove any HTML elements in a response
containing the attribute `data-feature`. The
prefix and the feature key are both configurable. To allow a user access to a
feature, strings representing the feature name
(value of the `data-feature` attribute) must be added during the config phase
of AngularJS.

## Example

Include some partial

    <div ng-include="'./partial.html'"></div>

Partial's contents are:

    <div>
        <p>
            <h2>This is an example</h2>
            <em>Feature exclusion should include the example feature below:</em>
        </p>
        <p ng-feature="Sample">
            This is an example feature
        </p>
    </div>

Configure your interceptor to override the feature attribute prefix from the
default of `data` to `ng` and add `Sample` as an available feature (remember to
include `inc.features` dependency). Then push `featureInclusion`
to available interceptors:

    angular.module('myApp',['inc.features'])
            .config(function($httpProvider, featureInclusionProvider){
                featureInclusionProvider
                        .setPrefix('ng')
                        .defineAllFeatures(['Sample']);
                $httpProvider.interceptors.push('featureInclusion');
            });

## Options

_TODO_ List out available options on the interceptor's provider.


# License

(The MIT License)

Copyright (c) 2015 Jim Schubert <james.schubert@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the 'Software'), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Other Licenses

Purl: Licensed under an MIT-style license. See https://github.com/allmarkedup/jQuery-URL-Parser/blob/master/LICENSE for details.
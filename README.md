# angular-features

[![Code Climate](https://codeclimate.com/github/jimschubert/angular-features/badges/gpa.svg)](https://codeclimate.com/github/jimschubert/angular-features)

Easily constrain client access to beta features.

This isn't meant to be an authorization plugin or to restrict access to areas of your application. This works more like A-B testing of features for a subset of users.

## Build

Install grunt:

    npm install -g grunt

Install dependencies:

    npm install -d

Run grunt:

    grunt

## Usage

The http interceptor will, by default, remove any HTML elements in a response containing the attribute `data-feature`. The 
prefix and the feature key are both configurable. To allow a user access to a feature, strings representing the feature name 
(value of the `data-feature` attribute) must be added during the config phase of AngularJS.

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

Configure your interceptor to override the feature attribute prefix from the default of `data` to `ng` and add `Sample` as an available feature (remember to include `inc.features.interceptors` dependency). Then push `featureExclusion` to available interceptors:

    angular.module('myApp',['inc.features.interceptors'])
            .config(function($httpProvider, featureExclusionProvider){
                featureExclusionProvider
                        .setPrefix('ng')
                        .defineAllFeatures(['Sample']);
                $httpProvider.interceptors.push('featureExclusion');
            });

## Options

_TODO_ List out available options on the interceptor's provider.

## Todos

* Close over configured settings to make direct modifications to features a little more difficult
* Expose features via `featureExclusion` service to be consumed by a directive
* Create a directive constructed from `featureExclusion` settings (e.g. `data-feature` or `ng-feature`, whatever is configured)

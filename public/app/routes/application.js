// Copyright, 2013-2014, by Tomas Korcak. <korczis@gmail.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

(function (global) {
    require
    (
        ["ember", "app", "jquery"], function (Ember, App, $) {

            App.SearchInputComponent = Ember.TextField.extend({
                classNames: ["search-input"],
                attributeBindings: ['placeholder'],

                hints: Ember.A([
                    "potraviny",
                    "autoservis",
                    "telefony",
                    "restaurace",
                    "taxi"
                ]),

                placeholder: "Type your search query!",

                becomeFocused: function() {
                   // this.$().focus();
                }.on('didInsertElement')
            });

            App.ApplicationView = Ember.View.extend({
                classNames: ['app-view'],
                templateName: "application",

                /**
                 * Called when inserted to DOM.
                 * @memberof Application.ApplicationView
                 * @instance
                 */
                didInsertElement: function () {
                    console.log("App.ApplicationView.didInsertElement()");
                }
            });

            App.IndexRoute = Ember.Route.extend({
                model: function() {
                    return [];
                },

                setupController: function(controller, model) {
                    controller.set('results', model);
                }
            });

            App.IndexController = Ember.Controller.extend({
                results: Ember.A([]),

                query: Ember.Object.create({
                   q: ""
                }),

                updateResults: function() {
                    var q = this.get('query.q');
                    if(!q || q === "") {
                        this.set('results', []);
                        return;
                    }

                    console.log("Searching '" + q + "'");

                    var url = "/query?q=" + q;

                    var self = this;
                    $.get(url, function( data ) {
                        self.set('results', data);
                    });

                },

                searchAsYouTypeHandler: function() {
                    this.updateResults();
                }.observes('query.q'),

                actions: {
                    search: function() {
                        this.updateResults();
                    }
                }
            });
        }
    );
})(this);
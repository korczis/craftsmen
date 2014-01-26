/*
 Copyright, 2013, by Tomas Korcak. <korczis@gmail.com>

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

(function (global) {
    require
    (
        ["ember", "app"], function (Ember, App) {

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
                    return [{
                        "_id": "51bbba16482e431e98002f08",
                        "value": {
                            "data": {
                                "address": {},
                                "categories": [],
                                "createdAt": "2013-06-22 00:15:59 UTC",
                                "name": " ARCH ESTATES, s.r.o. ",
                                "profileUrl": "http://www.firmy.cz/detail/12728186-arch-estates-praha-nove-mesto.html",
                                "updatedAt": "2013-06-22 00:15:59 UTC"
                            },
                            "dataset": "companies"
                        }
                    },
                        {
                            "_id": "51bf777f482e431278000410",
                            "value": {
                                "data": {
                                    "address": {},
                                    "categories": [],
                                    "createdAt": "2013-07-06 13:14:17 UTC",
                                    "name": " Adéla Kopecká ",
                                    "profileUrl": "http://www.firmy.cz/detail/628486-adela-kopecka-praha-podoli.html",
                                    "updatedAt": "2013-07-06 13:14:17 UTC"
                                },
                                "dataset": "companies"
                            }
                        },
                        {
                            "_id": "51be9546482e431f24003485",
                            "value": {
                                "data": {
                                    "address": {},
                                    "categories": [],
                                    "createdAt": "2013-07-04 01:11:43 UTC",
                                    "name": " Animalia, s.r.o. ",
                                    "profileUrl": "http://www.firmy.cz/detail/1968392-animalia-praha-vinohrady.html",
                                    "updatedAt": "2013-07-04 01:11:43 UTC"
                                },
                                "dataset": "companies"
                            }
                        },
                        {
                            "_id": "51bcbd8a482e431e98008373",
                            "value": {
                                "data": {
                                    "address": {},
                                    "categories": [],
                                    "createdAt": "2013-06-23 04:45:10 UTC",
                                    "name": " BONDTOUR, s.r.o. ",
                                    "profileUrl": "http://www.firmy.cz/detail/312259-bondtour-praha-zizkov.html",
                                    "updatedAt": "2013-06-23 04:45:10 UTC"
                                },
                                "dataset": "companies"
                            }
                        }
                    ];
                },

                setupController: function(controller, model) {
                    controller.set('results', model);
                }
            });

            App.IndexController = Ember.Controller.extend({
                results: Ember.A([])
            });
        }
    );
})(this);
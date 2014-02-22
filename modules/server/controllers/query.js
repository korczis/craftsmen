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

(function () {
    'use strict';

    var define = require('amdefine')(module);

    /**
     * Array of modules this one depends on.
     * @type {Array}
     */
    var deps = [
        '../controller',
        'fs',
        'mongodb',
        'path',
        'querystring',
        'request',
        'util'
    ];

    define(deps, function(Controller, fs, Mongo, path, querystring, request, util) {
        var ObjectID = Mongo.ObjectID;

        var exports = module.exports = function HelloController(server) {
            HelloController.super_.call(this, server);

            return this;
        };

        util.inherits(exports, Controller);

        exports.prototype.server = null;

        exports.prototype.init = function() {
            var server = this.server;
            var app = server.app;
            var mongo = server.mongo;

            app.get('/query', function (req, res) {
                var col = server.mongo.getCollection('datasets').then(function (coll) {
                    var q = req.query.q || "";
                    q = q.replace(" ", ".*");

                    coll.find({'value.data.name': new RegExp(q, "i")}).limit(10).toArray(function (err, data) {
                        var stripped = data.map(function (item) {
                            delete item.value.data.profileUrl;
                            delete item.value.data.categories;
                            delete item.value.data.gps;
                            delete item.value.data.logo;
                            return item;
                        });

                        res.json(stripped);
                    }).done(function(res) {
                        d.resolve(res);
                    }, function(err) {
                        throw err;
                    });
                });
            });

            app.get('/fts', function (req, res) {
                var col = server.mongo.getCollection('datasets').then(function (coll) {
                    var term = req.query.q || "";
                    var tokens = term.split(',');

                    var qTemplate = '(cs_description:(QUERY) OR cs_name:(QUERY))';
                    if (tokens.length > 1) {
                        qTemplate += ' AND cs_address_city:(ADDRESS_CITY)';
                    }

                    var query = qTemplate;

                    var re = new RegExp("QUERY", 'g');
                    query = query.replace(re, tokens[0]);

                    if (tokens.length > 1) {
                        re = new RegExp("ADDRESS_CITY", 'g');
                        query = query.replace(re, tokens[1]);
                    }

                    var query = {
                        q: query,
                        wt: "json",
                        indent: 1
                    };

                    var url = server.config.solr.uri + '/select?' + querystring.stringify(query);

                    console.log(url);

                    request(url, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            var bodyObj = JSON.parse(body);

                            var ids = [];
                            bodyObj.response.docs.map(function (item) {
                                ids.push(ObjectID.createFromHexString(item.id));
                            });

                            coll.find({'_id': {$in: ids}}).limit(10).toArray(function (err, data) {
                                var stripped = data.map(function (item) {
                                    delete item.value.data.profileUrl;
                                    delete item.value.data.categories;
                                    delete item.value.data.gps;
                                    delete item.value.data.logo;
                                    return item;
                                });

                                res.json({
                                    stats: {
                                        execTime: bodyObj.responseHeader.QTime * 0.001,
                                        totalCount: bodyObj.response.numFound
                                    },
                                    results: stripped
                                });
                            });
                        }
                    })
                });
            });
        };

    });

}());


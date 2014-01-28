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

    var querystring = require('querystring'),
        request = require('request'),
        ObjectID = require('mongodb').ObjectID;

    var exports = module.exports = function (microscratch, app) {

        app.get('/query', function (req, res) {
            var col = microscratch.mongo.getCollection('datasets').then(function (coll) {
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
                });
            });
        });

        app.get('/fts', function (req, res) {
            var col = microscratch.mongo.getCollection('datasets').then(function (coll) {

                var q = req.query.q || "";

                var qTemplate = 'cs_description:"QUERY" OR cs_name:"QUERY"';
                var re = new RegExp("QUERY", 'g');

                var url = microscratch.config.solr.uri + '/select?' + querystring.stringify({
                    q: qTemplate.replace(re, q),
                    wt: "json",
                    indent: 1
                });

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

                            res.json(stripped);
                        });
                    }
                })
            });
        });
    };

}());

﻿// Copyright, 2013-2014, by Tomas Korcak. <korczis@gmail.com>
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

    var deferred = require('deferred'),
        fs = require('fs'),
        logger = require('../logger'),
        mongodb = require('mongodb'),
        mongoose = require('mongoose'),
        path = require('path');

    /**
     * Mongo wrapper
     * @type {Mongo}
     */
    var exports = module.exports = function Mongo(config) {
        this.config = config;
        this.collections = {};
        this.models = {};
    };

    /**
     * Config to be used
     * @type {object}
     */
    exports.prototype.config = null;

    /**
     * Active MongoDB database
     * @type {object}
     */
    exports.prototype.db = null;

    /**
     * Preloaded collections
     * @type {array}
     */
    exports.prototype.collections = null;

    /**
     * Loaded models
     * @type {null}
     */
    exports.prototype.models = null;

    /**
     * Connects to mongo
     * @returns {*} Promise
     */
    exports.prototype.connect = function () {
        var d = deferred();

        var MongoClient = require('mongodb').MongoClient;

        var self = this;

        MongoClient.connect(this.config.mongo.uri, function (err, db) {
            if (err) {
                throw new Error("Cannot connect to DB '" + self.config.mongo.uri + "'");
            }

            if (self.config.verbose) {
                logger.log("Connected to DB '" + self.config.mongo.uri + "'");
            }

            self.db = db;
            d.resolve(self.db);
        });

        return d.promise();
    };

    /**
     * Loads collection by name and caches it (do not use for BIG collections!)
     * @param collectionName {string} Name of the collection to be loaded
     * @returns {*} Promise
     */
    exports.prototype.loadCollection = function (collectionName) {
        var d = deferred();

        if (this.config.verbose) {
            logger.log("Loading collection '" + collectionName + "'");
        }


        var collection = this.db.collection(collectionName);

        var self = this;
        collection.find().toArray(function (err, data) {
            if (err) {
                d.reject(new Error(err));
                return;
            }

            self.collections[collectionName] = data;

            d.resolve(data);
        });

        return d.promise();
    };

    /**
     * Returns loaded collection by name as promise
     * @param collectionName
     * @returns {*}
     */
    exports.prototype.getCollection = function (collectionName) {
        if (this.config.verbose) {
            logger.log("Loading collection '" + collectionName + "'");
        }

        var collection = this.db.collection(collectionName);

        return deferred(collection);
    };

    exports.prototype.initializeModels = function () {
        var d = deferred();

        var self = this;
        var modelsDir = path.join(__dirname, "models");
        fs.readdir(modelsDir, function (err, files) {
            var res = {};

            files.forEach(function (file) {
                var parts = file.split(".");
                if(parts.length == 2 && parts[1].toLowerCase() == "js") {
                    var fullPath = modelsDir + '/' + file;

                    var relPath = path.relative(__dirname, fullPath);
                    logger.log("Loading model file '" + relPath + "'");

                    var modelName = parts[0];

                    var Model = require(fullPath);
                    var model = new Model(this);
                    res[modelName] = model;
                }
            });

            console.log(res);

            self.models = res;
            d.resolve(self);
        });

        return d.promise();
    };


    /**
     * Initializes Mongo wrapper
     * @returns {*} Promise
     */
    exports.prototype.initialize = function () {
        var d = deferred();

        var self = this;
        this.connect().then(function (res) {
            return self.initializeModels();
        }).then(function (res) {
                var opt = self.config.mongo.watcher;

                if (opt !== null && opt !== undefined && opt.toString() === "true" || opt.toString() === "1") {
                    var Watcher = require('./watcher.js');
                    self.watcher = new Watcher(self);

                    return self.watcher.initialize();
                } else {
                    d.resolve(self);
                }

            });

        return d.promise();
    };

}());
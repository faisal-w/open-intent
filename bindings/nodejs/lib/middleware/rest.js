/*
|---------------------------------------------------------|
|    ___                   ___       _             _      |
|   / _ \ _ __   ___ _ __ |_ _|_ __ | |_ ___ _ __ | |_    |
|  | | | | '_ \ / _ \ '_ \ | || '_ \| __/ _ \ '_ \| __|   |
|  | |_| | |_) |  __/ | | || || | | | ||  __/ | | | |_    |
|   \___/| .__/ \___|_| |_|___|_| |_|\__\___|_| |_|\__|   |
|        |_|                                              |
|                                                         |
|     - The users first...                                |
|                                                         |
|     Authors:                                            |
|        - Clement Michaud                                |
|        - Sergei Kireev                                  |
|                                                         |
|     Version: 1.0.0                                      |
|                                                         |
|---------------------------------------------------------|

The MIT License (MIT)
Copyright (c) 2016 - Clement Michaud, Sergei Kireev

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
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
module.exports = function(port) {
    return new MiddlewareInterface(port);
};


var express = require('express');
var bodyParser = require('body-parser');
var Q = require('q');


function talk(req, res) {
    var chatbot = req.app.get('chatbot');
    var sessionId = req.params.sessionId;
    var message = req.body.message;

    chatbot.talk(sessionId, message)
    .then(function(replies) {
        res.json({ 'replies': replies });
    }).fail(function(err) {
        res.status(500).send({'message': err});
    });
}


function setstate(req, res) {
    var chatbot = req.app.get('chatbot');
    var sessionId = req.params.sessionId;
    var state = req.body.state;

    chatbot.setState(sessionId, state)
    .then(function(state) {
        res.json({ 'message': 'OK' });
    })
    .fail(function(err) {
        res.status(500).send({'message': err});
    });
}

function getstate(req, res) {
    var chatbot = req.app.get('chatbot');
    var sessionId = req.params.sessionId;

    chatbot.getState(sessionId)
    .then(function(state) {
        res.json({ 'state': state });
    })
    .fail(function(err) {
        res.status(500).send({'message': err});
    });
}


function MiddlewareInterface(port) {
    var _this = this;
    this._app = express();
    this._server = undefined;

    this.attach = function(chatbot) {
        var deferred = Q.defer();
        _this._app.use(bodyParser.json()); // support json encoded bodies
        _this._app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
        _this._app.set('chatbot', chatbot);

        _this._app.get('/state/:sessionId', getstate);
        _this._app.put('/state/:sessionId', setstate);
        _this._app.post('/talk/:sessionId', talk);
        deferred.resolve();
        return deferred.promise;
    };

    this.detach = function() {
        if(_this._server) {
            _this._server.close();
        }
    };

    this.start = function() {
        var deferred = Q.defer();
        var _port = (port) ? port : 8080;

        _this._server = _this._app.listen(_port, function() {
            deferred.resolve();
        });
        return deferred.promise;
    }
}

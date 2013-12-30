var pokerConnection = require('../../lib/poker-connection');

describe('poker-connection', function() {
    describe('#getNewHandler', function() {
        it('creates a new and unique handler', function() {
            var handler1 = pokerConnection.getNewHandler();
            var handler2 = pokerConnection.getNewHandler();

            expect(handler1).toNotBe(handler2);
        });
    });

    describe('#init', function() {
        it('should be initialized', function() {
            var currentUsers = [1,2,3];
            var carddisplay = [8,13,20];
            var connectionHandler = pokerConnection.getNewHandler();

            connectionHandler.init(currentUsers, carddisplay);

            expect(connectionHandler.pokerData).toEqual({
                "users": currentUsers,
                "carddisplay": carddisplay
            });
        });
    });

    describe('#setConnection/#getConnection', function() {
        it('should set and get a connection', function() {
            var connectionMock = {
                on: function(type, callback) {}
            };
            spyOn(connectionMock, 'on');

            var connectionHandler = pokerConnection.getNewHandler();
            connectionHandler.init(null, null);
            connectionHandler.setConnection(connectionMock);

            expect(connectionMock.on).toHaveBeenCalledWith('message', jasmine.any(Function));
            expect(connectionMock.on).toHaveBeenCalledWith('close', jasmine.any(Function));
            expect(connectionHandler.getConnection()).toBe(connectionMock);
        });
    });

    describe('#onclose', function() {
        it('should remove all connection listeners when connection is closed', function() {
            var connectionMock = {
                on: function() {},
                removeAllListeners: function() {}
            };
            spyOn(connectionMock, 'removeAllListeners');

            var connectionHandler = pokerConnection.getNewHandler();
            connectionHandler.init(null, null);
            connectionHandler.setConnection(connectionMock);

            connectionHandler.onclose();
            expect(connectionMock.removeAllListeners).toHaveBeenCalled();
        });

        it('should remove the user and all listeners when connection is closed', function() {
            var connectionMock = {
                on: function() {},
                removeAllListeners: function() {}
            };
            spyOn(connectionMock, 'on');

            var usersMock = {
                remove: function() {}
            };
            spyOn(usersMock, 'remove');

            var carddisplayMock = {
                removeCard: function() {}
            };
            spyOn(carddisplayMock, 'removeCard');

            var userIdMock = 'foobar';

            var connectionHandler = pokerConnection.getNewHandler();
            connectionHandler.init(usersMock, carddisplayMock);
            connectionHandler.setConnection(connectionMock);
            connectionHandler.user = {
                id: userIdMock
            };

            connectionHandler.onclose();

            expect(usersMock.remove).toHaveBeenCalledWith(userIdMock);
            expect(carddisplayMock.removeCard).toHaveBeenCalledWith(userIdMock);
            expect(connectionMock.on).toHaveBeenCalledWith('message', jasmine.any(Function));
            expect(connectionMock.on).toHaveBeenCalledWith('close', jasmine.any(Function));
        });
    });

    describe('#onmessage', function() {
        it('should emit message receival if message type is utf8', function(done) {
            var connectionHandler = pokerConnection.getNewHandler();
            connectionHandler.init(null, null);

            var expectedMessageData = {
                type: 'login',
                foo: 'bar'
            };

            var message = {
                type: 'utf8',
                utf8Data: JSON.stringify(expectedMessageData)
            };

            connectionHandler.on(expectedMessageData.type, function(messageData, scope) {
                expect(messageData).toEqual(messageData);
                expect(scope).toBe(connectionHandler);
                done();
            });

            connectionHandler.onmessage(message);
        });

        it('should do nothing, if received message is not utf8', function() {
            var callbackMock = {
                login: function(messageData, scope) {}
            };
            spyOn(callbackMock, 'login');

            var connectionHandler = pokerConnection.getNewHandler();
            connectionHandler.init(null, null);

            var expectedMessageData = {
                type: 'login',
                foo: 'bar'
            };

            var message = {
                type: 'binary',
                utf8Data: JSON.stringify(expectedMessageData)
            };

            connectionHandler.on(expectedMessageData.type, callbackMock.login);
            connectionHandler.onmessage(message);
            expect(callbackMock.login).not.toHaveBeenCalled();
        });
    });

    describe('#setUser/#getUser', function() {
        it('sets and gets a user', function() {
            var userMock = {};
            var connectionHandler = pokerConnection.getNewHandler();
            connectionHandler.setUser(userMock);
            expect(connectionHandler.getUser()).toBe(userMock);
        });
    });
});
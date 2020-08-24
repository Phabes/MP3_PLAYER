module.exports = {

    checkUserExistRegister(_db, database, login, callback) {
        _db.db(database).listCollections().toArray(function(err, colls) {
            if (err)
                callback("NOT_CREATED")
            else {
                let userData = colls.find((coll) => coll.name.toLowerCase() == login.toLowerCase())
                if (userData == undefined)
                    callback("NOT_EXIST")
                else if (userData.name != login)
                    callback("EXIST_LETTER")
                else
                    callback("EXIST")
            }
        })
    },

    checkUserExistLogin(_db, database, login, callback) {
        _db.db(database).listCollections().toArray(function(err, colls) {
            if (err)
                callback("NOT_CREATED")
            else {
                let check = colls.find((coll) => coll.name == login)
                if (check == undefined)
                    callback("NOT_EXIST")
                else
                    callback("EXIST")
            }
        })
    },

    createUser(_db, database, login, callback) {
        _db.db(database).createCollection(login, function(err, coll) {
            if (err)
                callback("NOT_CREATED")
            else
                callback("CREATED")
        })
    },

    checkIfEmptyUser(_db, database, login, callback) {
        _db.db(database).collection(login).find({}).toArray(function(err, colls) {
            if (err)
                callback("NOT_CHECKED")
            else {
                if (colls.length > 0)
                    callback("EXIST")
                else
                    callback("EMPTY")
            }
        })
    },

    insertUserFirstData(_db, database, login, password, callback) {
        let data = {
            password: password,
            loggedIn: false,
            playlists: []
        }
        _db.db(database).collection(login).insert(data, function(err, result) {
            if (err)
                callback("NOT_CREATED")
            else
                callback("CREATED")
        })
    },

    deleteUser(_db, database, login, callback) {
        _db.db(database).collection(login).drop(function(err, result) {
            if (err)
                callback("NOT_DELETED")
            else
                callback("DELETED")
        })
    },

    createPlaylistUser: function(ObjectID, _db, database, login, newPlaylist, userData, callback) {
        let id = userData._id
        delete userData._id
        let obj = {
            name: newPlaylist,
            songs: []
        }
        userData.playlists.push(obj)
        _db.db(database).collection(login).updateOne({ _id: ObjectID(id) }, userData, function(err, data) {
            if (err)
                callback("NOT_CREATED")
            else
                callback("CREATED")
        })
    },

    addToPlaylistUser: function(ObjectID, _db, database, login, playlistName, userData, songInfo, callback) {
        let id = userData._id
        delete userData._id
        let playlistIndexToAdd = userData.playlists.findIndex(playlist => playlist.name == playlistName)
        let add = true
        userData.playlists[playlistIndexToAdd].songs.forEach(file => {
            if (file.album == songInfo.album && file.title == songInfo.title)
                add = false
        })
        if (add) {
            userData.playlists[playlistIndexToAdd].songs.push(songInfo)
            _db.db(database).collection(login).updateOne({ _id: ObjectID(id) }, userData, function(err, data) {
                if (err)
                    callback("NOT_ADDED")
                else
                    callback("ADDED")
            })
        }
        else
            callback("EXIST")
    },

    loadPlaylistUser: function(_db, database, login, playlistName, callback) {
        _db.db(database).collection(login).find({}).toArray(function(err, items) {
            let obj
            if (err)
                obj = { actionBack: "NOT_SELECTED" }
            else {
                let songs = items[0].playlists.find(function(playlist) {
                    return playlist.name == playlistName
                }).songs
                obj = {
                    actionBack: "SELECTED",
                    files: songs
                }
            }
            callback(obj)
        })
    },

    deletePlaylistUser: function(ObjectID, _db, database, login, playlistName, userData, callback) {
        let id = userData._id
        delete userData._id
        let playlistIndexToRemove = userData.playlists.findIndex(playlist => playlist.name == playlistName)
        userData.playlists.splice(playlistIndexToRemove, 1)
        _db.db(database).collection(login).updateOne({ _id: ObjectID(id) }, userData, function(err, data) {
            if (err)
                callback("NOT_DELETED")
            else
                callback("DELETED")
        })
    },

    deleteFromPlaylistUser: function(ObjectID, _db, database, login, playlistName, songIndex, userData, callback) {
        let id = userData._id
        delete userData._id
        let playlistIndexToRemove = userData.playlists.findIndex(playlist => playlist.name == playlistName)
        userData.playlists[playlistIndexToRemove].songs.splice(songIndex, 1)
        _db.db(database).collection(login).updateOne({ _id: ObjectID(id) }, userData, function(err, data) {
            if (err)
                callback("NOT_DELETED")
            else
                callback("DELETED")
        })
    },

    getUserData(_db, database, login, callback) {
        _db.db(database).collection(login).find({}).toArray(function(err, colls) {
            if (err)
                callback({ actionBack: "NOT_LOADED" })
            else {
                let obj = {
                    actionBack: "LOADED",
                    userData: colls[0]
                }
                callback(obj)
            }
        })
    }

}
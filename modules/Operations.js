module.exports = {

    createPlaylist: function(_db, database, newPlaylist, callback) {
        _db.db(database).createCollection(newPlaylist, function(err, coll) {
            if (err) {
                console.log(err)
                callback("NOT_CREATED")
            }
            else
                callback("CREATED")
        })
    },

    showPlaylists(_db, database, callback) {
        _db.db(database).listCollections().toArray(function(err, colls) {
            let obj
            if (err) {
                console.log(err)
                obj = { actionBack: "NOT_LOADED" }
            }
            else {
                obj = {
                    actionBack: "LOADED",
                    playlists: colls
                }
            }
            callback(obj)
        })
    },

    addToPlaylist: function(_db, database, playlistName, songInfo, callback) {
        _db.db(database).collection(playlistName).find({}).toArray(function(err, items) {
            if (err)
                callback("NOT_ADDED")
            else {
                let add = true
                items.forEach(file => {
                    if (file.album == songInfo.album && file.title == songInfo.title)
                        add = false
                })
                if (add) {
                    _db.db(database).collection(playlistName).insert(songInfo, function(err, result) {
                        if (err)
                            callback("NOT_ADDED")
                        else
                            callback("ADDED")
                    })
                }
                else
                    callback("EXIST")
            }
        })
    },

    findInPlaylist: function(_db, database, playlistName, songInfo, callback) {
        _db.db(database).collection(playlistName).find(songInfo).toArray(function(err, items) {
            if (err)
                callback({ actionBack: "NOT_FOUND" })
            else {
                callback({
                    actionBack: "FOUND",
                    song: items[0]
                })
            }
        })
    },

    loadPlaylist: function(_db, database, playlistName, callback) {
        _db.db(database).collection(playlistName).find({}).toArray(function(err, items) {
            let obj
            if (err)
                obj = { actionBack: "NOT_SELECTED" }
            else {
                obj = {
                    actionBack: "SELECTED",
                    files: items
                }
            }
            callback(obj)
        })
    },

    deletePlaylist: function(_db, database, playlist, callback) {
        _db.db(database).collection(playlist).drop(function(err, result) {
            if (err) {
                console.log(err)
                callback("NOT_DELETED")
            }
            else
                callback("DELETED")
        })
    },

    deleteFromPlaylist: function(ObjectID, _db, database, playlist, id, callback) {
        _db.db(database).collection(playlist).remove({ _id: ObjectID(id) }, function(err, data) {
            if (err)
                callback("NOT_DELETED")
            else
                callback("DELETED")
        })
    }

}
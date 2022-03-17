const http = require("http");
const qs = require("querystring");
const fs = require("fs");
const getMP3Duration = require("get-mp3-duration");
const mongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;
const opers = require("./modules/Operations.js");
const opersUser = require("./modules/OperationsUser.js");
const port = process.env.PORT || 3000;

let dirsArray = [],
  filesArray = [],
  playlists = [];
let _db;

const server = http.createServer(function (req, res) {
  switch (req.method) {
    case "GET":
      req.url = decodeURI(req.url);
      console.log(req.url);
      if (!req.url.includes(".")) {
        fs.readFile("static/index.html", function (error, data) {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.write(data);
          res.end();
        });
      }
      if (req.url == "/login.html") {
        fs.readFile("static/login.html", function (error, data) {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.write(data);
          res.end();
        });
      }
      if (req.url == "/register.html") {
        fs.readFile("static/register.html", function (error, data) {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.write(data);
          res.end();
        });
      } else if (req.url.indexOf(".css") != -1) {
        fs.readFile("static" + req.url, function (error, data) {
          res.writeHead(200, { "Content-Type": "text/css" });
          res.write(data);
          res.end();
        });
      } else if (req.url.indexOf(".ico") != -1) {
        fs.readFile("static" + req.url, function (error, data) {
          res.writeHead(200, { "Content-Type": "image/x-icon" });
          res.write(data);
          res.end();
        });
      } else if (req.url.indexOf(".js") != -1) {
        fs.readFile("static" + req.url, function (error, data) {
          res.writeHead(200, { "Content-Type": "application/javascript" });
          res.write(data);
          res.end();
        });
      } else if (req.url.indexOf(".png") != -1) {
        fs.readFile("static" + req.url, function (error, data) {
          res.writeHead(200, { "Content-Type": "image/png" });
          res.write(data);
          res.end();
        });
      } else if (req.url.indexOf(".jpg") != -1) {
        fs.readFile("static" + req.url, function (error, data) {
          res.writeHead(200, { "Content-Type": "image/jpeg" });
          res.write(data);
          res.end();
        });
      } else if (req.url.indexOf(".mp3") != -1) {
        fs.readFile("static" + req.url, function (error, data) {
          res.writeHead(200, { "Content-Type": "audio/mpeg" });
          res.write(data);
          res.end();
        });
      }
      break;
    case "POST":
      servResponse(req, res);
      break;
  }
});

function servResponse(req, res) {
  let allData = "";

  req.on("data", function (data) {
    console.log("data: " + data);
    allData += data;
  });

  req.on("end", function (data) {
    let finish = qs.parse(allData);
    console.log(finish.action);
    switch (finish.action) {
      case "CREATE_CONNECTION":
        createConnection(finish, function (data) {
          res.end(JSON.stringify(data, null, 5));
        });
        break;
      case "LOAD_ALBUM":
        createData(finish.albumName, function (data) {
          res.end(JSON.stringify(data, null, 5));
        });
        break;
      case "SHOW_PLAYLISTS":
        opers.showPlaylists(_db, finish.databaseName, function (data) {
          let obj = { actionBack: data.actionBack };
          if (obj.actionBack == "LOADED")
            obj.playlists = data.playlists.map(function (playlist) {
              return playlist.name;
            });
          res.end(JSON.stringify(obj, null, 5));
        });
        break;
      case "SHOW_PLAYLISTS_USER":
        opersUser.getUserData(
          _db,
          finish.databaseName,
          finish.login,
          function (data) {
            let obj = { actionBack: data.actionBack };
            if (obj.actionBack == "LOADED")
              obj.playlists = data.userData.playlists.map(function (playlist) {
                return playlist.name;
              });
            res.end(JSON.stringify(obj, null, 5));
          }
        );
        break;
      case "CREATE_PLAYLIST":
        opers.createPlaylist(
          _db,
          finish.databaseName,
          finish.playlistName,
          function (data) {
            res.end(data);
          }
        );
        break;
      case "CREATE_PLAYLIST_USER":
        opersUser.getUserData(
          _db,
          finish.databaseName,
          finish.login,
          function (data) {
            if (data.actionBack == "LOADED") {
              opersUser.createPlaylistUser(
                ObjectID,
                _db,
                finish.databaseName,
                finish.login,
                finish.playlistName,
                data.userData,
                function (data2) {
                  res.end(data2);
                }
              );
            } else res.end("NOT_CREATED");
          }
        );
        break;
      case "ADD_TO_PLAYLIST":
        var songInfo = JSON.parse(finish.songInfo, 5, null);
        opers.addToPlaylist(
          _db,
          finish.databaseName,
          finish.playlistName,
          songInfo,
          function (data) {
            opers.findInPlaylist(
              _db,
              finish.databaseName,
              finish.playlistName,
              songInfo,
              function (data2) {
                let obj = {
                  actionBack: data,
                  song: data2.song,
                };
                res.end(JSON.stringify(obj, null, 5));
              }
            );
          }
        );
        break;
      case "ADD_TO_PLAYLIST_USER":
        var songInfo = JSON.parse(finish.songInfo, 5, null);
        opersUser.getUserData(
          _db,
          finish.databaseName,
          finish.login,
          function (data) {
            if (data.actionBack == "LOADED") {
              opersUser.addToPlaylistUser(
                ObjectID,
                _db,
                finish.databaseName,
                finish.login,
                finish.playlistName,
                data.userData,
                songInfo,
                function (data2) {
                  res.end(data2);
                }
              );
            } else res.end("NOT_ADDED");
          }
        );
        break;
      case "LOAD_PLAYLIST":
        opers.loadPlaylist(
          _db,
          finish.databaseName,
          finish.playlistName,
          function (data) {
            data.dirs = dirsArray;
            res.end(JSON.stringify(data, null, 5));
          }
        );
        break;
      case "LOAD_PLAYLIST_USER":
        opersUser.loadPlaylistUser(
          _db,
          finish.databaseName,
          finish.login,
          finish.playlistName,
          function (data) {
            data.dirs = dirsArray;
            res.end(JSON.stringify(data, null, 5));
          }
        );
        break;
      case "DELETE_PLAYLIST":
        opers.deletePlaylist(
          _db,
          finish.databaseName,
          finish.playlistName,
          function (data) {
            res.end(data);
          }
        );
        break;
      case "DELETE_PLAYLIST_USER":
        opersUser.getUserData(
          _db,
          finish.databaseName,
          finish.login,
          function (data) {
            if (data.actionBack == "LOADED") {
              opersUser.deletePlaylistUser(
                ObjectID,
                _db,
                finish.databaseName,
                finish.login,
                finish.playlistName,
                data.userData,
                function (data2) {
                  res.end(data2);
                }
              );
            } else res.end("NOT_DELETED");
          }
        );
        break;
      case "DELETE_FROM_PLAYLIST":
        var songInfo = JSON.parse(finish.songInfo, 5, null);
        opers.deleteFromPlaylist(
          ObjectID,
          _db,
          finish.databaseName,
          finish.playlistName,
          songInfo._id,
          function (data) {
            res.end(data);
          }
        );
        break;
      case "DELETE_FROM_PLAYLIST_USER":
        opersUser.getUserData(
          _db,
          finish.databaseName,
          finish.login,
          function (data) {
            if (data.actionBack == "LOADED") {
              opersUser.deleteFromPlaylistUser(
                ObjectID,
                _db,
                finish.databaseName,
                finish.login,
                finish.playlistName,
                finish.songIndex,
                data.userData,
                function (data) {
                  res.end(data);
                }
              );
            } else res.end("NOT_DELETED");
          }
        );
        break;
      case "REGISTER_USER":
        opersUser.checkUserExistRegister(
          _db,
          finish.databaseName,
          finish.login,
          function (data) {
            if (data == "NOT_EXIST") {
              opersUser.createUser(
                _db,
                finish.databaseName,
                finish.login,
                function (data2) {
                  if (data2 == "CREATED") {
                    opersUser.insertUserFirstData(
                      _db,
                      finish.databaseName,
                      finish.login,
                      finish.password,
                      function (data3) {
                        if (data3 == "CREATED") res.end(data3);
                        else {
                          opersUser.deleteUser(
                            _db,
                            finish.databaseName,
                            finish.login,
                            function (data4) {
                              res.end(data4);
                            }
                          );
                        }
                      }
                    );
                  } else res.end(data2);
                }
              );
            } else if (data == "EXIST") {
              opersUser.checkIfEmptyUser(
                _db,
                finish.databaseName,
                finish.login,
                function (data2) {
                  if (data2 == "EMPTY") {
                    opersUser.insertUserFirstData(
                      _db,
                      finish.databaseName,
                      finish.login,
                      finish.password,
                      function (data3) {
                        if (data3 == "CREATED") res.end(data3);
                        else {
                          opersUser.deleteUser(
                            _db,
                            finish.databaseName,
                            finish.login,
                            function (data4) {
                              res.end(data4);
                            }
                          );
                        }
                      }
                    );
                  } else res.end(data2);
                }
              );
            } else res.end(data);
          }
        );
        break;
      case "LOGIN_USER":
        opersUser.checkUserExistLogin(
          _db,
          finish.databaseName,
          finish.login,
          function (data) {
            if (data == "EXIST") {
              opersUser.checkIfEmptyUser(
                _db,
                finish.databaseName,
                finish.login,
                function (data2) {
                  if (data2 == "EMPTY") {
                    opersUser.deleteUser(
                      _db,
                      finish.databaseName,
                      finish.login,
                      function (data3) {
                        res.end(data3);
                      }
                    );
                  } else if (data2 == "EXIST") {
                    opersUser.getUserData(
                      _db,
                      finish.databaseName,
                      finish.login,
                      function (data3) {
                        if (data3.actionBack == "LOADED") {
                          if (data3.userData.password == finish.password)
                            res.end("LOGGED");
                          else res.end("NOT_LOGGED");
                        } else res.end(data3.actionBack);
                      }
                    );
                  } else res.end(data2);
                }
              );
            } else res.end(data);
          }
        );
        break;
    }
  });
}

function createConnection(finish, callback) {
  mongoClient.connect(
    finish.address,
    { useNewUrlParser: true, useUnifiedTopology: true },
    function (err, db) {
      if (err) {
        console.log(err);
        callback("NOT_CONNECTED");
      } else {
        _db = db;
        callback("CONNECTED");
      }
    }
  );
}

function createData(albumName, callback) {
  (dirsArray = []), (filesArray = []);
  fs.readdir("static/mp3", function (err, directories) {
    if (err) return console.log(err);
    directories.forEach((dirName) => {
      dirsArray.push(dirName);
    });
    fs.readdir("static/mp3/" + albumName, function (err, files) {
      if (err) return console.log(err);
      files.forEach(function (songName) {
        let stats = fs.statSync("static/mp3/" + albumName + "/" + songName);
        let songSize = (stats.size / (1024 * 1024)).toFixed(2) + " MB";
        let buffer = fs.readFileSync(
          "static/mp3/" + albumName + "/" + songName
        );
        let songDuration = getMP3Duration(buffer) / 1000;
        let min = Math.floor(songDuration / 60);
        let sec = Math.floor(songDuration % 60);
        if (sec < 10) sec = "0" + sec;
        let time = min + ":" + sec;
        let obj = {
          album: albumName,
          title: songName,
          size: songSize,
          duration: time,
        };
        filesArray.push(obj);
      });
      let all = {
        dirs: dirsArray,
        files: filesArray,
      };
      callback(all);
    });
  });
}

server.listen(port, function () {
  // let finish = {address: "mongodb://192.168.55.169/playlists"}
  //   let finish = { address: "mongodb://192.168.0.107/playlists" };
  let finish = {
    address:
      "mongodb+srv://Admin:qwerty123@mp3player.enb04.mongodb.net/playlists?retryWrites=true&w=majority",
  };
  createConnection(finish, function (data) {
    console.log(data);
  });
  console.log("serwer startuje na porcie " + port);
});

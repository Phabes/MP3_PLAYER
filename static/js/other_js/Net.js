console.log("Wczytano plik Net.js")

class Net {
    constructor() {
        this.databaseConnection = false
        // this.createConnection("playlists", function(data) {
        //     if(data = "CONNECTED")
        //         net.loadAlbum("Eminem")
        // })
    }

    createConnection(database, callback) {
        $.ajax({
            url: "localhost",
            data: {action: "CREATE_CONNECTION", addressIP: "127.0.0.1", databaseName: database},
            type: "POST",
            success: function(data) {
                let obj = JSON.parse(data, 5, null)
                if(obj == "CONNECTED") {
                    net.databaseConnection = true
                    callback("CONNECTED")
                }
                else
                    callback("NOT_CONNECTED")
            },
            error: function(xhr, status, error) {
                console.log(xhr)
            }
        })
    }

    loadAlbum(albumName) {
        $.ajax({
            url: "localhost",
            data: {action: "LOAD_ALBUM", albumName: albumName},
            type: "POST",
            success: function(data) {
                let obj = JSON.parse(data, 5, null)
                music.playlistLoaded = false
                net.createSongsLayout(obj, albumName, false)
            },
            error: function(xhr, status, error) {
                console.log(xhr)
            }
        })
    }

    loadPlaylist(database, playlistName) {
        $.ajax({
            url: "localhost",
            data: {action: "LOAD_PLAYLIST", databaseName: database, playlistName: playlistName},
            type: "POST",
            success: function(data) {
                let obj = JSON.parse(data, 5, null)
                music.playlistLoaded = true
                net.createSongsLayout(obj, playlistName, true)
            },
            error: function(xhr, status, error) {
                console.log(xhr)
            }
        })
    }

    getPlaylistsToPlay(database) {
        $.ajax({
            url: "localhost",
            data: {action: "SHOW_PLAYLISTS", databaseName: database},
            type: "POST",
            success: function(data) {
                let obj = JSON.parse(data, 5, null)
                if(obj.actionBack == "LOADED") {
                    music.currentAlbumLoaded = null
                    music.currentLoadedFiles = null
                    music.playlistLoaded = false
                    let playlists = obj.playlists
                    $("#songs").empty()
                    net.createUserPanel()
                    let div = $("<div>")
                        .prop("id", "mainPhrases")
                        .html("WYBIERZ SWOJĄ PLAYLISTĘ")
                    $("#songs").append(div)
                    if(playlists.length) {
                        playlists.forEach(playlist => {
                            let bigDiv = $("<div>")
                                .addClass("singleSong")
                                .addClass("withoutHighlight")
                                .on("click", function() {
                                    net.loadPlaylist(database, playlist)
                                })
                            let smallDiv = $("<div>")
                                .addClass("playlistName")
                                .html(playlist)
                            bigDiv.append(smallDiv)
                            smallDiv = $("<div>")
                                .addClass("songButtons")
                            let container = $("<div>")
                                .addClass("buttonsContainer")
                            let img = $("<img>")
                                .addClass("deleteButton circle hover")
                                .prop("src", "gfx/icons/delete.png")
                                .prop("alt", "delete")
                                .on("click", function(e) {
                                    e.stopPropagation()
                                    let agree = confirm("Czy na pewno chcesz usunąć playlistę " + playlist)
                                    if(agree)
                                        net.deletePlaylist(database, playlist, bigDiv)
                                })
                            container.append(img)
                            smallDiv.append(container)
                            bigDiv.append(smallDiv)
                            $("#songs").append(bigDiv)
                        })
                        ui.songsHighlight()
                    }
                    else {
                        let bigDiv = $("<div>")
                            .addClass("singleSong")
                            .addClass("withoutHighlight")
                            .html("BRAK PLAYLIST")
                        $("#songs").append(bigDiv)
                    }
                }
                else
                    alert("NIE ZAŁADOWANO PLAYLIST")
            },
            error: function(xhr, status, error) {
                console.log(xhr)
            }
        })
    }

    getPlaylistsToAdd(database, songInfo) {
        $.ajax({
            url: "localhost",
            data: {action: "SHOW_PLAYLISTS", databaseName: database},
            type: "POST",
            success: function(data) {
                let obj = JSON.parse(data, 5, null)
                if(obj.actionBack == "LOADED") {
                    music.currentAlbumLoaded = null
                    music.currentLoadedFiles = null
                    music.playlistLoaded = false
                    let playlists = obj.playlists
                    $("#songs").empty()
                    net.createUserPanel()
                    let bigDiv = $("<div>")
                        .prop("id", "mainPhrases")
                    let smallDiv = $("<div>")
                        .prop("id", "playlistNameDiv")
                    let input = $("<input>")
                        .prop("id", "newPlaylistName")
                        .prop("placeholder", "Nazwa Playlisty")
                    smallDiv.append(input)
                    bigDiv.append(smallDiv)
                    smallDiv = $("<div>")
                        .addClass("songButtons")
                    let bt = $("<button>")
                        .prop("id", "newPlaylistAdd")
                        .html("DODAJ")
                        .on("click", function() {
                            if(!checkIfExist($("#newPlaylistName").val()))
                                net.createNewPlaylist(database, $("#newPlaylistName").val(), songInfo)
                            else
                                alert("JUŻ ISTNIEJE TAKA PLAYLISTA")
                            $("#newPlaylistName").val("")
                            $("#newPlaylistName").focus()
                            function checkIfExist(playlistName) {
                                let exist = false
                                playlists.forEach(playlist => {
                                    if(playlistName == playlist)
                                        exist = true
                                })
                                return exist
                            }
                        })
                    smallDiv.append(bt)
                    bigDiv.append(smallDiv)
                    $("#songs").append(bigDiv)
                    if(playlists.length) {
                        playlists.forEach(playlist => {
                            let bigDiv = $("<div>")
                                .addClass("singleSong")
                                .addClass("withoutHighlight")
                                .on("click", function() {
                                    net.addToPlaylist(database, playlist, songInfo)
                                })
                            let smallDiv = $("<div>")
                                .addClass("playlistName")
                                .html(playlist)
                            bigDiv.append(smallDiv)
                            smallDiv = $("<div>")
                                .addClass("songButtons")
                            let container = $("<div>")
                                .addClass("buttonsContainer")
                            let img = $("<img>")
                                .addClass("deleteButton circle hover")
                                .prop("src", "gfx/icons/delete.png")
                                .prop("alt", "delete")
                                .on("click", function(e) {
                                    e.stopPropagation()
                                    let agree = confirm("Czy na pewno chcesz usunąć playlistę " + playlist)
                                    if(agree)
                                        net.deletePlaylist(database, playlist, bigDiv)
                                })
                            container.append(img)
                            smallDiv.append(container)
                            bigDiv.append(smallDiv)
                            $("#songs").append(bigDiv)
                        })
                        ui.songsHighlight()
                    }
                    else {
                        let bigDiv = $("<div>")
                            .addClass("singleSong")
                            .addClass("withoutHighlight")
                            .html("BRAK PLAYLIST")
                        $("#songs").append(bigDiv)
                    }
                }
                else
                    alert("NIE ZAŁADOWANO PLAYLIST")
            },
            error: function(xhr, status, error) {
                console.log(xhr)
            }
        })
    }

    createNewPlaylist(database, playlistName, songInfo) {
        $.ajax({
            url: "localhost",
            data: {action: "CREATE_PLAYLIST", databaseName: database, playlistName: playlistName},
            type: "POST",
            success: function(data) {
                if(data == "CREATED")
                    net.getPlaylistsToAdd(database, songInfo)
                else
                    alert("NIE UTWORZONO")
            },
            error: function(xhr, status, error) {
                console.log(xhr)
            }
        })
    }

    addToPlaylist(database, playlistName, songInfo) {
        $.ajax({
            url: "localhost",
            data: {action: "ADD_TO_PLAYLIST", databaseName: database, playlistName: playlistName, songInfo: JSON.stringify(songInfo)},
            type: "POST",
            success: function(data) {
                let obj = JSON.parse(data, 5, null)
                if(obj.actionBack == "ADDED") {
                    if(music.currentAlbumPlay == playlistName && music.playlistPlaying) {
                        music.currentPlayFiles.push(obj.song)
                        if(music.random)
                            music.queue.push(music.queue.length)
                        else {
                            let lastIndex = music.queue.findIndex(e => e == music.queue.length - 1)
                            if(lastIndex < music.currentSongIndex)
                                music.currentSongIndex++
                            music.currentSongIndex %= music.queue.length
                            music.queue.splice(lastIndex + 1, 0, music.queue.length)
                        }
                    }
                    net.loadPlaylist(database, playlistName)
                }
                else if(obj.actionBack == "EXIST")
                    alert("JUŻ TAM JEST")
                else
                    alert("NIE DODANO")
            },
            error: function(xhr, status, error) {
                console.log(xhr)
            }
        })
    }

    deletePlaylist(database, playlistName, divToRemove) {
        $.ajax({
            url: "localhost",
            data: {action: "DELETE_PLAYLIST", databaseName: database, playlistName: playlistName},
            type: "POST",
            success: function(data) {
                if(data = "DELETED") {
                    if(music.currentAlbumPlay == playlistName && music.playlistPlaying)
                        music.clearMusic()
                    $(divToRemove).remove()
                    if($(".playlistName").length == 0) {
                        let bigDiv = $("<div>")
                            .addClass("singleSong")
                            .addClass("withoutHighlight")
                            .html("BRAK PLAYLIST")
                        $("#songs").append(bigDiv)
                    }
                }
                else
                    alert("NIE USUNIĘTO")
            },
            error: function(xhr, status, error) {
                console.log(xhr)
            }
        })
    }

    deleteFromPlaylist(database, playlistName, file, indexToRemove, isCurrentSong) {
        $.ajax({
            url: "localhost",
            data: {action: "DELETE_FROM_PLAYLIST", databaseName: database, playlistName: playlistName, songInfo: JSON.stringify(file)},
            type: "POST",
            success: function(data) {
                if(data = "DELETED") {
                    net.loadPlaylist(database, playlistName)
                    if(music.currentAlbumPlay == playlistName && music.playlistPlaying) {
                        music.currentPlayFiles.splice(indexToRemove, 1)
                        let songIndex = music.queue.findIndex(e => e == indexToRemove)
                        if(songIndex < music.currentSongIndex)
                            music.currentSongIndex--
                        for(let i = music.queue.length - 1; i >= 0; i--) {
                            if(music.queue[i] == indexToRemove)
                                music.queue.splice(i, 1)
                            else if(music.queue[i] > indexToRemove)
                                music.queue[i]--
                        }
                        if(music.currentSongIndex == -1)
                            music.currentSongIndex = music.queue.length - 1
                        music.currentSongIndex %= music.queue.length
                        if(music.queue.length == 0)
                            music.clearMusic()
                        else if(isCurrentSong)
                            ui.changeSong()
                    }
                }
                else
                    alert("NIE USUNIĘTO")
            },
            error: function(xhr, status, error) {
                console.log(xhr)
            }
        })
    }

    createUserPanel() {
        let bigDiv = $("<div>")
            .prop("id", "loginMenu")
        if(localStorage.getItem("MP3_LOGIN") != null) {
            bigDiv.html("Hello " + localStorage.getItem("MP3_LOGIN"))
            let bt = $("<button>")
                .html("LOGOUT")
                .on("click", function() {
                    localStorage.removeItem("MP3_LOGIN")
                    music.clearMusic()
                    net.loadAlbum("Eminem")
                })
            bigDiv.append(bt)
        }
        else {
            let smallDiv = $("<a>")
                .addClass("userButton")
                .prop("href", "login.html")
                .html("LOGIN")
            bigDiv.append(smallDiv)
            smallDiv = $("<a>")
                .addClass("userButton")
                .prop("href", "register.html")
                .html("REGISTER")
            bigDiv.append(smallDiv)
        }
        $("#songs").append(bigDiv)
    }

    createSongsLayout(obj, albumName, enableDelete) {
        music.currentAlbumLoaded = albumName
        music.currentLoadedFiles = obj.files
        $("#albums").empty()
        $("#songs").empty()
        obj.dirs.forEach(dir => {
            let img = $("<img>")
                .addClass("singleAlbum")
                .prop("src", "gfx/albums/" + dir + ".jpg")
                .prop("alt", dir)
            $("#albums").append(img)
        })
        ui.albumClicks()
        net.createUserPanel()
        let bigDiv = $("<div>")
            .prop("id", "mainPhrases")
        let smallDiv = $("<div>")
            .addClass("songAlbum")
            .text("Album")
        bigDiv.append(smallDiv)
        smallDiv = $("<div>")
            .addClass("songTitle")
            .text("Tytuł")
        bigDiv.append(smallDiv)
        smallDiv = $("<div>")
            .addClass("songSize")
            .text("Rozmiar")
        bigDiv.append(smallDiv)
        smallDiv = $("<div>")
            .addClass("songButtons")
        let container = $("<div>")
            .addClass("buttonsContainer")
            .css("display", "flex")
        let img = $("<img>")
            .addClass("hover")
            .prop("src", "gfx/icons/playlist.png")
            .prop("alt", "playlist")
            .on("click", function() {
                if(localStorage.getItem("MP3_LOGIN") == null)
                    net.getPlaylistsToPlay("mo16834_lists")
                else
                    net_user.getPlaylistsToPlayUser("mo16834_users", localStorage.getItem("MP3_LOGIN"))
            })
        container.append(img)
        smallDiv.append(container)
        bigDiv.append(smallDiv)
        $("#songs").append(bigDiv)
        if(obj.files.length) {
            obj.files.forEach((file, index) => {
                let bigDiv = $("<div>")
                    .addClass("singleSong")
                    .addClass("withoutHighlight")
                    .on("click", function() {
                        // if (window.innerWidth <= 700) {
                        //     if (!$(bigDiv).hasClass("perma")) {
                        //         $("#globalPlayPause").prop("src", "gfx/icons/pause.png")
                        //         $("#globalPlayPause").prop("alt", "pause")
                        //         $(bigDiv).addClass("perma")
                        //         $(bigDiv).removeClass("highlight")
                        //         music.currentPlayFiles = music.currentLoadedFiles
                        //         music.currentSong = file
                        //         if (music.currentAlbumPlay != music.currentAlbumLoaded)
                        //             music.createQueue(index)
                        //         else {
                        //             music.queue.forEach((number, i) => {
                        //                 if (number == index)
                        //                     music.currentSongIndex = i
                        //             })
                        //         }
                        //         music.currentAlbumPlay = albumName
                        //         let src = "mp3/" + file.album + "/" + file.title
                        //         music.playNewSong(src)
                        //         if (music.currentSongDiv != null) {
                        //             music.currentSongDiv.addClass("withoutHighlight")
                        //             music.currentSongDiv.removeClass("perma")
                        //             $(".buttonsContainer", music.currentSongDiv).css("display", "none")
                        //             $(".playButton", music.currentSongDiv).prop("src", "gfx/icons/play.png")
                        //             $(".playButton", music.currentSongDiv).prop("alt", "play")
                        //         }
                        //         music.currentSongDiv = $(bigDiv)
                        //     }
                        //     else {
                        //         if ($("#globalPlayPause").prop("alt") == "play") {
                        //             $("#globalPlayPause").prop("src", "gfx/icons/pause.png")
                        //             $("#globalPlayPause").prop("alt", "pause")
                        //             music.continueSong()
                        //         }
                        //         else {
                        //             $("#globalPlayPause").prop("src", "gfx/icons/play.png")
                        //             $("#globalPlayPause").prop("alt", "play")
                        //             music.pauseSong()
                        //         }
                        //     }
                        // }
                    })
                let smallDiv = $("<div>")
                    .addClass("songAlbum")
                    .text(file.album)
                bigDiv.append(smallDiv)
                smallDiv = $("<div>")
                    .addClass("songTitle")
                    .text(file.title)
                bigDiv.append(smallDiv)
                smallDiv = $("<div>")
                    .addClass("songSize")
                    .text(file.size)
                bigDiv.append(smallDiv)
                smallDiv = $("<div>")
                    .addClass("songButtons")
                let container = $("<div>")
                    .addClass("buttonsContainer")
                let img = $("<img>")
                    .addClass("playButton circle hover")
                    .prop("src", "gfx/icons/play.png")
                    .prop("alt", "play")
                    .on("click", function() {
                        if($(this).prop("alt") == "play") {
                            $("#globalPlayPause").prop("src", "gfx/icons/pause.png")
                            $("#globalPlayPause").prop("alt", "pause")
                            $(this).prop("src", "gfx/icons/pause.png")
                            $(this).prop("alt", "pause")
                            $(bigDiv).addClass("perma")
                            $(bigDiv).removeClass("highlight")
                            if(music.currentAlbumLoaded != music.currentAlbumPlay || (music.currentAlbumLoaded == music.currentAlbumPlay && music.playlistLoaded != music.playlistPlaying)) {
                                music.currentPlayFiles = [...music.currentLoadedFiles]
                                music.currentAlbumPlay = albumName
                                music.currentSongTitle = file.title
                                if(music.playlistLoaded)
                                    music.playlistPlaying = true
                                else
                                    music.playlistPlaying = false
                                music.createQueue(index)
                                let src = "mp3/" + file.album + "/" + file.title
                                music.playNewSong(src)
                                if(music.currentSongDiv != null) {
                                    music.currentSongDiv.addClass("withoutHighlight")
                                    music.currentSongDiv.removeClass("perma")
                                    $(".buttonsContainer", music.currentSongDiv).css("display", "none")
                                    $(".playButton", music.currentSongDiv).prop("src", "gfx/icons/play.png")
                                    $(".playButton", music.currentSongDiv).prop("alt", "play")
                                }
                                music.currentSongDiv = $(bigDiv)
                            }
                            else if(music.currentSongTitle == file.title)
                                music.continueSong()
                            else {
                                music.currentSongTitle = file.title
                                music.currentSongIndex = music.queue.findIndex(e => e == index)
                                let src = "mp3/" + file.album + "/" + music.currentSongTitle
                                music.playNewSong(src)
                                music.currentSongDiv.addClass("withoutHighlight")
                                music.currentSongDiv.removeClass("perma")
                                $(".buttonsContainer", music.currentSongDiv).css("display", "none")
                                $(".playButton", music.currentSongDiv).prop("src", "gfx/icons/play.png")
                                $(".playButton", music.currentSongDiv).prop("alt", "play")
                                music.currentSongDiv = $(bigDiv)
                            }
                        }
                        else {
                            music.pauseSong()
                            $("#globalPlayPause").prop("src", "gfx/icons/play.png")
                            $("#globalPlayPause").prop("alt", "play")
                            $(this).prop("src", "gfx/icons/play.png")
                            $(this).prop("alt", "play")
                        }
                    })
                container.append(img)
                img = $("<img>")
                    .addClass("circle hover")
                    .prop("src", "gfx/icons/add.png")
                    .prop("alt", "add")
                    .on("click", function() {
                        if(localStorage.getItem("MP3_LOGIN") == null)
                            net.getPlaylistsToAdd("mo16834_lists", file)
                        else
                            net_user.getPlaylistsToAddUser("mo16834_users", localStorage.getItem("MP3_LOGIN"), file)
                    })
                container.append(img)
                if(enableDelete) {
                    img = $("<img>")
                        .addClass("circle hover")
                        .prop("src", "gfx/icons/delete.png")
                        .prop("alt", "delete")
                        .on("click", function() {
                            let current = music.queue[music.currentSongIndex] == index
                            if(localStorage.getItem("MP3_LOGIN") == null)
                                net.deleteFromPlaylist("mo16834_lists", albumName, file, index, current)
                            else
                                net_user.deleteFromPlaylistUser("mo16834_users", localStorage.getItem("MP3_LOGIN"), albumName, index, current)
                        })
                    container.append(img)
                }
                smallDiv.append(container)
                bigDiv.append(smallDiv)
                if(music.currentAlbumLoaded == music.currentAlbumPlay && music.playlistLoaded == music.playlistPlaying && music.currentSongTitle == file.title) {
                    music.currentSongDiv = $(bigDiv)
                    $(bigDiv).addClass("perma")
                    $(bigDiv).removeClass("withoutHighlight")
                    $(".buttonsContainer", music.currentSongDiv).css("display", "flex")
                    $(".playButton", music.currentSongDiv).prop("src", "gfx/icons/" + $("#globalPlayPause").prop("alt") + ".png")
                    $(".playButton", music.currentSongDiv).prop("alt", $("#globalPlayPause").prop("alt"))
                }
                $("#songs").append(bigDiv)
            })
            ui.songsHighlight()
        }
        else {
            bigDiv = $("<div>")
                .addClass("singleSong")
                .addClass("withoutHighlight")
                .html("BRAK UTWORÓW")
            $("#songs").append(bigDiv)
        }
    }

}
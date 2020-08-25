console.log("Wczytano plik Net_User.js")
class Net_User {
    constructor() {}

    getPlaylistsToPlayUser(database, login) {
        $.ajax({
            url: "localhost",
            data: {action: "SHOW_PLAYLISTS_USER", databaseName: database, login: login},
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
                                    net_user.loadPlaylistUser(database, login, playlist)
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
                                        net_user.deletePlaylistUser(database, login, playlist, bigDiv)
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

    getPlaylistsToAddUser(database, login, songInfo) {
        $.ajax({
            url: "localhost",
            data: {action: "SHOW_PLAYLISTS_USER", databaseName: database, login: login},
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
                                net_user.createNewPlaylistUser(database, login, $("#newPlaylistName").val(), songInfo)
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
                                    net_user.addToPlaylistUser(database, login, playlist, songInfo)
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
                                        net_user.deletePlaylistUser(database, login, playlist, bigDiv)
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

    createNewPlaylistUser(database, login, playlistName, songInfo) {
        $.ajax({
            url: "localhost",
            data: {action: "CREATE_PLAYLIST_USER", databaseName: database, login: login, playlistName: playlistName},
            type: "POST",
            success: function(data) {
                if(data == "CREATED")
                    net_user.getPlaylistsToAddUser(database, login, songInfo)
                else
                    alert("NIE UTWORZONO")
            },
            error: function(xhr, status, error) {
                console.log(xhr)
            }
        })
    }

    addToPlaylistUser(database, login, playlistName, songInfo) {
        $.ajax({
            url: "localhost",
            data: {action: "ADD_TO_PLAYLIST_USER", databaseName: database, login: login, playlistName: playlistName, songInfo: JSON.stringify(songInfo)},
            type: "POST",
            success: function(data) {
                if(data == "ADDED") {
                    if(music.currentAlbumPlay == playlistName && music.playlistPlaying) {
                        music.currentPlayFiles.push(songInfo)
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
                    net_user.loadPlaylistUser(database, login, playlistName)
                }
                else if(data == "EXIST")
                    alert("JUŻ TAM JEST")
                else
                    alert("NIE DODANO")
            },
            error: function(xhr, status, error) {
                console.log(xhr)
            }
        })
    }

    loadPlaylistUser(database, login, playlistName) {
        $.ajax({
            url: "localhost",
            data: {action: "LOAD_PLAYLIST_USER", databaseName: database, login: login, playlistName: playlistName},
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

    deletePlaylistUser(database, login, playlistName, divToRemove) {
        $.ajax({
            url: "localhost",
            data: {action: "DELETE_PLAYLIST_USER", databaseName: database, login: login, playlistName: playlistName},
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

    deleteFromPlaylistUser(database, login, playlistName, indexToRemove, isCurrentSong) {
        $.ajax({
            url: "localhost",
            data: {action: "DELETE_FROM_PLAYLIST_USER", databaseName: database, login: login, playlistName: playlistName, songIndex: indexToRemove},
            type: "POST",
            success: function(data) {
                if(data = "DELETED") {
                    net_user.loadPlaylistUser(database, login, playlistName)
                    console.log(music.currentAlbumPlay == playlistName, music.playlistPlaying)
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

}
console.log("Wczytano plik Ui.js")

class Ui {
    constructor() {
        this.volumeHover = false
        this.click = false
        this.windowResize()
        this.audioChanges()
        this.globalChanges()
    }

    windowResize() {
        this.formatElements()
        $(window).resize(function() {
            ui.formatElements()
        })
    }

    formatElements() {
        $("#albums").css("height", window.innerHeight - 110 + "px")
        $("#songs").css("height", window.innerHeight - 110 + "px")
        visual.camera.aspect = window.innerWidth / window.innerHeight
        visual.camera.updateProjectionMatrix()
        visual.renderer.setSize(window.innerWidth, window.innerHeight)
    }

    audioChanges() {
        $("#audio").on("loadeddata", function() {
            // $("#audio").prop("currentTime", 0)
            $("#audio").trigger("play")
            $("#audio").prop("currentTime", 0)
        })
        // document.getElementById("audio").addEventListener("timeupdate", function() {
        // })

        $("#audio").on("timeupdate", function(e) {
            let currentTime = $("#audio").prop("currentTime")
            let min = Math.floor(currentTime / 60)
            let sec = Math.floor(currentTime % 60)
            if(sec < 10)
                sec = "0" + sec
            let fileDuration = music.currentPlayFiles[music.queue[music.currentSongIndex]].duration
            let update = min + ":" + sec + " / " + fileDuration
            $("#time").html(update)
            let array = fileDuration.split(":")
            let duration = parseFloat(array[0]) * 60 + parseFloat(array[1])
            let left = (currentTime / duration) * ($("#duration").width() - 10) + "px"
            $("#durationZip").css("left", left)
        })

        $("#audio").on("ended", function() {
            music.endOfSong()
        })
    }

    globalChanges() {
        $("#durationZip").on("click", function(e) {
            e.stopPropagation()
        })

        $("#globalPlayPause").on("click", function() {
            if(music.currentSongTitle != null) {
                if($(this).prop("alt") == "play") {
                    music.continueSong()
                    $(this).prop("src", "gfx/icons/pause.png")
                    $(this).prop("alt", "pause")
                    if(music.currentSongDiv != null) {
                        $(".playButton", music.currentSongDiv).prop("src", "gfx/icons/pause.png")
                        $(".playButton", music.currentSongDiv).prop("alt", "pause")
                    }
                }
                else {
                    music.pauseSong()
                    $(this).prop("src", "gfx/icons/play.png")
                    $(this).prop("alt", "play")
                    if(music.currentSongDiv != null) {
                        $(".playButton", music.currentSongDiv).prop("src", "gfx/icons/play.png")
                        $(".playButton", music.currentSongDiv).prop("alt", "play")
                    }
                }
            }
        })

        $("#skip_left").on("click", function() {
            if(music.currentSongTitle != null && music.currentPlayFiles.length > 0) {
                music.currentSongIndex--
                if(music.currentSongIndex == -1)
                    music.currentSongIndex = music.queue.length - 1
                ui.changeSong()
            }
        })

        $("#skip_right").on("click", function() {
            if(music.currentSongTitle != null && music.currentPlayFiles.length > 0) {
                music.currentSongIndex++
                music.currentSongIndex %= music.queue.length
                ui.changeSong()
            }
        })

        $("#duration").on("mousedown", function(e) {
            ui.click = true
            if(music.currentSongTitle != null) {
                ui.changeZip(e)
                $(document).on("mousemove", function(e) {
                    ui.changeZip(e)
                })
            }
        })

        $(document).on("mouseup", function() {
            ui.click = false
            $(document).unbind("mousemove")
        })

        $("#volumeIMG").on("click", function() {
            if($(this).prop("alt") == "volume_on") {
                music.volume = $("#audio").prop("volume")
                $("#audio").prop("volume", 0)
                $("#volumeZip").css("width", "0%")
                $(this).prop("src", "/gfx/icons/volume_off.png")
                $(this).prop("alt", "volume_off")
            }
            else {
                $("#audio").prop("volume", music.volume)
                $("#volumeZip").css("width", music.volume * 100 + "%")
                music.volume = null
                $(this).prop("src", "/gfx/icons/volume_on.png")
                $(this).prop("alt", "volume_on")
            }
        })

        $("#volumeIMG").on("mouseover", function() {
            clearInterval(ui.interval)
            $("#sideButtonsRight").css("width", "120px")
            $("#volumeBorder").css("display", "flex")
        })

        $("#volumeIMG").on("mouseout", function() {
            ui.interval = setInterval(function() {
                if(!ui.volumeHover && !ui.click) {
                    $("#sideButtonsRight").css("width", "35px")
                    $("#volumeBorder").css("display", "none")
                    clearInterval(ui.interval)
                }
            }, 2000)
        })

        $("#getPlaylists").on("click", function() {
            if(localStorage.getItem("MP3_LOGIN") == null)
                net.getPlaylistsToPlay("playlists")
            else
                net_user.getPlaylistsToPlayUser("users", localStorage.getItem("MP3_LOGIN"))
        })

        $("#volumeBorder").on("mouseover", function() {
            if($(this).css("display") == "flex")
                ui.volumeHover = true
        })

        $("#volumeBorder").on("mouseout", function() {
            ui.volumeHover = false
        })

        $("#volume").on("mousedown", function(e) {
            ui.click = true
            if($("#volumeBorder").css("display") == "flex") {
                ui.changeVolume(e)
                $(document).on("mousemove", function(e) {
                    ui.changeVolume(e)
                })
            }
        })

        $("#repeat").on("click", function() {
            if($(this).prop("alt") == "repeat_off") {
                music.repeat = true
                $(this).prop("alt", "repeat_on")
                $(this).prop("src", "gfx/icons/repeat_on.png")
            }
            else {
                music.repeat = false
                $(this).prop("alt", "repeat_off")
                $(this).prop("src", "gfx/icons/repeat_off.png")
            }
        })

        $("#random").on("click", function() {
            if($(this).prop("alt") == "random_off") {
                music.random = true
                $(this).prop("alt", "random_on")
                $(this).prop("src", "gfx/icons/random_on.png")
            }
            else {
                music.random = false
                $(this).prop("alt", "random_off")
                $(this).prop("src", "gfx/icons/random_off.png")
            }
            music.createQueue(music.queue[music.currentSongIndex])
        })

        $(document).on("keydown", function(e) {
            if(!$("#newPlaylistName").is(":focus")) {
                //F
                if(e.keyCode == 70)
                    $("#showVisual").trigger("click")
                //SPACEBAR
                else if(e.keyCode == 32)
                    $("#globalPlayPause").trigger("click")
                //M
                else if(e.keyCode == 77)
                    $("#volumeIMG").trigger("click")
            }
        })

        $(document).on('click', function() {
            visual.audioContext.resume().then(() => {
                $(document).unbind("click")
            })
        })

        $("#showVisual").on("click", function() {
            ui.showHideVisual()
        })
    }

    showHideVisual() {
        if($("#visual").css("display") == "none")
            $("#visual").css("display", "block")
        else
            $("#visual").css("display", "none")
    }

    changeVolume(e) {
        if(e.pageX < $("#volume").offset().left)
            ui.changeVolumeParams(0, "volume_off")
        else if(e.pageX > $("#volume").offset().left + $("#volume").width())
            ui.changeVolumeParams(1, "volume_on")
        else {
            let volumeValue = (e.pageX - $("#volume").offset().left) / $("#volume").width()
            if(volumeValue > 1)
                volumeValue = 1
            else if(volumeValue < 0)
                volumeValue = 0
            ui.changeVolumeParams(volumeValue, "volume_on")
        }
    }

    changeVolumeParams(value, img) {
        $("#audio").prop("volume", value)
        $("#volumeZip").css("width", value * 100 + "%")
        $("#volumeIMG").prop("src", "/gfx/icons/" + img + ".png")
        $("#volumeIMG").prop("alt", img)
    }

    changeZip(e) {
        if(e.pageX < $("#duration").offset().left)
            $("#audio").prop("currentTime", 0)
        else if(e.pageX > $("#duration").offset().left + $("#duration").width())
            music.endOfSong()
        else {
            let array = music.currentPlayFiles[music.queue[music.currentSongIndex]].duration.split(":")
            let duration = parseFloat(array[0]) * 60 + parseFloat(array[1])
            let timeValue = duration * (e.pageX - $("#duration").offset().left) / $("#duration").width()
            $("#audio").prop("currentTime", timeValue)
        }
    }

    changeSong() {
        music.currentSongTitle = music.currentPlayFiles[music.queue[music.currentSongIndex]].title
        let src = "mp3/" + music.currentPlayFiles[music.queue[music.currentSongIndex]].album + "/" + music.currentSongTitle
        music.playNewSong(src)
        if(music.currentAlbumLoaded == music.currentAlbumPlay && music.playlistLoaded == music.playlistPlaying) {
            music.currentSongDiv.addClass("withoutHighlight")
            music.currentSongDiv.removeClass("perma")
            $(".buttonsContainer", music.currentSongDiv).css("display", "none")
            $(".playButton", music.currentSongDiv).prop("src", "gfx/icons/play.png")
            $(".playButton", music.currentSongDiv).prop("alt", "play")
            music.currentSongDiv = $(".singleSong").eq(music.queue[music.currentSongIndex])
            music.currentSongDiv.addClass("perma")
            music.currentSongDiv.removeClass("withoutHighlight")
            $(".buttonsContainer", music.currentSongDiv).css("display", "flex")
            $(".playButton", music.currentSongDiv).prop("src", "gfx/icons/pause.png")
            $(".playButton", music.currentSongDiv).prop("alt", "pause")
        }
        $("#globalPlayPause").prop("src", "gfx/icons/pause.png")
        $("#globalPlayPause").prop("alt", "pause")
    }

    albumClicks() {
        $(".singleAlbum").on("click", function() {
            net.loadAlbum($(this).prop("alt"))
        })
    }

    songsHighlight() {
        $(".singleSong").on("mouseover", function() {
            let str = $(this).get(0).className
            if(!str.includes("perma")) {
                $(this).removeClass("withoutHighlight")
                $(this).addClass("highlight")
                $(this).css("cursor", "pointer")
                $(".buttonsContainer", this).css("display", "flex")
            }
        })

        $(".singleSong").on("mouseout", function() {
            let str = $(this).get(0).className
            if(!str.includes("perma")) {
                $(this).removeClass("highlight")
                $(this).addClass("withoutHighlight")
                $(".buttonsContainer", this).css("display", "none")
            }
        })
    }

}
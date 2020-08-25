console.log("Wczytano plik Music.js")

class Music {
    constructor() {
        this.currentAlbumLoaded = null
        this.currentAlbumPlay = null
        this.currentLoadedFiles = null
        this.currentPlayFiles = null
        // this.currentSong = null
        this.currentSongTitle = null
        // this.currentSongMaxDuration = null
        this.currentSongDiv = null
        this.queue = []
        this.currentSongIndex = 0
        this.repeat = false
        this.random = false
        this.volume = null
        this.playlistPlaying = false
        this.playlistLoaded = false
    }

    playNewSong(src) {
        $("#audio").trigger("pause")
        console.log(document.getElementById("audio").readyState)
        $("#audio").prop("currentTime", 0)
        $("#source").prop("src", src)
        $("#audio").trigger("load")
        $("#currentTitle").html(this.currentSongTitle)
    }

    pauseSong() {
        $("#audio").trigger("pause")
    }

    continueSong() {
        $("#audio").trigger("play")
    }

    createQueue(index) {
        this.queue = []
        this.currentSongIndex = 0
        if(this.currentSongTitle != null) {
            this.queue.push(index)
            if(this.random) {
                while(this.queue.length != this.currentPlayFiles.length) {
                    let rand = Math.floor(Math.random() * this.currentPlayFiles.length)
                    if(checkNumber(rand))
                        this.queue.push(rand)
                    function checkNumber(rand) {
                        let agree = true
                        music.queue.forEach(number => {
                            if(number == rand)
                                agree = false
                        })
                        return agree
                    }
                }
            }
            else {
                for(let i = index + 1; this.queue.length != this.currentPlayFiles.length; i++)
                    this.queue.push(i % this.currentPlayFiles.length)
            }
        }
    }

    endOfSong() {
        ui.click = false
        $(document).unbind("mousemove")
        if(this.repeat) {
            // let src = "mp3/" + this.currentPlayFiles[this.queue[this.currentSongIndex]].album + "/" + this.currentSongTitle
            let src = "mp3/" + this.currentPlayFiles[this.queue[this.currentSongIndex]].album + "/" + this.currentSongTitle
            this.playNewSong(src)
        }
        else
            $("#skip_right").trigger("click")
    }

    clearMusic() {
        $("#audio").remove()
        let audio = $("<audio>").prop("id", "audio")
        let source = $("<source>")
            .prop("id", "source")
            .prop("type", "audio/mpeg")
        audio.append(source)
        $("body").append(audio)
        ui.audioChanges()
        visual.resetAudio()
        $("#currentTitle").html("")
        $("#time").html("")
        $("#durationZip").css("left", "0%")
        this.currentAlbumLoaded = null
        this.currentAlbumPlay = null
        this.currentLoadedFiles = null
        this.currentPlayFiles = null
        // this.currentSong = null
        this.currentSongTitle = null
        // this.currentSongMaxDuration = null
        this.currentSongDiv = null
    }
}
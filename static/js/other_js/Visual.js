console.log("wczytano plik Visual.js")

class Visual {

    constructor() {
        this.cubeTab = []
        this.scene = new THREE.Scene()
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            10000
        )

        this.renderer = new THREE.WebGLRenderer({ antialias: true })
        this.renderer.setClearColor(0x474343)
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        $("#visual").append(this.renderer.domElement)

        this.camera.position.set(0, 800, 3000)
        this.camera.lookAt(this.scene.position)


        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                let cube = new Cube(i, j)
                this.cubeTab.push(cube)
                this.scene.add(cube.getCube())
            }
        }

        window.AudioContext = window.AudioContext || window.webkitAudioContext
        this.audioContext = new AudioContext()
        this.audioElement = $("#audio")[0]
        this.source = this.audioContext.createMediaElementSource(this.audioElement)
        this.analyser = this.audioContext.createAnalyser()
        this.source.connect(this.analyser)
        this.analyser.connect(this.audioContext.destination)
        this.analyser.fftSize = 128
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount)
        this.analyser.getByteFrequencyData(this.dataArray)

        this.render()
    }

    render() {
        requestAnimationFrame(this.render.bind(this))
        let valueTab = this.getData().split(",")
        for (let i = 0; i < valueTab.length / 2; i++) {
            this.cubeTab[i].changeHeight(parseInt(valueTab[i]))
            this.cubeTab[valueTab.length - 1 - i].changeHeight(parseInt(valueTab[i]))
        }
        this.renderer.render(this.scene, this.camera)
    }

    getData() {
        this.analyser.getByteFrequencyData(this.dataArray);
        return this.dataArray.toString()
    }

    resetAudio() {
        this.audioElement = $("#audio")[0]
        this.source = this.audioContext.createMediaElementSource(this.audioElement)
        this.source.connect(this.analyser)
    }

}
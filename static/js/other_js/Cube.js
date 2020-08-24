class Cube extends THREE.Object3D {
    constructor(posY, posX) {
        super()

        this.posY = posY
        this.posX = posX
        let geometry = new THREE.BoxGeometry(200, 1, 200)
        let material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.7
        })

        this.mesh = new THREE.Mesh(geometry, material)

        if (this.posY < 4)
            this.mesh.position.set((this.posY * 250) - (7 / 2 * 250) - 200, 0, (this.posX * 250) - (7 / 2 * 250))
        else if (posY < 8)
            this.mesh.position.set((this.posY * 250) - (7 / 2 * 250) + 200, 0, ((7 - this.posX) * 250) - (7 / 2 * 250))

        this.add(this.mesh)
    }

    getCube() {
        return this
    }

    changeHeight(height) {
        this.mesh.scale.y = 1 + height
        this.mesh.position.y = height / 2
    }
}
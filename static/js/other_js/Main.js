console.log("Wczytano plik Main.js")

let visual, music, ui, net, net_user

$(document).ready(function() {
    visual = new Visual()
    music = new Music()
    ui = new Ui()
    net = new Net()
    net_user = new Net_User()
})

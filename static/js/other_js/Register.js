console.log("Wczytano plik Register.js")

$(document).ready(function() {
    localStorage.removeItem("MP3_LOGIN")
    $("#btRegister").on("click", function() {
        $.ajax({
            url: "localhost",
            data: {action: "REGISTER_USER", databaseName: "users", login: $("#login").val(), password: $("#password").val()},
            type: "POST",
            success: function(data) {
                if(data == "CREATED") {
                    localStorage.setItem("MP3_LOGIN", $("#login").val())
                    window.open("https://mc-mp3-player.herokuapp.com/", "_self")
                }
                else if(data == "EXIST")
                    alert("TAKI UŻYTKOWNIK JUŻ ISTNIEJE")
                else if(data == "EXIST_LETTER")
                    alert("TAKI UŻYTKOWNIK JUŻ ISTNIEJE")
                else
                    alert("NIE UDAŁO SIĘ UTWORZYĆ UŻYTKOWNIKA")
            },
            error: function(xhr, status, error) {
                console.log(xhr)
            }
        })
    })

    $(document).on("keydown", function(e) {
        //ENTER
        if(e.keyCode == 13)
            $("#btRegister").trigger("click")
    })
})
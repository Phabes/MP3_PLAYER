console.log("Wczytano plik Login.js")

$(document).ready(function() {
    if(localStorage.getItem("MP3_LOGIN") != null)
        window.open(settings.url, "_self")

    $("#btLogin").on("click", function() {
        $.ajax({
            url: settings.url,
            data: {action: "LOGIN_USER", databaseName: "users", login: $("#login").val(), password: $("#password").val()},
            type: "POST",
            success: function(data) {
                console.log(data)
                if(data == "LOGGED") {
                    localStorage.setItem("MP3_LOGIN", $("#login").val())
                    window.open(settings.url, "_self")
                }
                else if(data == "NOT_LOGGED")
                    alert("ZŁE HASŁO")
                else if(data == "NOT_EXIST" || data.includes("DELETED"))
                    alert("NIE MA TAKIEGO UŻYTKOWNIKA")
                else
                    alert("NIE UDAŁO SIĘ ZALOGOWAĆ")
            },
            error: function(xhr, status, error) {
                console.log(xhr)
            }
        })
    })

    $(document).on("keydown", function(e) {
        //ENTER
        if(e.keyCode == 13)
            $("#btLogin").trigger("click")
    })
})
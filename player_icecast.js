function setOffAir() {
    $(".onair").html("Off Air");
    $("#content #artist").html("N/A");
    $("#content #title").html("N/A");
    $("#nowplaying").html("Station is Offline.");
    $("#content #artist-image").attr("src", "02assets/images/default.png")
}

function radioInfo() {
    var e = true;
    var t = $.get(statusurl + "?rand=" + Math.random(), function(t) {
        if (typeof t == "object" && t !== null && t !== "" && typeof t.mounts == "object" && Object.keys(t.mounts).length > 0) {
            dataretry = 0;
            console.log("dataretry: " + dataretry + ", datatimertime: " + datatimertime + ", datatimerID: " + datatimer);
            if (datatimertime != 15e3) {
                datatimertime = 15e3;
                clearInterval(datatimer);
                datatimer = window.setInterval("radioInfo()", 15e3);
                console.log("Timer set to 15000, 1st level.")
            }
            for (mount in t.mounts) {
                console.log("MOUNT: " + mount + ": ------------------------");
                console.log(t.mounts[mount])
            }
            var n, r;
            if (typeof t.mounts["/live"] == "object" && typeof t.mounts["/live"].stream_start != "undefined" && t.mounts["/live"].stream_start !== null && t.mounts["/live"].stream_start !== "") {
                e = false;
                r = false;
                $("#nowplaying").html("Você está ouvindo uma transmissão ao vivo ...");
                $(".onair").html("No Ar");
                n = t.mounts["/live"].current_song
            } else {
                if (typeof t.mounts["/autodj"] == "object" && typeof t.mounts["/autodj"].stream_start != "undefined" && t.mounts["/autodj"].stream_start !== null && t.mounts["/autodj"].stream_start !== "") {
                    e = false;
                    r = false;
                    $("#nowplaying").html("You are listening to an AutoDJ stream...");
                    $(".onair").html("On Air");
                    n = t.mounts["/autodj"].current_song
                } else {
                    if (typeof t.mounts["/stream"] == "object" && typeof t.mounts["/stream"].stream_start != "undefined" && t.mounts["/stream"].stream_start !== null && t.mounts["/stream"].stream_start !== "") {
                    e = false;
                    r = false;
                    $("#nowplaying").html("You are listening to a LIVE stream...");
                    $(".onair").html("On Air");
                    n = t.mounts["/stream"].current_song
                } else {
                    r = true
                }
                }
            }
            if (r === false) {
                n = escapeHtml(n);
                console.log(n);
                var i = n.split(" - ");
                var s = $.map(i, function(e) {
                    return $.trim(e) === "" ? null : $.trim(e)
                });
                if (typeof s[0] != "undefined" && s[0] !== null && s[0] !== "" && typeof s[1] != "undefined" && s[1] !== null && s[1] !== "") {
                    console.log(s);
                    e = false;
                    $("#content #artist").html('<a data-title="' + s[1] + '" href="#">' + cutAt(s[1], 40) + "</a>");
                    $("#content #title").html('<a data-title="' + s[0] + '" href="#">' + cutAt(s[0], 40) + "</a>");
                    if (lastartist != s[0]) {
                        var o = new LastFMCache;
                        var u = new LastFM({
                            apiKey: "0f6d18ece1fe3c7f36eebcf17537bad6",
                            apiSecret: "7a72db16fc0032d1253d7e96821e62c8",
                            cache: o
                        });
                        u.artist.getInfo({
                            artist: s[0]
                        }, {
                            success: function(e) {
                                if (typeof e.artist.image[2]["#text"] != "undefined" && e.artist.image[2]["#text"] !== null && e.artist.image[2]["#text"] !== "") {
                                    $("#content #artist-image").attr("src", e.artist.image[2]["#text"])
                                }
                            },
                            error: function(e, t) {
                                console.log(t)
                            }
                        })
                    }
                    lastartist = s[0]
                } else {
                    $("#content #artist-image").attr("src", "02assets/images/default.png");
                    if (typeof n != "undefined" && n !== null && n !== "") {
                        $("#content #title").html("N/A");
                        $("#content #artist").html('<a data-title="' + n + '" href="#">' + cutAt(n, 80) + "</a>")
                    } else {
                        $("#content #artist").html("N/A");
                        $("#content #title").html("N/A")
                    }
                }
            }
        } else {
            console.log("dataretry: " + dataretry + ", datatimertime: " + datatimertime + ", datatimerID: " + datatimer);
            if (datatimertime != 6e4) {
                if (dataretry >= 5) {
                    dataretry = 0;
                    clearInterval(datatimer);
                    datatimertime = 6e4;
                    datatimer = window.setInterval("radioInfo()", 6e4);
                    console.log("Timer set to 60000, 2nd level.")
                }
                dataretry = dataretry + 1
            }
        }
        if (e == true) {
            setOffAir()
        }
    }, "json").fail(function() {
        setOffAir();
        console.log("dataretry: " + dataretry + ", datatimertime: " + datatimertime + ", datatimerID: " + datatimer);
        if (datatimertime != 3e5) {
            if (dataretry >= 5) {
                dataretry = 0;
                clearInterval(datatimer);
                datatimertime = 3e5;
                datatimer = window.setInterval("radioInfo()", 3e5);
                console.log("Timer set to 300000, 3rd level.")
            }
            dataretry = dataretry + 1
        }
    })
}
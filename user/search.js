let mytype = window.location.search
mytype = mytype.split("=")[1]
setPage(mytype)
let glitch_url = "https://cool-ucd-lostandfound.glitch.me"

function setPage(type) {
    if (type == "lost") {
        document.getElementsByTagName("mytitle")[0].innerHTML = "Search for existing items"
        document.getElementsByTagName("body")[0].style.backgroundColor = "#b3c1d1"
        document.getElementById("myBtn").style.backgroundColor = "#142a50"
    }
}

function toMain() {
    let url = glitch_url + "/user/main.html"
    window.location = url
}
document.getElementById("logoimage").addEventListener("click", toMain)

//================== Check at least one field is filled ======================
function checkDateTime() {
    // return true if all date/time are filled in
    let startdate = document.getElementById("startdate").value
    let starttime = document.getElementById("starttime").value
    let enddate = document.getElementById("enddate").value
    let endtime = document.getElementById("endtime").value
    if (startdate == "" || starttime == "" || enddate == "" || endtime == "" ) {
        return false
    }
    return true
}

function extraCheckTime() {
    // return true if needs an alert
    let startdate = document.getElementById("startdate").value
    let starttime = document.getElementById("starttime").value
    let enddate = document.getElementById("enddate").value
    let endtime = document.getElementById("endtime").value
    if (!checkDateTime() && !(startdate == "" && starttime == "" && enddate == "" && endtime == "")) {
        return true
    }
    return false
}

// return true if there should be an alert
function checkField() {
    let category = document.getElementById("category").value
    let location = document.getElementById("location").value
    if (!checkDateTime() && category == "" && location == "") {
        return false
    }
    return true
}
//======================== DONE ===============================

function searchItem() {
    if (!checkField()) {
        alert("Please fill in at least one field")
        return
    }
    if (extraCheckTime()) {
        alert("Fill the date/time field or Leave it empty at all")
        return
    }
    // "FOUNDER" search for lost items; "SEEKER" search for found items
    let searchType = "lost"
    if (mytype == "lost") {
        searchType = "found"
    }
    let displayUrl = glitch_url + "/user/display.html?type=" + searchType
    let start_msecnd = 0
    let end_msecnd = 0
    if (checkDateTime()) {
        let startdate = document.getElementById("startdate").value
        let starttime = document.getElementById("starttime").value
        let enddate = document.getElementById("enddate").value
        let endtime = document.getElementById("endtime").value
        start_msecnd = Date.parse(startdate + "T" + starttime)
        end_msecnd = Date.parse(enddate + "T" + endtime)
    }
    let category = document.getElementById("category").value
    let location = document.getElementById("location").value
    window.sessionStorage.setItem('start_time', start_msecnd)
    window.sessionStorage.setItem('end_time', end_msecnd)
    window.sessionStorage.setItem('category', category)
    window.sessionStorage.setItem('location', location)
    window.location = displayUrl
}
document.getElementById("myBtn").addEventListener("click", searchItem)



let field = window.location.search
field = field.split("&")
let mytype = field[0].split("=")[1]
let lfid = field[1].split("=")[1]
setPage(mytype)

let glitch_url = "https://cool-ucd-lostandfound.glitch.me"


function setPage(type) {
    if (type == "lost") {
        document.getElementsByTagName("mytitle")[0].innerHTML = "Input the lost item"
        document.getElementsByTagName("mytitle")[1].innerHTML = "Or search for existing items"
        document.getElementsByTagName("body")[0].style.backgroundColor = "#b3c1d1"
        document.getElementById("myBtn").style.backgroundColor = "#142a50"
    }
}

// return true if there should be an alert
function checkField() {
    let date = document.getElementById("itemdate").value
    let time = document.getElementById("itemtime").value
    let location = document.getElementById("location").value
    if (date == "" || time == "" || location == "") {
        return false
    }
    return true
}

function submitItem() {
    if (!checkField()) {
        console.log("some fields are empty")
        alert("Please fill in the required field")
        return
    }
    let url = "/itemSubmit"
    let xhr = new XMLHttpRequest()
    xhr.open("POST", url)
    xhr.setRequestHeader("Content-type", "application/json;charset=UTF-8");
    /* convert date+time to milliseconds, easy to search in db */
    let tmpdate = document.getElementById("itemdate").value
    let tmptime = document.getElementById("itemtime").value
    let msecnd = Date.parse(tmpdate + "T" + tmptime)
    let item_info = {}
    item_info["itemid"] = lfid
    item_info["time"] = msecnd
    item_info["loc"] = document.getElementById("location").value
    let JStr = JSON.stringify(item_info)
    xhr.send(JStr)
    xhr.onloadend = function() {
        // when the browser get response back from the server
        console.log("All info have been submitted")
        console.log(xhr.responseText)
        alert("You have successfully submitted!")
        toMain()
    }
}
// Add event listener to the file input elementelement
document.getElementById("myBtn").addEventListener("click",submitItem);

function toMain() {
    let url = glitch_url + "/user/main.html"
    window.location = url
}
document.getElementById("logoimage").addEventListener("click", toMain)

function toSearch() {
    let searchUrl = glitch_url + "/user/search.html?type=" + mytype
    window.location = searchUrl
}
document.getElementById("searchpt").addEventListener("click", toSearch)

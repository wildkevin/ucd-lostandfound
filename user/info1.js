let mytype = window.location.search
mytype = mytype.split("=")[1]
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

function uploadFile() {
    // get the file chosen by the file dialog control
    const selectedFile = document.getElementById('fileChooser').files[0];
    // store it in a FormData object
    const formData = new FormData();
    // name of field, the file itself, and its name
    formData.append('newImage',selectedFile, selectedFile.name);
    // build a browser-style HTTP request data structure
    const xhr = new XMLHttpRequest();
    // it will be a POST request, the URL will this page's URL+"/upload" 
    xhr.open("POST", "/upload", true);
    // callback function executed when the HTTP response comes back
    xhr.onloadend = function(e) {
        // Get the server's response body
        console.log(xhr.responseText);
        document.getElementById("chooseBtn").innerHTML = "Choose File"
        // now that the image is on the server, we can display it!
        document.getElementById("filenm").innerHTML = selectedFile.name
    }
    // actually send the request
    xhr.send(formData);
    document.getElementById("chooseBtn").innerHTML = "Uploading..."
}
// Add event listener to the file input element
document.getElementById("fileChooser").addEventListener("change",uploadFile);


// return true if there should be an alert
function checkField() {
    let title = document.getElementById("title").value
    let category = document.getElementById("category").value
    let description = document.getElementById("description").value
    if (title == "" || category == "" || description == "") {
        return false
    }
    return true
}

function insertItem() {
    if (!checkField()) {
        console.log("some fields are empty")
        alert("Please fill in the required field")
        return
    }
    let url = "/itemNext"
    let xhr = new XMLHttpRequest()
    xhr.open("POST", url)
    xhr.setRequestHeader("Content-type", "application/json;charset=UTF-8");
    let item_info = {}
    item_info["type"] = mytype
    item_info["title"] = document.getElementById("title").value
    item_info["category"] = document.getElementById("category").value
    item_info["description"] = document.getElementById("description").value
    item_info["image"] = document.getElementById("filenm").innerHTML
    let JStr = JSON.stringify(item_info)
    xhr.send(JStr)
    xhr.onloadend = function() {
        // when the browser get response back from the server
        console.log(xhr.responseText)
        let lfId = xhr.responseText
        let nextUrl = glitch_url + "/user/info2.html?type=" + mytype
        nextUrl = nextUrl + "&id="
        nextUrl = nextUrl + lfId
        window.location = nextUrl
    }
}
// Add event listener to the file input element
document.getElementById("myBtn").addEventListener("click",insertItem);

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
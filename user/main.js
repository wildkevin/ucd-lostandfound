let glitch_url = "https://cool-ucd-lostandfound.glitch.me"

function toFinder() {
    let url = glitch_url + "/user/info1.html?type=found"
    window.location = url
}
document.getElementById("finder").addEventListener("click", toFinder)

function toSeeker() {
    let url = glitch_url + "/user/info1.html?type=lost"
    window.location = url
}
document.getElementById("seeker").addEventListener("click", toSeeker)

function toMain() {
    let url = glitch_url + "/user/main.html"
    window.location = url
}
document.getElementById("logoimage").addEventListener("click", toMain)

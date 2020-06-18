let glitch_url = "https://cool-ucd-lostandfound.glitch.me";

/*============================= SETUP =============================*/
let start_time = Number(window.sessionStorage.getItem("start_time"));
let end_time = Number(window.sessionStorage.getItem("end_time"));
let search_cate = window.sessionStorage.getItem("category");
let search_loc = window.sessionStorage.getItem("location");
let searchType = window.location.search;
searchType = searchType.split("=")[1];

setCriteria();

function setCriteria() {
  if (start_time != 0 && end_time != 0) {
    let objs = new Date(start_time);
    let obje = new Date(end_time);
    document.getElementById("start_time").innerHTML =
      objs.toLocaleDateString() + "&ensp;-&ensp;";
    document.getElementById("end_time").innerHTML =
      obje.toLocaleDateString() + ",&ensp;";
  }
  if (search_cate != "") {
    document.getElementById("search_cate").innerHTML = search_cate + ",&ensp;";
  }
  if (search_loc != "") {
    document.getElementById("search_loc").innerHTML = search_loc;
  }
}
/*============================= DONE =============================*/

/*========================== SEARCH DATABASE ==========================*/
selectDB();

function selectDB() {
  let url = "/itemSearch";
  let xhr = new XMLHttpRequest();
  xhr.open("POST", url);
  xhr.setRequestHeader("Content-type", "application/json;charset=UTF-8");
  let search_info = {};
  search_info["type"] = searchType;
  search_info["start"] = start_time;
  search_info["end"] = end_time;
  search_info["category"] = search_cate;
  search_info["location"] = search_loc;
  console.log(search_info);
  let JStr = JSON.stringify(search_info);
  xhr.send(JStr);
  xhr.onloadend = function() {
    let responseStr = xhr.responseText; // get the JSON string
    console.log(responseStr);
    let itemList = JSON.parse(responseStr); // turn it into an object
    displayList(itemList);
  };
}
/*============================= DONE =============================*/

// ================ DISPLAY RESULTS ======================
function setDateTime(msecnd) {
  // given milliseconds, output the date time string
  let obj = new Date(msecnd);
  let date = obj.toDateString();
  let time = obj.toLocaleTimeString();
  let result = date + " " + time;
  return result;
}

function displayList(itemList) {
  var i;
  console.log(itemList.length);
  for (i = 0; i < itemList.length; ++i) {
    var displayList = document.getElementById("displayList");
    // read from json
    var itemInfo = itemList[i];
    var title = itemInfo.title;
    var description = itemInfo.description;
    var category = itemInfo.category;
    var time = setDateTime(itemInfo.time);
    var location = itemInfo.location;
    var type = itemInfo.type;
    var imgUrl = itemInfo.photoURL;

    // create big ul tag
    var itemUl = document.createElement("ul");
    itemUl.className = "lostFoundItem";
    displayList.appendChild(itemUl);

    // add header div
    var headerDiv = document.createElement("div");
    headerDiv.className = "item-header";
    headerDiv.innerHTML =
      '<span class="itemTitle">' +
      title +
      '</span><button type="button" class="readMoreBtn"><span class="More">More</span></button>';
    itemUl.appendChild(headerDiv);

    // create content div tag
    var contentDiv = document.createElement("div");
    contentDiv.className = "content";
    itemUl.appendChild(contentDiv);

    // create image tag when image url exists
    if (imgUrl != "") {
      var img = document.createElement("img");
      img.src = "http://ecs162.org:3000/images/kyewang/" + imgUrl;
      console.log(img.src);
      img.className = "image-content";
      contentDiv.appendChild(img);
    }

    // create text content div tag
    var textContentDiv = document.createElement("div");
    textContentDiv.className = "text-content";
    contentDiv.appendChild(textContentDiv);

    // create attribute div
    var attrDiv = document.createElement("div");
    attrDiv.className = "itemAttribute";
    attrDiv.innerHTML =
      '<li class="attr"><p class="attr-title">Category</p><p class="attr-title">Location</p><p class="attr-title">Date</p></li><li class="attr"><p class="attr-text">' +
      category +
      '</p><p class="attr-text">' +
      location +
      '</p><p class="attr-text">' +
      time +
      "</p></li>";
    textContentDiv.appendChild(attrDiv);

    // create description
    var descriptionDiv = document.createElement("div");
    descriptionDiv.className = "itemDescription";
    descriptionDiv.innerHTML =
      '<p class="description-text">' + description + "</p>";
    textContentDiv.appendChild(descriptionDiv);

    // add display less button
    var lessBtn = document.createElement("button");
    lessBtn.className = "readLessBtn";
    lessBtn.type = "button";
    lessBtn.innerHTML =
      '<span class="itemTitle"></span><span class="Less">Less</span>';
    itemUl.appendChild(lessBtn);
    if (type == "found") {
      document.getElementsByClassName("lostFoundItem")[
        i
      ].style.backgroundColor = "#feebb1";
      document.getElementsByClassName("readLessBtn")[i].style.backgroundColor =
        "#feebb1";
      document.getElementsByClassName("readMoreBtn")[i].style.backgroundColor =
        "#feebb1";
    }
  }
  readMore();
  readLess();
}
// displayList(itemList);

function readMore() {
  var coll = document.getElementsByClassName("readMoreBtn");
  var i;
  for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function() {
      this.classList.toggle("active");
      var lessBtn = this.parentNode.nextElementSibling.nextElementSibling;
      var content = this.parentNode.nextElementSibling;
      if ((lessBtn.style.display = "none")) {
        content.style.display = "flex";
        lessBtn.style.display = "flex";
        lessBtn.getElementsByClassName("Less")[0].style.display = "flex";
        this.style.display = "none";
      }
    });
  }
}

function readLess() {
  var coll = document.getElementsByClassName("readLessBtn");
  var i;

  for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function() {
      this.classList.toggle("active");
      var moreBtn = this.previousElementSibling.previousElementSibling.getElementsByClassName(
        "readMoreBtn"
      )[0];
      var content = this.previousElementSibling;
      if ((moreBtn.style.display = "none")) {
        content.style.display = "none";
        this.style.display = "none";
        this.getElementsByClassName("Less")[0].style.display = "none";
        moreBtn.style.display = "flex";
      }
    });
  }
}

/*============================= DONE =============================*/

//============================= BUTTON ===============================
function toMain() {
  let url = glitch_url + "/user/main.html";
  window.location = url;
}
document.getElementById("logoimage").addEventListener("click", toMain);

function backSearch() {
  let mytype = "found";
  if (searchType == "found") {
    mytype = "lost";
  }
  let searchUrl = glitch_url + "/user/search.html?type=" + mytype;
  window.location = searchUrl;
}
document.getElementById("editBtn").addEventListener("click", backSearch);

let gift = document.getElementById("gift")
let item = document.getElementById("item")
let again = document.getElementById("again")
let background = document.getElementById("background")

gift.addEventListener("click", opening)

again.addEventListener("click", reset)

var ods = [items, rareitems, mythicitems]

var trashitems = ["🫘", "🥫", "🥦", "🥒"]
var items = ["🍓", "🥪", "🧃", "🍌", "🍉", "🍇", "🍎", "🥑", "🍊", "🍋", "🍍", "🍐", "🍒", "🥝", "🥥"]
var rareitems = ["🍩", "🍔", "🧇", "🍫", "🍭", "🍬", "🌮"]
var mythicitems = ["🥐", "🧀", "🍕", "🍪"]

function opening() {
    again.style.scale = 1;
    gift.style.pointerEvents = "none";
    gift.style.opacity = 0;

    var weight = Math.floor(Math.random() * 999)

    if (weight >= 850 &&  weight <= 950) {
        randomarray = rareitems
        background.style.backgroundColor = "#567BFF";
    }
    else if (weight > 950 &&  weight <= 999) {
        randomarray = mythicitems
        background.style.backgroundColor = "#E11DE2";
    }
    else if (weight >= 0 &&  weight <= 150) {
        randomarray = trashitems
        background.style.backgroundColor = "#603400";
    }
    else {
        randomarray = items
        background.style.backgroundColor = "#D1EFFF";
    }

    var randomitem = randomarray[Math.floor(Math.random() * randomarray.length)];

    item.innerHTML = randomitem
    item.style.scale= 1;
    item.style.opacity= 1;

    again.style.pointerEvents = "all";
    again.style.opacity = 1;
}

function reset () {
    gift.style.pointerEvents = "all";
    gift.style.opacity = 1;

    item.style.scale= 0;
    item.style.opacity= 0;

    again.style.pointerEvents = "none";
    again.style.opacity = 0;
    again.style.scale = 0;

    background.style.backgroundColor = "#FFFFFF";
}

let gift = document.getElementById("gift")
let item = document.getElementById("item")
let again = document.getElementById("again")
let triesleft = document.getElementById("tries")

    triesleft.style.opacity = 0
    triesleft.style.scale = 0

gift.addEventListener("click", opening)

again.addEventListener("click", reset)

var tries = Number(localStorage["tries"])
var time = localStorage["time"]

if (localStorage.getItem("tries") === null){
    tries = 10;
    triesleft.innerHTML = "Welcome! Every day you get " + String(tries) + " Tries! Goodluck"
    triesleft.style.opacity = 0.5
    triesleft.style.scale = 1
}

if (Number(localStorage["tries"]) > 0) {
    tries = Number(localStorage["tries"])
    triesleft.innerHTML = "You still have " + String(tries) + " Tries left from your last session!"
    triesleft.style.opacity = 0.5
    triesleft.style.scale = 1
}

else if (Number(localStorage.getItem("time")) < Date.now() + 43200000) {
    tries = 10
    triesleft.innerHTML = "Welcome back!"
}

var color = "#FFFFFF"

var trashitems = ["🫘", "🥫", "🥦", "🥒"]
var items = ["🍓", "🥪", "🧃", "🍌", "🍉", "🍇", "🍎", "🥑", "🍊", "🍋", "🍍", "🍐", "🍒", "🥝", "🥥"]
var rareitems = ["🍩", "🍔", "🧇", "🍫", "🍭", "🍬", "🌮"]
var mythicitems = ["🥐", "🧀", "🍕", "🍪"]

function opening() {
    if (tries > 0) {
        tries -= 1
        triesleft.innerHTML = String(tries) + " Tries left"
        localStorage['tries'] = tries
        localStorage['time'] = Date.now()
        
        again.style.scale = 1

        gift.style.pointerEvents = "none"
        gift.style.opacity = 0

        var weight = Math.floor(Math.random() * 999)

        if (weight >= 850 &&  weight <= 950) {
            randomarray = rareitems
            color = "#567BFF"
        }
        else if (weight > 950 &&  weight <= 999) {
            randomarray = mythicitems
            color = "#E11DE2"
        }
        else if (weight >= 0 &&  weight <= 150) {
            randomarray = trashitems
            color = "#603400"
        }
        else {
            randomarray = items
            color = "#D1EFFF"
        }

        document.getElementById("background").style.backgroundColor = color

        var randomitem = randomarray[Math.floor(Math.random() * randomarray.length)]

        item.innerHTML = randomitem
        item.style.scale = 1
        item.style.opacity = 1

        again.style.pointerEvents = "all"
        again.style.opacity = 1

        triesleft.style.opacity = 0.5
        triesleft.style.scale = 1
    }

    else {
        triesleft.innerHTML = String(tries) + " Tries left, Try again tomorow!"
        triesleft.style.opacity = 0.5
        triesleft.style.scale = 1
    }
}

function reset () {
    gift.style.pointerEvents = "all"
    gift.style.opacity = 1

    item.style.scale = 0
    item.style.opacity = 0

    again.style.pointerEvents = "none"
    again.style.opacity = 0
    again.style.scale = 0

    triesleft.style.opacity = 0
    triesleft.style.scale = 0

    document.getElementById("background").style.backgroundColor = "#FFFFFF"
}
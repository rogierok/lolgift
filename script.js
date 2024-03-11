let gift = document.getElementById("gift")
let item = document.getElementById("item")
let again = document.getElementById("again")

gift.addEventListener("click", opening)

again.addEventListener("click", reset)

var items = ["🍩", "🍓", "🍔", "🍔", "🍔", "🍪", "🥪", "🍕", "🧇", "🍫", "🍭", "🍬", "🧃", "🍌", "🍉", "🍇", "🍎", "🥑", "🥦", "🥒", "🥒"]

function opening() {
    again.style.scale = 1;
    gift.style.pointerEvents = "none";
    gift.style.opacity = 0;

    var randomitem = items[Math.floor(Math.random() * items.length)];

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
}

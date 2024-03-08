let gift = document.getElementById("gift")
let item = document.getElementById("item")
gift.addEventListener("click", opening,{once:true})

var items = ["🍩", "🍓", "🍔", "🍔", "🍔", "🍪", "🥪", "🍕", "🧇", "🍫", "🍭", "🍬", "🧃", "🍌", "🍉", "🍇", "🍎", "🥑"]

function opening() {
    console.log("yooo")
    gift.style.opacity= 0;

    var randomitem = items[Math.floor(Math.random() * items.length)];

    item.innerHTML = randomitem
    item.style.scale= 1;
    item.style.opacity= 1;
}

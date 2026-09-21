const starterProducts=[
{id:1,name:"Sunset Canvas",category:"art",price:65,emoji:"🎨",description:"Original handmade artwork.",seller:"ArtNSculps Studio"},
{id:2,name:"Pink Chrome Nails",category:"nails",price:28,emoji:"💅",description:"Handmade press-on nail set.",seller:"Mia"},
{id:3,name:"Vintage Denim Jacket",category:"clothing",price:45,emoji:"👗",description:"Unique vintage denim jacket.",seller:"Sofia"},
{id:4,name:"Abstract Print",category:"art",price:35,emoji:"🖼️",description:"Limited edition art print.",seller:"Ava"},
{id:5,name:"French Tip Nails",category:"nails",price:24,emoji:"💅",description:"Classic handmade French tips.",seller:"Mia"},
{id:6,name:"Brown Y2K Top",category:"clothing",price:30,emoji:"👚",description:"Cute Y2K-inspired top.",seller:"Sofia"},
{id:7,name:"Flower Painting",category:"art",price:75,emoji:"🌸",description:"Original floral painting.",seller:"Ava"},
{id:8,name:"Butterfly Nails",category:"nails",price:32,emoji:"🦋",description:"Hand-painted butterfly set.",seller:"Mia"}
];
let products=JSON.parse(localStorage.getItem("artnsculpsProducts")||"null")||starterProducts;
let cart=JSON.parse(localStorage.getItem("artnsculpsCart")||"[]");

function save(){localStorage.setItem("artnsculpsProducts",JSON.stringify(products));localStorage.setItem("artnsculpsCart",JSON.stringify(cart));}
function currentUser(){return JSON.parse(localStorage.getItem("artnsculpsUser")||"null");}

function displayProducts(list=products){
 const grid=document.getElementById("productGrid"); grid.innerHTML="";
 if(!list.length){grid.innerHTML='<p class="empty">No items found.</p>';return;}
 list.forEach(p=>{
  const card=document.createElement("article"); card.className="product";
  const visual=p.image?`<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}">`:`<div class="placeholder">${p.emoji}</div>`;
  card.innerHTML=`<div class="product-image">${visual}</div><div class="product-info"><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.description)}</p><small>${escapeHtml(p.category)} · ${escapeHtml(p.seller||"Creator")}</small><div class="price">$${Number(p.price).toFixed(2)}</div><button class="btn add" onclick="addToCart(${p.id})">Add to cart</button></div>`;
  grid.appendChild(card);
 });
}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function filterProducts(category){
 document.getElementById("categoryFilter").value=category;
 displayProducts(category==="all"?products:products.filter(p=>p.category===category));
 document.getElementById("shop").scrollIntoView({behavior:"smooth"});
}
function addToCart(id){const p=products.find(x=>x.id===id);if(p){cart.push(p);save();updateCart();alert(`${p.name} was added to your cart.`);}}
function updateCart(){
 document.getElementById("cartCount").textContent=cart.length;
 const box=document.getElementById("cartItems");box.innerHTML="";
 let total=0;
 if(!cart.length) box.innerHTML='<p class="empty">Your cart is empty.</p>';
 cart.forEach((p,i)=>{total+=Number(p.price);const row=document.createElement("div");row.className="cart-row";row.innerHTML=`<div><strong>${escapeHtml(p.name)}</strong><br>$${Number(p.price).toFixed(2)}</div><button onclick="removeFromCart(${i})">Remove</button>`;box.appendChild(row);});
 document.getElementById("cartTotal").textContent=total.toFixed(2);
}
function removeFromCart(i){cart.splice(i,1);save();updateCart();}
function openCart(){updateCart();openModal("cartModal");}
function openModal(id){document.getElementById(id).classList.add("active");}
function closeModal(id){document.getElementById(id).classList.remove("active");}
function openAccount(){
 const u=currentUser(); document.getElementById("loginView").hidden=!!u;document.getElementById("signupView").hidden=true;document.getElementById("accountView").hidden=!u;
 if(u) document.getElementById("welcomeName").textContent=`Hi, ${u.name}!`;
 openModal("accountModal");
}
function showSignup(){document.getElementById("loginView").hidden=true;document.getElementById("signupView").hidden=false;}
function showLogin(){document.getElementById("loginView").hidden=false;document.getElementById("signupView").hidden=true;}
function signup(){
 const name=document.getElementById("signupName").value.trim(),email=document.getElementById("signupEmail").value.trim(),password=document.getElementById("signupPassword").value;
 if(!name||!email||!password)return alert("Please complete all fields.");
 localStorage.setItem("artnsculpsUser",JSON.stringify({name,email,password}));
 alert(`Welcome to ArtNSculps, ${name}!`);openAccount();
}
function login(){
 const email=document.getElementById("loginEmail").value.trim(),password=document.getElementById("loginPassword").value;
 const saved=currentUser();
 if(saved&&saved.email===email&&saved.password===password){alert("Welcome back!");openAccount();}else{alert("For this demo, create an account first on this device.");}
}
function logout(){localStorage.removeItem("artnsculpsUser");closeModal("accountModal");}
function openSell(){if(!currentUser()){alert("Create an account first so your listing can belong to you.");openAccount();showSignup();return;}openModal("sellModal");}
function listItem(){
 const name=document.getElementById("itemName").value.trim(),category=document.getElementById("itemCategory").value,price=Number(document.getElementById("itemPrice").value),image=document.getElementById("itemImage").value.trim(),description=document.getElementById("itemDescription").value.trim(),u=currentUser();
 if(!name||!price||!description)return alert("Please complete the item name, price and description.");
 const p={id:Date.now(),name,category,price,image,description,seller:u.name,owner:u.email,emoji:category==="art"?"🎨":category==="nails"?"💅":"👗"};
 products.push(p);save();displayProducts();closeModal("sellModal");["itemName","itemPrice","itemImage","itemDescription"].forEach(id=>document.getElementById(id).value="");alert("Your item is now listed on this browser.");
}
function searchProducts(){
 const q=document.getElementById("searchInput").value.toLowerCase().trim(),box=document.getElementById("searchResults");box.innerHTML="";
 products.filter(p=>(p.name+" "+p.category+" "+p.description).toLowerCase().includes(q)).slice(0,12).forEach(p=>{const d=document.createElement("div");d.className="mini-result";d.innerHTML=`<span>${escapeHtml(p.emoji)} ${escapeHtml(p.name)} — $${Number(p.price).toFixed(2)}</span><button onclick="addToCart(${p.id})">Add</button>`;box.appendChild(d);});
}
function showPurchases(){const orders=JSON.parse(localStorage.getItem("artnsculpsPurchases")||"[]");document.getElementById("accountDetails").innerHTML=orders.length?orders.map(o=>`<p>${escapeHtml(o.name)} — $${Number(o.price).toFixed(2)}</p>`).join(""):'<p class="empty">No purchases yet.</p>';}
function showListings(){const u=currentUser();const mine=products.filter(p=>p.owner===u.email);document.getElementById("accountDetails").innerHTML=mine.length?mine.map(p=>`<p>${escapeHtml(p.name)} — $${Number(p.price).toFixed(2)}</p>`).join(""):'<p class="empty">You have no listings yet.</p>';}
function checkout(){
 if(!cart.length)return alert("Your cart is empty.");
 const u=currentUser();if(!u){alert("Create an account before checkout.");closeModal("cartModal");openAccount();showSignup();return;}
 const old=JSON.parse(localStorage.getItem("artnsculpsPurchases")||"[]");localStorage.setItem("artnsculpsPurchases",JSON.stringify([...old,...cart]));
 cart=[];save();updateCart();closeModal("cartModal");alert("Demo checkout complete! A real payment processor can be connected next.");
}
document.addEventListener("click",e=>{if(e.target.classList.contains("modal"))e.target.classList.remove("active");});
displayProducts();updateCart();
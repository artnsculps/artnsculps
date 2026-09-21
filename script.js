/*
  ArtNSculps backend-ready frontend
  1) Put your Supabase URL + publishable/anon key in supabase-config.js
  2) Set CHECKOUT_API_URL to your deployed Vercel API URL if different from /api/create-checkout-session
*/

const SUPABASE_URL = window.ARTNSCULPS_SUPABASE_URL;
const SUPABASE_KEY = window.ARTNSCULPS_SUPABASE_KEY;
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const starterProducts = [
 {id:"demo-1",name:"Sunset Canvas",category:"art",price:65,emoji:"🎨",description:"Original handmade artwork.",seller:"ArtNSculps Studio"},
 {id:"demo-2",name:"Pink Chrome Nails",category:"nails",price:28,emoji:"💅",description:"Handmade press-on nail set.",seller:"Mia"},
 {id:"demo-3",name:"Vintage Denim Jacket",category:"clothing",price:45,emoji:"👗",description:"Unique vintage denim jacket.",seller:"Sofia"},
 {id:"demo-4",name:"Abstract Print",category:"art",price:35,emoji:"🖼️",description:"Limited edition art print.",seller:"Ava"},
 {id:"demo-5",name:"French Tip Nails",category:"nails",price:24,emoji:"💅",description:"Classic handmade French tips.",seller:"Mia"},
 {id:"demo-6",name:"Brown Y2K Top",category:"clothing",price:30,emoji:"👚",description:"Cute Y2K-inspired top.",seller:"Sofia"},
 {id:"demo-7",name:"Flower Painting",category:"art",price:75,emoji:"🌸",description:"Original floral painting.",seller:"Ava"},
 {id:"demo-8",name:"Butterfly Nails",category:"nails",price:32,emoji:"🦋",description:"Hand-painted butterfly set.",seller:"Mia"}
];
let products = [];
let cart = JSON.parse(localStorage.getItem("artnsculpsCart") || "[]");
let currentSession = null;

function saveCart(){localStorage.setItem("artnsculpsCart", JSON.stringify(cart));}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}

async function loadProducts(){
  const {data,error}=await supabase.from("products").select("id,name,description,price,image_url,category,seller_name,owner_id,active").eq("active",true).order("created_at",{ascending:false});
  products = (!error && data && data.length) ? data.map(p=>({...p,emoji:p.category==="art"?"🎨":p.category==="nails"?"💅":"👗",seller:p.seller_name})) : starterProducts;
  displayProducts();
}

function displayProducts(list=products){
 const grid=document.getElementById("productGrid"); grid.innerHTML="";
 if(!list.length){grid.innerHTML='<p class="empty">No items found.</p>';return;}
 list.forEach(p=>{
  const card=document.createElement("article"); card.className="product";
  const visual=p.image_url?`<img src="${escapeHtml(p.image_url)}" alt="${escapeHtml(p.name)}">`:`<div class="placeholder">${p.emoji||"✨"}</div>`;
  card.innerHTML=`<div class="product-image">${visual}</div><div class="product-info"><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.description)}</p><small>${escapeHtml(p.category)} · ${escapeHtml(p.seller||"Creator")}</small><div class="price">$${Number(p.price).toFixed(2)}</div><button class="btn add" onclick="addToCart('${String(p.id).replaceAll("'","\\'")}')">Add to cart</button></div>`;
  grid.appendChild(card);
 });
}
function filterProducts(category){
 document.getElementById("categoryFilter").value=category;
 displayProducts(category==="all"?products:products.filter(p=>p.category===category));
 document.getElementById("shop").scrollIntoView({behavior:"smooth"});
}
function addToCart(id){
 const p=products.find(x=>String(x.id)===String(id));
 if(!p)return;
 cart.push({id:p.id,name:p.name,price:p.price,emoji:p.emoji});
 saveCart(); updateCart(); alert(`${p.name} was added to your cart.`);
}
function updateCart(){
 document.getElementById("cartCount").textContent=cart.length;
 const box=document.getElementById("cartItems");box.innerHTML="";
 let total=0;
 if(!cart.length) box.innerHTML='<p class="empty">Your cart is empty.</p>';
 cart.forEach((p,i)=>{total+=Number(p.price);const row=document.createElement("div");row.className="cart-row";row.innerHTML=`<div><strong>${escapeHtml(p.name)}</strong><br>$${Number(p.price).toFixed(2)}</div><button onclick="removeFromCart(${i})">Remove</button>`;box.appendChild(row);});
 document.getElementById("cartTotal").textContent=total.toFixed(2);
}
function removeFromCart(i){cart.splice(i,1);saveCart();updateCart();}
function openCart(){updateCart();openModal("cartModal");}
function openModal(id){document.getElementById(id).classList.add("active");}
function closeModal(id){document.getElementById(id).classList.remove("active");}

async function refreshAccount(){
 const {data:{session}}=await supabase.auth.getSession();
 currentSession=session;
 document.getElementById("loginView").hidden=!!session;
 document.getElementById("signupView").hidden=true;
 document.getElementById("accountView").hidden=!session;
 if(session){
   const name=session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "there";
   document.getElementById("welcomeName").textContent=`Hi, ${name}!`;
 }
}
async function openAccount(){await refreshAccount();openModal("accountModal");}
function showSignup(){document.getElementById("loginView").hidden=true;document.getElementById("signupView").hidden=false;}
function showLogin(){document.getElementById("loginView").hidden=false;document.getElementById("signupView").hidden=true;}

async function signup(){
 const name=document.getElementById("signupName").value.trim(),email=document.getElementById("signupEmail").value.trim(),password=document.getElementById("signupPassword").value;
 if(!name||!email||!password)return alert("Please complete all fields.");
 const {error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name},emailRedirectTo:location.origin}});
 if(error)return alert(error.message);
 alert("Account created! Check your email if email confirmation is enabled.");
 await refreshAccount();
}
async function login(){
 const email=document.getElementById("loginEmail").value.trim(),password=document.getElementById("loginPassword").value;
 const {error}=await supabase.auth.signInWithPassword({email,password});
 if(error)return alert(error.message);
 await refreshAccount();
}
async function logout(){await supabase.auth.signOut();await refreshAccount();closeModal("accountModal");}
async function openSell(){if(!currentSession){await openAccount();showSignup();return;}openModal("sellModal");}

async function listItem(){
 if(!currentSession)return alert("Please sign in first.");
 const name=document.getElementById("itemName").value.trim(),category=document.getElementById("itemCategory").value,price=Number(document.getElementById("itemPrice").value),image=document.getElementById("itemImage").value.trim(),description=document.getElementById("itemDescription").value.trim();
 if(!name||!price||!description)return alert("Please complete the item name, price and description.");
 const seller=currentSession.user.user_metadata?.full_name||currentSession.user.email;
 const {error}=await supabase.from("products").insert({name,category,price,image_url:image||null,description,seller_name:seller,owner_id:currentSession.user.id});
 if(error)return alert(error.message);
 closeModal("sellModal"); await loadProducts(); alert("Your item was listed.");
}

function searchProducts(){
 const q=document.getElementById("searchInput").value.toLowerCase().trim(),box=document.getElementById("searchResults");box.innerHTML="";
 products.filter(p=>(p.name+" "+p.category+" "+p.description).toLowerCase().includes(q)).slice(0,12).forEach(p=>{const d=document.createElement("div");d.className="mini-result";d.innerHTML=`<span>${escapeHtml(p.emoji)} ${escapeHtml(p.name)} — $${Number(p.price).toFixed(2)}</span><button onclick="addToCart('${String(p.id).replaceAll("'","\\'")}')">Add</button>`;box.appendChild(d);});
}

function showPurchases(){
 if(!currentSession)return;
 supabase.from("orders").select("id,total_amount,status,created_at,order_items(product_name,unit_amount,quantity)").eq("buyer_id",currentSession.user.id).order("created_at",{ascending:false}).then(({data,error})=>{
   document.getElementById("accountDetails").innerHTML=error?`<p class="empty">${escapeHtml(error.message)}</p>`:data?.length?data.map(o=>`<div class="cart-row"><div><strong>Order ${escapeHtml(o.id.slice(0,8))}</strong><br>${new Date(o.created_at).toLocaleDateString()} · ${escapeHtml(o.status)}</div><b>$${Number(o.total_amount).toFixed(2)}</b></div>`).join(""):'<p class="empty">No purchases yet.</p>';
 });
}
function showListings(){
 if(!currentSession)return;
 supabase.from("products").select("name,price,active").eq("owner_id",currentSession.user.id).order("created_at",{ascending:false}).then(({data,error})=>{
  document.getElementById("accountDetails").innerHTML=error?`<p class="empty">${escapeHtml(error.message)}</p>`:data?.length?data.map(p=>`<p>${escapeHtml(p.name)} — $${Number(p.price).toFixed(2)} ${p.active?"":"(inactive)"}</p>`).join(""):'<p class="empty">You have no listings yet.</p>';
 });
}

async function checkout(){
 if(!cart.length)return alert("Your cart is empty.");
 if(!currentSession){closeModal("cartModal");await openAccount();showLogin();return;}
 try{
   const response=await fetch((window.ARTNSCULPS_CHECKOUT_API||"/api/create-checkout-session"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({productIds:cart.map(p=>p.id)})});
   const data=await response.json();
   if(!response.ok)throw new Error(data.error||"Could not start checkout.");
   window.location.href=data.url;
 }catch(e){alert(e.message);}
}

document.addEventListener("click",e=>{if(e.target.classList.contains("modal"))e.target.classList.remove("active");});
supabase.auth.onAuthStateChange((_event,session)=>{currentSession=session;refreshAccount();});
loadProducts();updateCart();refreshAccount();

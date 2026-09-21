const starterProducts = [ 

  {id:"s1",name:"Sunset Canvas",category:"art",price:65,description:"Original handmade artwork.",emoji:"🎨"}, 

  {id:"s2",name:"Pink Chrome Nails",category:"nails",price:28,description:"Handmade press-on nail set.",emoji:"💅"}, 

  {id:"s3",name:"Vintage Denim Jacket",category:"clothing",price:45,description:"Unique vintage fashion piece.",emoji:"👗"} 

]; 




let products = []; 

let cart = JSON.parse(localStorage.getItem("artnsculpsCart") || "[]"); 

 

function saveCart() { 

  localStorage.setItem("artnsculpsCart", JSON.stringify(cart)); 

  updateCartCount(); 

} 

 

function updateCartCount() { 

  const count = document.getElementById("cartCount"); 

  if (count) count.textContent = cart.reduce((sum, item) => sum + item.quantity, 0); 

} 

 

function escapeHTML(text = "") { 

  return String(text).replace(/[&<>"']/g, char => ({ 

    "&":"&amp;", 

    "<":"&lt;", 

    ">":"&gt;", 

    '"':"&quot;", 

    "'":"&#039;" 

  }[char])); 

} 

 

async function loadProducts() { 

  const { data, error } = await supabaseClient 

    .from("products") 

    .select("*") 

    .order("created_at", { ascending: false }); 

 

  if (error) { 

    console.error(error); 

    products = starterProducts; 

  } else { 

    products = data && data.length ? data : starterProducts; 

  } 

 

  renderProducts(products); 

} 

 

function renderProducts(list) { 

  const grid = document.getElementById("productGrid"); 

  if (!grid) return; 

 

  if (!list.length) { 

    grid.innerHTML = "<p>No items found.</p>"; 

    return; 

  } 

 

  grid.innerHTML = list.map(product => ` 

    <article class="product-card"> 

      <div class="product-image"> 

        ${product.image_url 

          ? `<img src="${escapeHTML(product.image_url)}" alt="${escapeHTML(product.name)}">` 

          : `<span style="font-size:3rem">${product.emoji || "✨"}</span>` 

        } 

      </div> 

      <div class="product-info"> 

        <small>${escapeHTML(product.category)}</small> 

        <h3>${escapeHTML(product.name)}</h3> 

        <p>${escapeHTML(product.description || "")}</p> 

        <strong>$${Number(product.price).toFixed(2)}</strong> 

        <button class="btn full" onclick="addToCart('${product.id}')"> 

          Add to cart 

        </button> 

      </div> 

    </article> 

  `).join(""); 

} 

 

function filterProducts(category) { 

  const list = category === "all" 

    ? products 

    : products.filter(product => product.category === category); 

 

  renderProducts(list); 

 

  const filter = document.getElementById("categoryFilter"); 

  if (filter) filter.value = category; 

} 

 

function searchProducts() { 

  const input = document.getElementById("searchInput"); 

  const results = document.getElementById("searchResults"); 

  if (!input || !results) return; 

 

  const search = input.value.toLowerCase().trim(); 

 

  const matches = products.filter(product => 

    product.name.toLowerCase().includes(search) || 

    product.category.toLowerCase().includes(search) || 

    (product.description || "").toLowerCase().includes(search) 

  ); 

 

  results.innerHTML = matches.map(product => ` 

    <div class="search-result"> 

      <strong>${escapeHTML(product.name)}</strong> 

      <span>$${Number(product.price).toFixed(2)}</span> 

    </div> 

  `).join("") || "<p>No items found.</p>"; 

} 

 

function addToCart(id) { 

  const product = products.find(item => String(item.id) === String(id)); 

  if (!product) return; 

 

  const existing = cart.find(item => String(item.id) === String(id)); 

 

  if (existing) { 

    existing.quantity++; 

  } else { 

    cart.push({ 

      id: product.id, 

      name: product.name, 

      price: Number(product.price), 

      quantity: 1 

    }); 

  } 

 

  saveCart(); 

  alert("Added to your cart!"); 

} 

 

function openCart() { 

  renderCart(); 

  openModal("cartModal"); 

} 

 

function renderCart() { 

  const container = document.getElementById("cartItems"); 

  const totalElement = document.getElementById("cartTotal"); 

 

  if (!container) return; 

 

  if (!cart.length) { 

    container.innerHTML = "<p>Your cart is empty.</p>"; 

    if (totalElement) totalElement.textContent = "0.00"; 

    return; 

  } 

 

  container.innerHTML = cart.map((item, index) => ` 

    <div class="cart-item"> 

      <strong>${escapeHTML(item.name)}</strong> 

      <span>$${item.price.toFixed(2)} × ${item.quantity}</span> 

      <button onclick="removeFromCart(${index})">Remove</button> 

    </div> 

  `).join(""); 

 

  const total = cart.reduce( 

    (sum, item) => sum + item.price * item.quantity, 

    0 

  ); 

 

  if (totalElement) totalElement.textContent = total.toFixed(2); 

} 

 

function removeFromCart(index) { 

  cart.splice(index, 1); 

  saveCart(); 

  renderCart(); 

} 

 

async function getCurrentUser() { 

  const { data } = await supabaseClient.auth.getUser(); 

  return data.user; 

} 

 

async function openAccount() { 

  const user = await getCurrentUser(); 

 

  if (user) { 

    showAccount(user); 

  } else { 

    showLogin(); 

  } 

 

  openModal("accountModal"); 

} 

 

function showLogin() { 

  document.getElementById("loginView").hidden = false; 

  document.getElementById("signupView").hidden = true; 

  document.getElementById("accountView").hidden = true; 

} 

 

function showSignup() { 

  document.getElementById("loginView").hidden = true; 

  document.getElementById("signupView").hidden = false; 

  document.getElementById("accountView").hidden = true; 

} 

 

async function signup() { 

  const name = document.getElementById("signupName").value.trim(); 

  const email = document.getElementById("signupEmail").value.trim(); 

  const password = document.getElementById("signupPassword").value; 

 

  if (!name || !email || password.length < 6) { 

    alert("Please enter your name, email, and a password of at least 6 characters."); 

    return; 

  } 

 

  const { error } = await supabaseClient.auth.signUp({ 

    email, 

    password, 

    options: { 

      data: { 

        full_name: name 

      } 

    } 

  }); 

 

  if (error) { 

    alert(error.message); 

    return; 

  } 

 

  alert("Account created! Check your email if email confirmation is required."); 

  showLogin(); 

} 

 

async function login() { 

  const email = document.getElementById("loginEmail").value.trim(); 

  const password = document.getElementById("loginPassword").value; 

 

  const { data, error } = await supabaseClient.auth.signInWithPassword({ 

    email, 

    password 

  }); 

 

  if (error) { 

    alert(error.message); 

    return; 

  } 

 

  showAccount(data.user); 

} 

 

function showAccount(user) { 

  document.getElementById("loginView").hidden = true; 

  document.getElementById("signupView").hidden = true; 

  document.getElementById("accountView").hidden = false; 

 

  const name = 

    user.user_metadata?.full_name || 

    user.email?.split("@")[0] || 

    "Welcome"; 

 

  document.getElementById("welcomeName").textContent = `Welcome, ${name}!`; 

 

  document.getElementById("accountDetails").innerHTML = 

    `<p>Signed in as ${escapeHTML(user.email)}</p>`; 

} 

 

async function logout() { 

  await supabaseClient.auth.signOut(); 

  closeModal("accountModal"); 

  alert("You have been logged out."); 

} 

 

async function openSell() { 

  const user = await getCurrentUser(); 

 

  if (!user) { 

    alert("Please create an account or log in before selling."); 

    openAccount(); 

    return; 

  } 

 

  openModal("sellModal"); 

} 

 

async function listItem() { 

  const user = await getCurrentUser(); 

 

  if (!user) { 

    alert("Please log in first."); 

    return; 

  } 

 

  const name = document.getElementById("itemName").value.trim(); 

  const category = document.getElementById("itemCategory").value; 

  const price = Number(document.getElementById("itemPrice").value); 

  const image_url = document.getElementById("itemImage").value.trim(); 

  const description = document.getElementById("itemDescription").value.trim(); 

 

  if (!name || !price || price <= 0) { 

    alert("Please enter an item name and a valid price."); 

    return; 

  } 

 

  const { error } = await supabaseClient 

    .from("products") 

    .insert({ 

      seller_id: user.id, 

      name, 

      category, 

      price, 

      image_url: image_url || null, 

      description 

    }); 

 

  if (error) { 

    alert(error.message); 

    return; 

  } 

 

  alert("Your item has been listed!"); 

  closeModal("sellModal"); 

 

  document.getElementById("itemName").value = ""; 

  document.getElementById("itemPrice").value = ""; 

  document.getElementById("itemImage").value = ""; 

  document.getElementById("itemDescription").value = ""; 

 

  await loadProducts(); 

} 

 

async function showListings() { 

  const user = await getCurrentUser(); 

  if (!user) return; 

 

  const { data, error } = await supabaseClient 

    .from("products") 

    .select("*") 

    .eq("seller_id", user.id) 

    .order("created_at", { ascending: false }); 

 

  if (error) { 

    alert(error.message); 

    return; 

  } 

 

  document.getElementById("accountDetails").innerHTML = 

    data.length 

      ? data.map(item => `<p>🏷️ ${escapeHTML(item.name)} — $${Number(item.price).toFixed(2)}</p>`).join("") 

      : "<p>You haven't listed anything yet.</p>"; 

} 

 

async function showPurchases() { 

  const user = await getCurrentUser(); 

  if (!user) return; 

 

  const { data, error } = await supabaseClient 

    .from("orders") 

    .select("*") 

    .eq("buyer_id", user.id) 

    .order("created_at", { ascending: false }); 

 

  if (error) { 

    alert(error.message); 

    return; 

  } 

 

  document.getElementById("accountDetails").innerHTML = 

    data.length 

      ? data.map(order => 

          `<p>🛍️ Order #${order.id} — $${Number(order.total).toFixed(2)} — ${escapeHTML(order.status)}</p>` 

        ).join("") 

      : "<p>You don't have any purchases yet.</p>"; 

} 

 

function checkout() { 

  alert("Your cart is ready! Real payment checkout will be connected next."); 

} 

 

function openModal(id) { 

  const modal = document.getElementById(id); 

  if (modal) modal.classList.add("open"); 

} 

 

function closeModal(id) { 

  const modal = document.getElementById(id); 

  if (modal) modal.classList.remove("open"); 

} 

 

document.addEventListener("DOMContentLoaded", () => { 

  updateCartCount(); 

  loadProducts(); 

 

  supabaseClient.auth.getSession().then(({ data }) => { 

    if (data.session) { 

      console.log("ArtNSculps user is signed in."); 

    } 

  }); 

}); 

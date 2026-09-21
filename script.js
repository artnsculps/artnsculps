const starterProducts = [
  {
    id: "art-1",
    name: "Sunset Bloom",
    category: "art",
    price: 45,
    image: "<iframe src="https://assets.pinterest.com/ext/embed.html?id=1093459984556503869" height="520" width="236" frameborder="0" scrolling="no" ></iframe>",
    description: "Original colorful artwork inspired by Floridas beautiful sunsets."
  },
  {
    id: "art-2",
    name: "Ocean Dreams",
    category: "art",
    price: 60,
    image: "",
    description: "Handmade ocean-inspired artwork for your space."
  },
  {
    id: "art-3",
    name: "Abstract Muse",
    category: "art",
    price: 35,
    image: "",
    description: "A modern abstract piece with expressive shapes and texture."
  },
  {
    id: "nails-1",
    name: "Pink Pearl Set",
    category: "nails",
    price: 18,
    image: "",
    description: "Glossy handmade press-on nail set with a soft pearl finish."
  },
  {
    id: "nails-2",
    name: "Cherry Gloss Set",
    category: "nails",
    price: 20,
    image: "",
    description: "Cute glossy press-on nails with cherry-inspired details."
  },
  {
    id: "nails-3",
    name: "French Bloom Set",
    category: "nails",
    price: 22,
    image: "",
    description: "Classic French-style set with delicate floral details."
  },
  {
    id: "clothing-1",
    name: "Vintage Graphic Tee",
    category: "clothing",
    price: 28,
    image: "",
    description: "One-of-a-kind vintage-inspired graphic tee."
  },
  {
    id: "clothing-2",
    name: "Everyday Denim Jacket",
    category: "clothing",
    price: 48,
    image: "",
    description: "Classic denim jacket that works with almost anything."
  },
  {
    id: "clothing-3",
    name: "Cozy Knit Top",
    category: "clothing",
    price: 32,
    image: "",
    description: "Soft knit top for an easy everyday look."
  }
];

let products = [];
let cart = JSON.parse(localStorage.getItem("artnsculps_cart") || "[]");

function getLocalProducts() {
  try {
    return JSON.parse(localStorage.getItem("artnsculps_products") || "[]");
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem("artnsculps_cart", JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const count = document.getElementById("cartCount");

  if (count) {
    count.textContent = cart.reduce(
      (total, item) => total + (item.quantity || 1),
      0
    );
  }
}

function escapeHTML(value) {
  return String(value || "").replace(/[&<>"']/g, function (char) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char];
  });
}

function categoryName(category) {
  if (category === "nails") {
    return "Press-On Nails";
  }

  return category.charAt(0).toUpperCase() + category.slice(1);
}

function productEmoji(category) {
  if (category === "art") return "✎𓂃";
  if (category === "nails") return "ྀིྀི";
  return "👗";
}
function filterProducts(category) {
  const filtered = products.filter(function(product) {
    return product.category === category;
  });

  renderProducts(filtered);

  document.getElementById("shop").scrollIntoView({
    behavior: "smooth"
  });
}
function renderProducts(list) {
  const grid = document.getElementById("productGrid");

  if (!grid) return;

  if (!list.length) {
    grid.innerHTML = "<p>No items found yet.</p>";
    return;
  }

  grid.innerHTML = list.map(function (product) {
    return `
      <article class="product-card">

        <div class="product-image">
          ${
            product.image
              ? `
                <img
                  src="${escapeHTML(product.image)}"
                  alt="${escapeHTML(product.name)}"
                >
              `
              : `
                <span class="product-placeholder">
                  ${productEmoji(product.category)}
                </span>
              `
          }
        </div>

        <div class="product-info">

          <small>
            ${escapeHTML(categoryName(product.category))}
          </small>

          <h3>
            ${escapeHTML(product.name)}
          </h3>

          <p>
            ${escapeHTML(
              product.description ||
              "A unique ArtNSculps marketplace item."
            )}
          </p>

          <div class="product-bottom">

            <strong>
              $${Number(product.price).toFixed(2)}
            </strong>

            <button
              class="btn small"
              onclick="addToCart('${escapeHTML(String(product.id))}')"
            >
              Add to cart
            </button>

          </div>

        </div>

      </article>
    `;
  }).join("");
}

function filterProducts(category) {

  if (!category) {
    category = "all";
  }

  const filter = document.getElementById("categoryFilter");

  if (filter) {
    filter.value = category;
  }

  if (category === "all") {
    renderProducts(products);
  } else {
    renderProducts(
      products.filter(function (product) {
        return product.category === category;
      })
    );
  }

  const shop = document.getElementById("shop");

  if (shop) {
    shop.scrollIntoView({
      behavior: "smooth"
    });
  }
}

function addToCart(id) {

  const product = products.find(function (item) {
    return String(item.id) === String(id);
  });

  if (!product) return;

  const existing = cart.find(function (item) {
    return String(item.id) === String(id);
  });

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1
    });
  }

  saveCart();
  openCart();
}

function removeFromCart(id) {

  cart = cart.filter(function (item) {
    return String(item.id) !== String(id);
  });

  saveCart();
  renderCart();
}

function changeQuantity(id, amount) {

  const item = cart.find(function (product) {
    return String(product.id) === String(id);
  });

  if (!item) return;

  item.quantity += amount;

  if (item.quantity <= 0) {
    removeFromCart(id);
    return;
  }

  saveCart();
  renderCart();
}

function renderCart() {

  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");

  if (!cartItems || !cartTotal) return;

  if (!cart.length) {

    cartItems.innerHTML = "<p>Your cart is empty.</p>";
    cartTotal.textContent = "0.00";

    return;
  }

  let total = 0;

  cartItems.innerHTML = cart.map(function (item) {

    const subtotal =
      Number(item.price) * item.quantity;

    total += subtotal;

    return `
      <div class="cart-row">

        <div>
          <strong>${escapeHTML(item.name)}</strong>

          <small>
            $${Number(item.price).toFixed(2)} each
          </small>
        </div>

        <div>

          <button
            onclick="changeQuantity('${escapeHTML(String(item.id))}', -1)"
          >
            −
          </button>

          <span>${item.quantity}</span>

          <button
            onclick="changeQuantity('${escapeHTML(String(item.id))}', 1)"
          >
            +
          </button>

          <button
            onclick="removeFromCart('${escapeHTML(String(item.id))}')"
          >
            Remove
          </button>

        </div>

      </div>
    `;

  }).join("");

  cartTotal.textContent = total.toFixed(2);
}

function openModal(id) {

  const modal = document.getElementById(id);

  if (modal) {
    modal.classList.add("open");
  }
}

function closeModal(id) {

  const modal = document.getElementById(id);

  if (modal) {
    modal.classList.remove("open");
  }
}

function openCart() {
  renderCart();
  openModal("cartModal");
}

function openSell() {
  openModal("sellModal");
}

function openAccount() {

  const savedUser =
    localStorage.getItem("artnsculps_demo_user");

  if (savedUser) {

    const user = JSON.parse(savedUser);

    const loginView =
      document.getElementById("loginView");

    const signupView =
      document.getElementById("signupView");

    const accountView =
      document.getElementById("accountView");

    const welcomeName =
      document.getElementById("welcomeName");

    if (loginView) loginView.hidden = true;

    if (signupView) signupView.hidden = true;

    if (accountView) accountView.hidden = false;

    if (welcomeName) {
      welcomeName.textContent =
        "Welcome, " + (user.name || "creator") + "!";
    }

  } else {

    showLogin();
  }

  openModal("accountModal");
}

function showLogin() {

  const login =
    document.getElementById("loginView");

  const signup =
    document.getElementById("signupView");

  const account =
    document.getElementById("accountView");

  if (login) login.hidden = false;
  if (signup) signup.hidden = true;
  if (account) account.hidden = true;
}

function showSignup() {

  const login =
    document.getElementById("loginView");

  const signup =
    document.getElementById("signupView");

  if (login) login.hidden = true;
  if (signup) signup.hidden = false;
}

function signup() {

  const name =
    document.getElementById("signupName")?.value.trim();

  const email =
    document.getElementById("signupEmail")?.value.trim();

  const password =
    document.getElementById("signupPassword")?.value;

  if (!name || !email || !password) {
    alert("Please fill out all fields.");
    return;
  }

  if (password.length < 6) {
    alert("Please use a password with at least 6 characters.");
    return;
  }

  localStorage.setItem(
    "artnsculps_demo_user",
    JSON.stringify({
      name: name,
      email: email
    })
  );

  alert("Your ArtNSculps account has been created.");

  openAccount();
}

function login() {

  const email =
    document.getElementById("loginEmail")?.value.trim();

  const password =
    document.getElementById("loginPassword")?.value;

  if (!email || !password) {
    alert("Please enter your email and password.");
    return;
  }

  localStorage.setItem(
    "artnsculps_demo_user",
    JSON.stringify({
      name: email.split("@")[0],
      email: email
    })
  );

  alert("You're logged in.");

  openAccount();
}

function logout() {

  localStorage.removeItem(
    "artnsculps_demo_user"
  );

  showLogin();

  closeModal("accountModal");
}

function showPurchases() {

  const details =
    document.getElementById("accountDetails");

  if (details) {
    details.innerHTML =
      "<p>Your purchases will appear here after checkout.</p>";
  }
}

function showListings() {

  const details =
    document.getElementById("accountDetails");

  const listings =
    getLocalProducts();

  if (!details) return;

  if (!listings.length) {

    details.innerHTML =
      "<p>You don't have any listings yet.</p>";

    return;
  }

  details.innerHTML = `
    <h3>Your listings</h3>

    ${listings.map(function (item) {

      return `
        <p>
          ${escapeHTML(item.name)}
          —
          $${Number(item.price).toFixed(2)}
        </p>
      `;

    }).join("")}
  `;
}

function listItem() {

  const name =
    document.getElementById("itemName")?.value.trim();

  const category =
    document.getElementById("itemCategory")?.value;

  const price =
    Number(
      document.getElementById("itemPrice")?.value
    );

  const image =
    document.getElementById("itemImage")?.value.trim();

  const description =
    document.getElementById("itemDescription")?.value.trim();

  if (!name || !price || price <= 0) {

    alert(
      "Please enter an item name and price."
    );

    return;
  }

  const item = {

    id: "local-" + Date.now(),

    name: name,

    category: category || "art",

    price: price,

    image: image,

    description: description
  };

  const localProducts =
    getLocalProducts();

  localProducts.push(item);

  localStorage.setItem(
    "artnsculps_products",
    JSON.stringify(localProducts)
  );

  products.push(item);

  renderProducts(products);

  closeModal("sellModal");

  alert(
    "Your item has been added to ArtNSculps."
  );
}

function searchProducts() {

  const input =
    document.getElementById("searchInput");

  const results =
    document.getElementById("searchResults");

  if (!input || !results) return;

  const query =
    input.value.toLowerCase().trim();

  const matches =
    products.filter(function (product) {

      return (
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        (product.description || "")
          .toLowerCase()
          .includes(query)
      );

    });

  if (!matches.length) {

    results.innerHTML =
      "<p>No matching items.</p>";

    return;
  }

  results.innerHTML =
    matches.map(function (product) {

      return `
        <button
          class="search-result"
          onclick="addToCart('${escapeHTML(String(product.id))}')"
        >
          ${productEmoji(product.category)}
          ${escapeHTML(product.name)}
          —
          $${Number(product.price).toFixed(2)}
        </button>
      `;

    }).join("");
}

function checkout() {

  if (!cart.length) {
    alert("Your cart is empty.");
    return;
  }

  alert(
    "Your cart is ready for checkout!"
  );
}

async function loadSupabaseProducts() {

  try {

    if (
      typeof supabaseClient === "undefined" ||
      !supabaseClient
    ) {
      return;
    }

    const result =
      await supabaseClient
        .from("products")
        .select("*")
        .order("created_at", {
          ascending: false
        });

    if (result.error) return;

    if (
      Array.isArray(result.data) &&
      result.data.length
    ) {

      const databaseProducts =
        result.data.map(function (product) {

          return {

            id: product.id,

            name: product.name,

            description:
              product.description,

            category:
              product.category,

            price:
              Number(product.price),

            image:
              product.image_url || ""
          };

        });

      products = [
        ...databaseProducts,
        ...getLocalProducts(),
        ...starterProducts
      ];

      renderProducts(products);
    }

  } catch (error) {

    console.log(
      "Using ArtNSculps starter products."
    );
  }
}

document.addEventListener(
  "DOMContentLoaded",
  function () {

    products = [
      ...starterProducts,
      ...getLocalProducts()
    ];

    renderProducts(products);

    updateCartCount();

    document
      .querySelectorAll(".modal")
      .forEach(function (modal) {

        modal.addEventListener(
          "click",
          function (event) {

            if (event.target === modal) {
              modal.classList.remove("open");
            }

          }
        );

      });

    loadSupabaseProducts();
  }
);

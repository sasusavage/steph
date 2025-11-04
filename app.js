document.addEventListener("DOMContentLoaded", () => {
    const WHATSAPP_NUMBER = "233536242058"; // Replace with your business WhatsApp number (no + or spaces)

    const PRODUCTS = [
        {
            id: "sunrise-slip",
            title: "Sunrise Silk Slip",
            price: 68000,
            image: "images/sunrise-slip.jpg",
            imageAlt: "Rust silk slip dress displayed on a mannequin",
            tag: "New",
            description: "Bias-cut midi slip with adjustable straps and low back."
        },
        {
            id: "tailored-blazer",
            title: "Tailored Blazer Set",
            price: 85000,
            image: "images/tailored-blazer.jpg",
            imageAlt: "Cream tailored blazer paired with wide-leg trousers",
            tag: "Limited",
            description: "Structured blazer and trouser set with hand-finished seams."
        },
        {
            id: "linen-coord",
            title: "Linen Weekend Co-ord",
            price: 54000,
            image: "images/linen-coord.jpg",
            imageAlt: "Two-piece linen co-ord in sage green on hanger",
            tag: "Bestseller",
            description: "Breathable linen set with relaxed fit shirt and shorts."
        },
        {
            id: "pleated-midi",
            title: "Pleated Midi Skirt",
            price: 42000,
            image: "images/pleated-midi.jpg",
            imageAlt: "Champagne pleated midi skirt styled with knit top",
            tag: "Editor pick",
            description: "Flowing pleats with elastic waist and hidden pockets."
        }
    ];

    const selectors = {
        productGrid: document.querySelector("[data-product-grid]"),
        cartToggle: document.querySelector("[data-cart-toggle]"),
        cartPanel: document.querySelector("[data-cart-panel]"),
        cartOverlay: document.querySelector("[data-cart-overlay]"),
        cartItems: document.querySelector("[data-cart-items]"),
        cartEmpty: document.querySelector("[data-cart-empty]"),
        cartSummary: document.querySelector("[data-cart-summary]"),
        cartCount: document.querySelector("[data-cart-count]"),
        cartSubtotal: document.querySelector("[data-cart-subtotal]"),
        cartTotal: document.querySelector("[data-cart-total]"),
    checkoutForm: document.querySelector("[data-checkout-form]"),
    checkoutActions: document.querySelector("[data-checkout-actions]"),
    checkoutOpenButton: document.querySelector("[data-checkout-open]"),
    checkoutModal: document.querySelector("[data-checkout-modal]"),
    checkoutModalClose: document.querySelector("[data-checkout-modal-close]"),
    checkoutSummary: document.querySelector("[data-checkout-summary]"),
    checkoutSummaryList: document.querySelector("[data-checkout-summary-list]"),
        footerYear: document.querySelector("[data-current-year]"),
        newsletterForm: document.querySelector("[data-newsletter-form]"),
        productModal: document.querySelector("[data-product-modal]"),
        productModalClose: document.querySelector("[data-product-modal-close]"),
        productModalImage: document.querySelector("[data-product-modal-image]"),
        productModalTitle: document.querySelector("[data-product-modal-title]"),
        productModalPrice: document.querySelector("[data-product-modal-price]"),
        productModalDescription: document.querySelector("[data-product-modal-description]"),
        productModalAdd: document.querySelector("[data-product-modal-add]")
    };

    const state = {
        cart: [],
        activeProductId: null
    };

    const currency = new Intl.NumberFormat("en-GH", {
        style: "currency",
        currency: "GHS",
        minimumFractionDigits: 2
    });

    const formatCurrency = (value) => currency.format(value || 0);

    const findProduct = (productId) => PRODUCTS.find((product) => product.id === productId);

    function renderProducts() {
        if (!selectors.productGrid) {
            return;
        }

        const fragment = document.createDocumentFragment();

        PRODUCTS.forEach((product) => {
            const card = document.createElement("article");
            card.className = "product-card";
            card.dataset.productId = product.id;
            card.setAttribute("data-product-card", "");
            card.tabIndex = 0;
            card.setAttribute("aria-label", `${product.title} details`);
            card.innerHTML = `
                <div class="product-media" data-image-slot="product-${product.id}">
                    <img src="${product.image}" alt="${product.imageAlt}" loading="lazy">
                </div>
                <div class="product-body">
                    <div class="product-meta">
                        <h3>${product.title}</h3>
                        <span class="product-tag">${product.tag}</span>
                    </div>
                    <p class="product-description">${product.description}</p>
                    <div class="product-meta">
                        <span class="product-price">${formatCurrency(product.price)}</span>
                        <button class="btn secondary" type="button" data-action="add" data-product-id="${product.id}">
                            Add to cart
                        </button>
                    </div>
                </div>
            `;

            fragment.appendChild(card);
        });

        selectors.productGrid.replaceChildren(fragment);
    }

    const updateCartCount = () => {
        const totalQuantity = state.cart.reduce((total, item) => total + item.quantity, 0);
        if (selectors.cartCount) {
            selectors.cartCount.textContent = totalQuantity;
        }
    };

    function renderCartItems() {
        if (!selectors.cartItems) {
            return;
        }

        selectors.cartItems.innerHTML = state.cart
            .map((item) => {
                const product = findProduct(item.productId);
                if (!product) {
                    return "";
                }

                const lineTotal = product.price * item.quantity;

                return `
                    <li class="cart-item" data-product-id="${product.id}">
                        <div class="cart-item-header">
                            <div>
                                <p class="cart-item-name">${product.title}</p>
                                <p class="cart-item-price">${formatCurrency(product.price)} each</p>
                            </div>
                            <button class="cart-item-remove" type="button" data-action="remove" data-product-id="${product.id}">Remove</button>
                        </div>
                        <div class="cart-item-footer">
                            <div class="cart-item-controls">
                                <button type="button" data-action="decrement" data-product-id="${product.id}">-</button>
                                <span class="cart-item-qty">${item.quantity}</span>
                                <button type="button" data-action="increment" data-product-id="${product.id}">+</button>
                            </div>
                            <strong>${formatCurrency(lineTotal)}</strong>
                        </div>
                    </li>
                `;
            })
            .join("");
    }

    function renderCheckoutSummary() {
        if (!selectors.checkoutSummaryList) {
            return;
        }

        if (!state.cart.length) {
            selectors.checkoutSummaryList.innerHTML = "";
            if (selectors.checkoutSummary) {
                selectors.checkoutSummary.style.display = "none";
            }
            return;
        }

        const fragment = document.createDocumentFragment();
        state.cart.forEach((item) => {
            const product = findProduct(item.productId);
            if (!product) {
                return;
            }

            const listItem = document.createElement("li");
            listItem.className = "checkout-summary-item";
            listItem.innerHTML = `
                <div class="checkout-summary-thumb">
                    <img src="${product.image}" alt="${product.imageAlt || product.title}">
                </div>
                <div class="checkout-summary-details">
                    <span class="checkout-summary-name">${product.title}</span>
                    <span class="checkout-summary-qty">Quantity: ${item.quantity}</span>
                </div>
                <span class="checkout-summary-price">${formatCurrency(product.price)}</span>
            `;
            fragment.appendChild(listItem);
        });

        selectors.checkoutSummaryList.replaceChildren(fragment);

        if (selectors.checkoutSummary) {
            selectors.checkoutSummary.style.display = "grid";
        }
    }

    function updateCartUI() {
        const hasItems = state.cart.length > 0;
        if (selectors.cartEmpty) {
            selectors.cartEmpty.style.display = hasItems ? "none" : "block";
        }
        if (selectors.cartSummary) {
            selectors.cartSummary.style.display = hasItems ? "grid" : "none";
        }
        if (selectors.checkoutActions) {
            selectors.checkoutActions.style.display = hasItems ? "block" : "none";
        }
        if (selectors.checkoutOpenButton) {
            selectors.checkoutOpenButton.disabled = !hasItems;
        }

        renderCartItems();
        updateCartCount();

        const totals = state.cart.reduce(
            (acc, item) => {
                const product = findProduct(item.productId);
                if (!product) {
                    return acc;
                }
                const line = product.price * item.quantity;
                acc.subtotal += line;
                acc.total += line;
                return acc;
            },
            { subtotal: 0, total: 0 }
        );

        if (selectors.cartSubtotal) {
            selectors.cartSubtotal.textContent = formatCurrency(totals.subtotal);
        }
        if (selectors.cartTotal) {
            selectors.cartTotal.textContent = formatCurrency(totals.total);
        }

        if (!hasItems) {
            closeCheckoutModal();
        }

        renderCheckoutSummary();
    }

    function addToCart(productId) {
        const product = findProduct(productId);
        if (!product) {
            return;
        }

        const existing = state.cart.find((item) => item.productId === productId);

        if (existing) {
            existing.quantity += 1;
        } else {
            state.cart.push({ productId, quantity: 1 });
        }

        updateCartUI();
    }

    function decrementCartItem(productId) {
        const existing = state.cart.find((item) => item.productId === productId);
        if (!existing) {
            return;
        }
        if (existing.quantity > 1) {
            existing.quantity -= 1;
        } else {
            state.cart = state.cart.filter((item) => item.productId !== productId);
        }
        updateCartUI();
    }

    function removeCartItem(productId) {
        state.cart = state.cart.filter((item) => item.productId !== productId);
        updateCartUI();
    }

    function toggleCart(open) {
        if (!selectors.cartPanel || !selectors.cartOverlay) {
            return;
        }
        selectors.cartPanel.classList.toggle("open", open);
        selectors.cartOverlay.classList.toggle("visible", open);
    }

    function openProductModal(productId) {
        const product = findProduct(productId);
        if (!product || !selectors.productModal) {
            return;
        }

        state.activeProductId = productId;

        if (selectors.productModalImage) {
            selectors.productModalImage.src = product.image;
            selectors.productModalImage.alt = product.imageAlt || product.title;
        }
        if (selectors.productModalTitle) {
            selectors.productModalTitle.textContent = product.title;
        }
        if (selectors.productModalPrice) {
            selectors.productModalPrice.textContent = formatCurrency(product.price);
        }
        if (selectors.productModalDescription) {
            selectors.productModalDescription.textContent = product.description;
        }
        if (selectors.productModalAdd) {
            selectors.productModalAdd.dataset.productId = productId;
        }

        selectors.productModal.hidden = false;
        selectors.productModal.classList.add("open");
        document.body.classList.add("modal-open");
    }

    function closeProductModal() {
        if (!selectors.productModal) {
            return;
        }
        selectors.productModal.classList.remove("open");
        selectors.productModal.hidden = true;
        document.body.classList.remove("modal-open");
        state.activeProductId = null;
    }

    function openCheckoutModal() {
        if (!state.cart.length) {
            alert("Your cart is empty. Add products before checking out.");
            return;
        }
        if (!selectors.checkoutModal) {
            return;
        }
        renderCheckoutSummary();
        selectors.checkoutModal.hidden = false;
        selectors.checkoutModal.classList.add("open");
        document.body.classList.add("modal-open");
    }

    function closeCheckoutModal() {
        if (!selectors.checkoutModal) {
            return;
        }
        selectors.checkoutModal.classList.remove("open");
        selectors.checkoutModal.hidden = true;
        document.body.classList.remove("modal-open");
    }

    function handleCheckout(event) {
        event.preventDefault();
        if (!state.cart.length) {
            alert("Your cart is empty. Add products before checking out.");
            return;
        }

        const formData = new FormData(event.target);
        const customerName = (formData.get("customerName") || "").trim();
        const customerPhone = (formData.get("customerPhone") || "").trim();
        const customerEmail = (formData.get("customerEmail") || "").trim();
        const deliveryOption = formData.get("deliveryOption");
        const customerNotes = (formData.get("customerNotes") || "").trim();

        if (!customerName || !customerPhone) {
            alert("Please provide your name and WhatsApp phone number.");
            return;
        }

        const orderLines = state.cart
            .map((item) => {
                const product = findProduct(item.productId);
                if (!product) {
                    return null;
                }
                return `- ${product.title} x${item.quantity}`;
            })
            .filter(Boolean)
            .join("\n");

        const totals = state.cart.reduce(
            (acc, item) => {
                const product = findProduct(item.productId);
                if (!product) {
                    return acc;
                }
                acc.total += product.price * item.quantity;
                return acc;
            },
            { total: 0 }
        );

        const messageChunks = [
            `New order from ${customerName}`,
            `Phone: ${customerPhone}`,
            customerEmail ? `Email: ${customerEmail}` : null,
            `Delivery option: ${deliveryOption}`,
            "",
            "Items:",
            orderLines,
            "",
            `Order total: ${formatCurrency(totals.total)}`,
            customerNotes ? "" : null,
            customerNotes ? `Notes: ${customerNotes}` : null
        ].filter(Boolean);

        const whatsappMessage = encodeURIComponent(messageChunks.join("\n"));
        const whatsappBase = WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}` : "https://wa.me";
        const whatsappUrl = `${whatsappBase}?text=${whatsappMessage}`;

        window.open(whatsappUrl, "_blank", "noopener");
        alert("Your checkout details have been prepared in WhatsApp. Please review and press send.");
        closeCheckoutModal();
        toggleCart(false);
        event.target.reset();
    }

    function registerEventListeners() {
        if (selectors.productGrid) {
            selectors.productGrid.addEventListener("click", (event) => {
                const trigger = event.target.closest("[data-action='add']");
                if (trigger) {
                    const { productId } = trigger.dataset;
                    addToCart(productId);
                    toggleCart(true);
                    return;
                }

                const card = event.target.closest("[data-product-card]");
                if (card) {
                    const { productId } = card.dataset;
                    openProductModal(productId);
                }
            });

            selectors.productGrid.addEventListener("keydown", (event) => {
                if (event.key !== "Enter" && event.key !== " " && event.key !== "Spacebar") {
                    return;
                }
                if (event.target.closest("[data-action='add']")) {
                    return;
                }
                const card = event.target.closest("[data-product-card]");
                if (card) {
                    event.preventDefault();
                    openProductModal(card.dataset.productId);
                }
            });
        }

        document.querySelectorAll("[data-cart-close]").forEach((button) => {
            button.addEventListener("click", () => toggleCart(false));
        });

        if (selectors.cartToggle) {
            selectors.cartToggle.addEventListener("click", () => toggleCart(true));
        }

        if (selectors.cartOverlay) {
            selectors.cartOverlay.addEventListener("click", () => toggleCart(false));
        }

        if (selectors.cartItems) {
            selectors.cartItems.addEventListener("click", (event) => {
                const trigger = event.target.closest("button[data-action]");
                if (!trigger) {
                    return;
                }
                const { action, productId } = trigger.dataset;
                if (action === "increment") {
                    addToCart(productId);
                } else if (action === "decrement") {
                    decrementCartItem(productId);
                } else if (action === "remove") {
                    removeCartItem(productId);
                }
            });
        }

        if (selectors.checkoutForm) {
            selectors.checkoutForm.addEventListener("submit", handleCheckout);
        }

        if (selectors.newsletterForm) {
            selectors.newsletterForm.addEventListener("submit", (event) => {
                event.preventDefault();
                alert("Thanks for subscribing! Watch your inbox for new arrivals.");
                event.target.reset();
            });
        }

        if (selectors.productModal) {
            selectors.productModal.addEventListener("click", (event) => {
                if (event.target === selectors.productModal) {
                    closeProductModal();
                }
            });
        }

        if (selectors.productModalClose) {
            selectors.productModalClose.addEventListener("click", closeProductModal);
        }

        if (selectors.productModalAdd) {
            selectors.productModalAdd.addEventListener("click", (event) => {
                const { productId } = event.currentTarget.dataset;
                const targetId = productId || state.activeProductId;
                if (targetId) {
                    addToCart(targetId);
                    closeProductModal();
                    toggleCart(true);
                }
            });
        }

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                if (selectors.productModal && !selectors.productModal.hidden) {
                    closeProductModal();
                }
                if (selectors.checkoutModal && !selectors.checkoutModal.hidden) {
                    closeCheckoutModal();
                }
            }
        });

        if (selectors.checkoutOpenButton) {
            selectors.checkoutOpenButton.addEventListener("click", openCheckoutModal);
        }

        if (selectors.checkoutModal) {
            selectors.checkoutModal.addEventListener("click", (event) => {
                if (event.target === selectors.checkoutModal) {
                    closeCheckoutModal();
                }
            });
        }

        if (selectors.checkoutModalClose) {
            selectors.checkoutModalClose.addEventListener("click", closeCheckoutModal);
        }
    }

    function hydrateStaticBits() {
        if (selectors.footerYear) {
            selectors.footerYear.textContent = new Date().getFullYear();
        }
    }

    renderProducts();
    updateCartUI();
    registerEventListeners();
    hydrateStaticBits();
});

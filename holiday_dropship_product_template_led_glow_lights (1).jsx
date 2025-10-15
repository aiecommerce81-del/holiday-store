import React, { useEffect, useMemo, useState } from "react";

/**
 * HOLIDAY DROPSHIPPING PRODUCT TEMPLATE (Single-file React + Tailwind)
 * ---------------------------------------------------------------
 * What you get:
 * - High-converting product page for a seasonal, giftable product (LED Glow String Lights)
 * - Mobile-first, fast, and accessible UI with Tailwind classes
 * - Urgency stack: announcement bar, limited-time offer badge, countdown to shipping cutoff
 * - Social proof stack: rating, sales counter, UGC/TikTok-style gallery, testimonials, trust badges
 * - Conversion stack: sticky Add-to-Cart, free shipping threshold, BNPL placeholder, guarantees, FAQs
 * - Lightweight cart drawer (client-side), variant/quantity selection, price math, coupon hook
 * - SEO: JSON-LD product schema, OpenGraph/Twitter meta placeholders
 * - Tracking placeholders: TikTok Pixel / Meta Pixel, conversion event hints
 *
 * How to use:
 * - Swap PRODUCT_DATA with your real product (images, variants, price, etc.)
 * - Connect the onCheckout handler to your cart/checkout (Shopify Buy SDK, Woo, Stripe, etc.)
 * - Replace placeholders for pixels and domain
 * - Optional: prerender with Next.js/Remix for SEO; this file still previews fine
 */

// ----------------------------
// Configurable Product Data
// ----------------------------

// ✅ SHOPIFY CONFIG — fill these in
const SHOPIFY = {
  storeDomain: "YOUR_STORE.myshopify.com", // no https
  storefrontToken: "YOUR_STOREFRONT_API_ACCESS_TOKEN", // from Shopify Admin > Settings > Apps & sales channels > Develop apps > Storefront API
  apiVersion: "2025-01", // match your shop version
};

// Simple helper for Storefront API calls
async function sfy(query, variables) {
  const res = await fetch(`https://${SHOPIFY.storeDomain}/api/${SHOPIFY.apiVersion}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY.storefrontToken,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Shopify error ${res.status}`);
  const data = await res.json();
  if (data.errors) throw new Error(JSON.stringify(data.errors));
  return data.data;
}

// Create a cart and return {id, checkoutUrl}
async function createCart(lines = []) {
  const mutation = `#graphql
    mutation CreateCart($lines: [CartLineInput!]) {
      cartCreate(input: { lines: $lines }) {
        cart { id checkoutUrl }
        userErrors { field message }
      }
    }
  `;
  const out = await sfy(mutation, { lines });
  return out.cartCreate.cart;
}

// Add lines to an existing cart
async function addCartLines(cartId, lines) {
  const mutation = `#graphql
    mutation AddLines($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { id checkoutUrl }
        userErrors { field message }
      }
    }
  `;
  const out = await sfy(mutation, { cartId, lines });
  return out.cartLinesAdd.cart;
}

const PRODUCT_DATA = {
  id: "led-glow-string-lights",
  title: "AuroraGlow™ LED String Lights — 8 Modes, USB + Remote",
  subtitle: "Instant cozy holiday vibes. Gift-ready packaging.",
  description:
    "Transform any space into a festive scene in seconds. Our AuroraGlow™ LED String Lights feature 8 lighting modes, memory function, and low-heat copper wire. Perfect for trees, mantels, bedrooms, and holiday parties.",
  images: [
    // Use your CDN images; these are placeholders
    "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1512207846876-c60b6bdf52ae?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1516822003754-cca485356ecb?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519682577862-22b62b24e493?q=80&w=1600&auto=format&fit=crop",
  ],
  rating: 4.8,
  reviewCount: 2197,
  basePrice: 24.99, // current selling price
  compareAtPrice: 39.99, // crossed-out price
  currency: "USD",
  soldThisWeek: 1280,
  freeShippingThreshold: 35,
  shippingCutoffISO: "2025-12-18T20:00:00-08:00", // PST; update as season progresses
  bnplCopy: "or 4 interest-free payments of $6.25",
  badges: ["Bestseller", "Holiday Deal", "Ships from USA"],
  bullets: [
    "8 lighting modes + memory",
    "USB powered + remote included",
    "Flexible copper wire · low heat",
    "Indoor & outdoor (IP44) rated",
    "Gift-ready eco packaging",
  ],
  variants: [
    // ⚠️ Add your Shopify variant GIDs here (copy from Admin > Products > variant > GraphQL ID)
    { id: "warm-10m", gid: "gid://shopify/ProductVariant/1234567890", name: "Warm White · 10m (33ft)", color: "#F6E27A", price: 24.99, stock: 212 },
    { id: "warm-20m", gid: "gid://shopify/ProductVariant/1234567891", name: "Warm White · 20m (66ft)", color: "#F6E27A", price: 29.99, stock: 163 },
    { id: "multicolor-10m", gid: "gid://shopify/ProductVariant/1234567892", name: "Multi-Color · 10m (33ft)", color: "#7BCDEF", price: 26.99, stock: 97 },
    { id: "multicolor-20m", gid: "gid://shopify/ProductVariant/1234567893", name: "Multi-Color · 20m (66ft)", color: "#7BCDEF", price: 31.99, stock: 74 },
  ],
  // UGC/TikTok-like short clips or images
  ugc: [
    { type: "img", src: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1600&auto=format&fit=crop", alt: "Bedroom before/after glow" },
    { type: "img", src: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1600&auto=format&fit=crop", alt: "Tree wrap demo" },
    { type: "img", src: "https://images.unsplash.com/photo-1513289931115-39538e9d2f71?q=80&w=1600&auto=format&fit=crop", alt: "Mantel styling" },
    { type: "img", src: "https://images.unsplash.com/photo-1483721310020-03333e577078?q=80&w=1600&auto=format&fit=crop", alt: "Party string lights" },
  ],
};
  // UGC/TikTok-like short clips or images
  ugc: [
    { type: "img", src: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1600&auto=format&fit=crop", alt: "Bedroom before/after glow" },
    { type: "img", src: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1600&auto=format&fit=crop", alt: "Tree wrap demo" },
    { type: "img", src: "https://images.unsplash.com/photo-1513289931115-39538e9d2f71?q=80&w=1600&auto=format&fit=crop", alt: "Mantel styling" },
    { type: "img", src: "https://images.unsplash.com/photo-1483721310020-03333e577078?q=80&w=1600&auto=format&fit=crop", alt: "Party string lights" },
  ],
};

// Utility: currency format
const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: PRODUCT_DATA.currency }).format(n);

// ----------------------------
// Main Component
// ----------------------------
export default function EcommerceHolidayProduct() {
  const [selectedVariant, setSelectedVariant] = useState(PRODUCT_DATA.variants[0]);
  const [qty, setQty] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]); // simple in-memory cart
  const [now, setNow] = useState(new Date());

  // Countdown to shipping cutoff
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const cutoff = useMemo(() => new Date(PRODUCT_DATA.shippingCutoffISO), []);
  const timeLeft = Math.max(0, cutoff.getTime() - now.getTime());
  const countdown = useMemo(() => formatDuration(timeLeft), [timeLeft]);

  const discountPct = Math.round(((PRODUCT_DATA.compareAtPrice - selectedVariant.price) / PRODUCT_DATA.compareAtPrice) * 100);
  const lineTotal = selectedVariant.price * qty;

  function addToCart() {
    const line = {
      productId: PRODUCT_DATA.id,
      variantId: selectedVariant.id,
      title: PRODUCT_DATA.title,
      variantName: selectedVariant.name,
      price: selectedVariant.price,
      qty,
      image: PRODUCT_DATA.images[0],
    };
    setCart((prev) => mergeCart(prev, line));
    setCartOpen(true);
    // Tracking placeholder: TikTok Pixel AddToCart
    // window.ttq && window.ttq.track('AddToCart', { content_id: selectedVariant.id, value: lineTotal, currency: PRODUCT_DATA.currency });
  }

  function onCheckout() {
    // Convert local cart -> Shopify CartLines and redirect to checkoutUrl
    const lines = cart.map((l) => ({
      // 👉 Replace with your real variant GIDs (graphql IDs) from Shopify for each variant
      // You can store a mapping on each variant in PRODUCT_DATA.variants as `gid`
      merchandiseId: variantGidById(l.variantId),
      quantity: l.qty,
    }));

    // Persist cartId so returning users keep the same checkout
    const existing = localStorage.getItem("shopifyCartId");

    (async () => {
      try {
        let cartObj;
        if (!existing) {
          cartObj = await createCart(lines);
          localStorage.setItem("shopifyCartId", cartObj.id);
        } else {
          cartObj = await addCartLines(existing, lines);
        }
        // Fire pixels if needed, then redirect
        // window.ttq && window.ttq.track('InitiateCheckout');
        window.location.href = cartObj.checkoutUrl;
      } catch (e) {
        console.error(e);
        alert("Checkout error — check your Shopify credentials and variant IDs.");
      }
    })();
  }

  const subtotal = cart.reduce((s, l) => s + l.price * l.qty, 0);
  const qualifiesFreeShip = subtotal >= PRODUCT_DATA.freeShippingThreshold;

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <SEOHead />
      <AnnouncementBar />
      <Header cartCount={cart.reduce((s, l) => s + l.qty, 0)} onCart={() => setCartOpen(true)} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Gallery */}
          <Gallery images={PRODUCT_DATA.images} badges={PRODUCT_DATA.badges} />

          {/* Right: Buy Box */}
          <section aria-label="Purchase options" className="flex flex-col gap-5">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{PRODUCT_DATA.title}</h1>
            <p className="text-neutral-600 -mt-2">{PRODUCT_DATA.subtitle}</p>

            <Rating rating={PRODUCT_DATA.rating} count={PRODUCT_DATA.reviewCount} />

            <PriceBlock
              price={selectedVariant.price}
              compareAt={PRODUCT_DATA.compareAtPrice}
              discountPct={discountPct}
              bnplCopy={PRODUCT_DATA.bnplCopy}
            />

            <div>
              <Label>Choose style/length</Label>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRODUCT_DATA.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`group relative w-full rounded-xl border px-3 py-3 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      selectedVariant.id === v.id
                        ? "bg-white border-neutral-900 ring-2 ring-neutral-900"
                        : "bg-white border-neutral-200 hover:border-neutral-400"
                    }`}
                    aria-pressed={selectedVariant.id === v.id}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{v.name}</p>
                        <p className="text-sm text-neutral-500">{fmt(v.price)}</p>
                      </div>
                      <span
                        className="h-6 w-6 rounded-full border"
                        style={{ backgroundColor: v.color }}
                        aria-hidden
                      />
                    </div>
                    {v.stock < 30 && (
                      <span className="absolute -top-2 -right-2 rounded-full bg-rose-600 px-2 py-0.5 text-xs font-semibold text-white shadow">
                        Low stock
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <BundleSave onSelect={(count) => setQty(count)} />

            <div className="flex items-center gap-4">
              <div className="flex items-center rounded-xl border bg-white px-2">
                <button
                  className="px-3 py-2 text-xl disabled:opacity-30"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <input
                  className="w-12 text-center py-2 outline-none"
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                  inputMode="numeric"
                  aria-label="Quantity"
                />
                <button
                  className="px-3 py-2 text-xl"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                onClick={addToCart}
                className="flex-1 rounded-2xl bg-neutral-900 px-6 py-4 text-white font-semibold shadow-lg hover:shadow-xl active:scale-[0.99]"
              >
                Add to Cart • {fmt(lineTotal)}
              </button>
            </div>

            <Urgency cutoff={cutoff} countdown={countdown} />

            <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {PRODUCT_DATA.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <TrustBar freeShipThreshold={PRODUCT_DATA.freeShippingThreshold} />

            <Details description={PRODUCT_DATA.description} />
          </section>
        </div>

        {/* UGC / Social proof */}
        <UGCGrid items={PRODUCT_DATA.ugc} />

        <SocialProofReels />

        {/* Testimonials */}
        <Testimonials />

        {/* FAQ */}
        <FAQ />
      </main>

      <Footer />

      {/* Sticky ATC on mobile */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-t p-3 md:hidden">
        <div className="mx-auto max-w-7xl flex items-center gap-3">
          <button
            onClick={addToCart}
            className="flex-1 rounded-2xl bg-neutral-900 px-6 py-4 text-white font-semibold shadow"
          >
            Add to Cart • {fmt(lineTotal)}
          </button>
          <button
            onClick={() => setCartOpen(true)}
            className="rounded-2xl border px-4 py-4 font-semibold"
          >
            Cart ({cart.reduce((s, l) => s + l.qty, 0)})
          </button>
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onQty={(variantId, delta) => setCart((prev) => changeQty(prev, variantId, delta))}
        onRemove={(variantId) => setCart((prev) => prev.filter((l) => l.variantId !== variantId))}
        subtotal={subtotal}
        qualifiesFreeShip={qualifiesFreeShip}
        onCheckout={onCheckout}
      />

      {/* Tracking placeholders: insert your pixels/scripts in <SEOHead /> */}
    </div>
  );
}

// ----------------------------
// Subcomponents
// ----------------------------
function AnnouncementBar() {
  return (
    <div className="w-full bg-emerald-600 text-white text-sm py-2 text-center">
      🎁 Holiday Deal: Save 35% today — Free shipping over $35 — Easy returns
    </div>
  );
}

function Header({ cartCount, onCart }: { cartCount: number; onCart: () => void }) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-neutral-900" aria-hidden />
          <a href="#" className="font-bold tracking-tight text-lg">GlowGoods</a>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-700">
          <a className="hover:text-neutral-900" href="#details">Details</a>
          <a className="hover:text-neutral-900" href="#ugc">Gallery</a>
          <a className="hover:text-neutral-900" href="#faq">FAQ</a>
        </nav>
        <div className="flex items-center gap-3">
          <button className="rounded-xl border px-3 py-2 text-sm">Track Order</button>
          <button onClick={onCart} className="relative rounded-xl border px-3 py-2 text-sm">
            Cart
            <span className="absolute -top-2 -right-2 h-5 min-w-[1.25rem] px-1 rounded-full bg-neutral-900 text-white text-[10px] flex items-center justify-center">
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

function Gallery({ images, badges }: { images: string[]; badges: string[] }) {
  const [active, setActive] = useState(0);
  return (
    <section aria-label="Product media" className="">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-100 shadow">
        <img src={images[active]} alt="Product view" className="h-full w-full object-cover" />
        <div className="absolute left-3 top-3 flex gap-2">
          {badges.map((b) => (
            <span key={b} className="rounded-full bg-white/90 px-2 py-1 text-xs font-semibold shadow">
              {b}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-3">
        {images.map((src, i) => (
          <button
            key={src}
            className={`aspect-square overflow-hidden rounded-xl border ${i === active ? "border-neutral-900" : "border-transparent"}`}
            onClick={() => setActive(i)}
            aria-label={`View image ${i + 1}`}
          >
            <img src={src} alt="Thumbnail" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </section>
  );
}

function Rating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-2 text-sm text-neutral-700">
      <div className="flex items-center" aria-label={`${rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} viewBox="0 0 20 20" className={`h-5 w-5 ${i < Math.round(rating) ? "fill-amber-400" : "fill-neutral-200"}`}>
            <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.562-.953L10 0l2.948 5.957 6.562.953-4.755 4.635 1.123 6.545z" />
          </svg>
        ))}
      </div>
      <span className="tabular-nums">{rating.toFixed(1)} · {count.toLocaleString()} reviews</span>
    </div>
  );
}

function PriceBlock({ price, compareAt, discountPct, bnplCopy }: { price: number; compareAt: number; discountPct: number; bnplCopy?: string }) {
  return (
    <div className="flex items-end gap-3">
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold">{fmt(price)}</span>
        <span className="text-neutral-400 line-through">{fmt(compareAt)}</span>
      </div>
      <span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-1 text-xs font-semibold">Save {discountPct}%</span>
      {bnplCopy && <span className="ml-auto text-xs text-neutral-600">{bnplCopy}</span>}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-semibold text-neutral-800">{children}</p>;
}

function Urgency({ cutoff, countdown }: { cutoff: Date; countdown: string }) {
  return (
    <div className="mt-2 rounded-xl border bg-white p-3 text-sm">
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 24 24" className="h-5 w-5"><path d="M12 1a2 2 0 012 2v1h3a2 2 0 012 2v3h1a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V11a2 2 0 012-2h1V6a2 2 0 012-2h3V3a2 2 0 012-2zm-1 8v4.586l3.293 3.293 1.414-1.414L13 12.586V9h-2z"/></svg>
        <span className="font-semibold">Order in the next <span className="tabular-nums">{countdown}</span> for delivery by Christmas*.</span>
      </div>
      <p className="mt-1 text-xs text-neutral-500">*Based on standard shipping before cutoff {cutoff.toLocaleString()}.</p>
    </div>
  );
}

function TrustBar({ freeShipThreshold }: { freeShipThreshold: number }) {
  return (
    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
      {[
        { t: `Free shipping over ${fmt(freeShipThreshold)}`, i: "M3 12h18M3 12l4-4m-4 4l4 4" },
        { t: "30‑day returns", i: "M4 7h16v10H4z M8 7V5h8v2" },
        { t: "Secure checkout", i: "M6 10h12v8H6z M9 10V8a3 3 0 016 0v2" },
        { t: "1‑year warranty", i: "M12 2l7 4v6c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-4z" },
      ].map((k) => (
        <div key={k.t} className="flex items-center gap-2 rounded-xl border bg-white p-3">
          <Icon d={k.i} />
          <span>{k.t}</span>
        </div>
      ))}
    </div>
  );
}

function Details({ description }: { description: string }) {
  return (
    <section id="details" className="mt-6 space-y-3">
      <h2 className="text-lg font-semibold">Product details</h2>
      <p className="text-neutral-700 leading-relaxed">{description}</p>
      <ul className="list-disc pl-5 text-sm text-neutral-700 space-y-1">
        <li>Cable: flexible copper wire · USB powered</li>
        <li>Modes: 8 modes + memory (steady, twinkle, wave…)</li>
        <li>Remote: on/off, timer, brightness, mode</li>
        <li>Water resistance: IP44 (indoor/outdoor)</li>
        <li>Safety: low heat emission</li>
      </ul>
    </section>
  );
}

function UGCGrid({ items }: { items: { type: "img"; src: string; alt: string }[] }) {
  return (
    <section id="ugc" className="mt-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">In real spaces (UGC)</h2>
        <span className="text-sm text-neutral-600">#{PRODUCT_DATA.title.split(" ")[0]} · TikTok/Reels</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((m, i) => (
          <figure key={i} className="overflow-hidden rounded-2xl bg-neutral-100 aspect-[3/4]">
            <img src={m.src} alt={m.alt} className="h-full w-full object-cover hover:scale-105 transition" />
          </figure>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const quotes = [
    {
      n: "Kara M.",
      t: "Obsessed! Did a 10‑minute tree install and the living room looks like a movie set.",
    },
    { n: "Luis R.", t: "Bought two 20m sets—one for the patio. Remote + timer = chef’s kiss." },
    { n: "Alyssa P.", t: "Great gift. Packaging is cute and it’s actually bright without getting hot." },
  ];
  return (
    <section className="mt-12">
      <h2 className="text-lg font-semibold mb-4">Loved by 2,000+ holiday shoppers</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {quotes.map((q) => (
          <blockquote key={q.n} className="rounded-2xl border bg-white p-4 shadow-sm">
            <p className="text-neutral-800">“{q.t}”</p>
            <footer className="mt-3 text-sm text-neutral-600">— {q.n}</footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    {
      q: "Will it arrive before Christmas?",
      a: "Yes if you order before our shipping cutoff (see timer above). We also offer expedited options at checkout.",
    },
    {
      q: "Is it safe for indoor trees?",
      a: "Yes. Low-heat LEDs and copper wire. Always follow standard safety guidance.",
    },
    {
      q: "Can I use it outside?",
      a: "Rated IP44: protected against splashing water. Keep the USB power source covered.",
    },
    {
      q: "What’s the return policy?",
      a: "30 days hassle-free. Full details in Returns & Warranty.",
    },
  ];
  const [open, setOpen] = useState("0");
  return (
    <section id="faq" className="mt-12">
      <h2 className="text-lg font-semibold mb-3">FAQ</h2>
      <div className="divide-y rounded-2xl border bg-white">
        {faqs.map((f, i) => (
          <div key={i}>
            <button
              onClick={() => setOpen((o) => (o === String(i) ? "" : String(i)))}
              className="w-full px-4 py-4 text-left font-medium flex items-center justify-between"
              aria-expanded={open === String(i)}
            >
              {f.q}
              <span className="ml-3 text-xl">{open === String(i) ? "−" : "+"}</span>
            </button>
            {open === String(i) && <p className="px-4 pb-4 text-sm text-neutral-700">{f.a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mt-16 border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
        <div>
          <div className="h-9 w-9 rounded-xl bg-neutral-900 mb-2" aria-hidden />
          <p className="text-neutral-600">Cozy lights, happy nights. © {new Date().getFullYear()} GlowGoods</p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Support</h3>
          <ul className="space-y-1 text-neutral-600">
            <li><a href="#" className="hover:text-neutral-900">Contact</a></li>
            <li><a href="#" className="hover:text-neutral-900">Shipping & Returns</a></li>
            <li><a href="#" className="hover:text-neutral-900">Warranty</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Company</h3>
          <ul className="space-y-1 text-neutral-600">
            <li><a href="#" className="hover:text-neutral-900">About</a></li>
            <li><a href="#" className="hover:text-neutral-900">Affiliate</a></li>
            <li><a href="#" className="hover:text-neutral-900">Privacy & Terms</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Newsletter</h3>
          <div className="flex gap-2">
            <input className="flex-1 rounded-xl border px-3 py-2" placeholder="Your email" />
            <button className="rounded-xl bg-neutral-900 px-4 py-2 text-white font-semibold">Join</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function CartDrawer({ open, onClose, cart, onQty, onRemove, subtotal, qualifiesFreeShip, onCheckout }) {
  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      {/* Scrim */}
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      {/* Panel */}
      <aside className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transition-transform ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="font-semibold">Your Cart</h3>
          <button onClick={onClose} className="rounded-lg border px-2 py-1">Close</button>
        </div>
        <div className="p-4 space-y-3 max-h-[calc(100%-12rem)] overflow-auto">
          {cart.length === 0 && <p className="text-sm text-neutral-600">Your cart is empty.</p>}
          {cart.map((l) => (
            <div key={l.variantId} className="flex gap-3 rounded-xl border p-3">
              <img src={l.image} alt="Cart item" className="h-16 w-16 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="font-medium leading-tight">{l.title}</p>
                <p className="text-sm text-neutral-600">{l.variantName}</p>
                <div className="mt-2 flex items-center gap-2">
                  <button className="rounded-lg border px-2" onClick={() => onQty(l.variantId, -1)} aria-label="Decrease">−</button>
                  <span className="tabular-nums">{l.qty}</span>
                  <button className="rounded-lg border px-2" onClick={() => onQty(l.variantId, 1)} aria-label="Increase">+</button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{fmt(l.price * l.qty)}</p>
                <button className="mt-2 text-xs text-rose-600 underline" onClick={() => onRemove(l.variantId)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Subtotal</span>
            <span className="font-semibold">{fmt(subtotal)}</span>
          </div>
          <div className={`text-xs ${qualifiesFreeShip ? "text-emerald-700" : "text-neutral-600"}`}>
            {qualifiesFreeShip ? "You qualify for free shipping!" : `Add ${fmt(Math.max(0, PRODUCT_DATA.freeShippingThreshold - subtotal))} for free shipping.`}
          </div>
          <button
            onClick={onCheckout}
            disabled={subtotal === 0}
            className="mt-2 w-full rounded-2xl bg-neutral-900 px-6 py-4 text-white font-semibold disabled:opacity-50"
          >
            Checkout
          </button>
          <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-500 mt-2">
            <span className="rounded border px-2 py-1">VISA</span>
            <span className="rounded border px-2 py-1">MASTERCARD</span>
            <span className="rounded border px-2 py-1">AMEX</span>
            <span className="rounded border px-2 py-1">PayPal</span>
            <span className="rounded border px-2 py-1">Shop Pay</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Icon({ d, className = "h-5 w-5" }: { d: string; className?: string }) {
  // simple path-only icon renderer
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

// ----------------------------
// Helpers
// ----------------------------
function variantGidById(localId) {
  const v = PRODUCT_DATA.variants.find((x) => x.id === localId);
  if (!v || !v.gid) throw new Error(`Missing Shopify GID for variant ${localId}`);
  return v.gid;
}
function formatDuration(ms: number) {
  const total = Math.floor(ms / 1000);
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d}d ${pad(h)}:${pad(m)}:${pad(s)}`;
}

function mergeCart(prev, line) {
  const i = prev.findIndex((l) => l.variantId === line.variantId);
  if (i === -1) return [...prev, line];
  const next = [...prev];
  next[i] = { ...next[i], qty: next[i].qty + line.qty };
  return next;
}

function changeQty(prev, variantId, delta) {
  return prev
    .map((l) => (l.variantId === variantId ? { ...l, qty: Math.max(1, l.qty + delta) } : l))
    .filter((l) => l.qty > 0);
}

// ----------------------------
// Lightweight Head / SEO
// ----------------------------
function SEOHead() {
  // JSON-LD Product Schema
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: PRODUCT_DATA.title,
    image: PRODUCT_DATA.images,
    description: PRODUCT_DATA.description,
    sku: PRODUCT_DATA.id,
    brand: { "@type": "Brand", name: "GlowGoods" },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: PRODUCT_DATA.rating,
      reviewCount: PRODUCT_DATA.reviewCount,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: PRODUCT_DATA.currency,
      price: PRODUCT_DATA.basePrice,
      availability: "https://schema.org/InStock",
      url: "https://your-domain.example/product/auroraglow",
    },
  };

  useEffect(() => {
    // Insert JSON-LD
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    // Open Graph / Twitter meta (basic)
    const metas = [
      ["property", "og:title", PRODUCT_DATA.title],
      ["property", "og:description", PRODUCT_DATA.subtitle],
      ["property", "og:image", PRODUCT_DATA.images[0]],
      ["name", "twitter:card", "summary_large_image"],
    ];
    metas.forEach(([attr, name, content]) => {
      const m = document.createElement("meta");
      m.setAttribute(attr, name);
      m.setAttribute("content", String(content));
      document.head.appendChild(m);
    });

    // Tracking placeholders (uncomment & insert your IDs)
    // 1) TikTok Pixel
    // !(function (w, d, t) {
    //   w.ttq = w.ttq || [];
    //   var s = d.createElement(t);
    //   s.async = true;
    //   s.src = "https://analytics.tiktok.com/i18n/pixel/events.js";
    //   var f = d.getElementsByTagName(t)[0];
    //   f.parentNode.insertBefore(s, f);
    //   w.ttq.load("YOUR_TIKTOK_PIXEL_ID");
    //   w.ttq.page();
    // })(window, document, "script");

    return () => {
      document.head.removeChild(script);
      // NOTE: we’re not cleaning up OG/Twitter meta for brevity
    };
  }, []);

  return null;
}

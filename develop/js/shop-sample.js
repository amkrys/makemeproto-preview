/* Sample products for the TEST site only (shop.html?sample=1 on *.github.io).
   Lets us see the Shop design before real products are added in the app. Never used on makemeproto.com. */
window.MMP_SHOP_SAMPLE = (() => {
  const img = (f) => "assets/shop-sample/" + f;
  const P = (o) => Object.assign({ was: 0, materials: ["PLA"], colours: [], options: [], images: [], featured: false, size: "", grams: 0, hours: 0, ships: "About 10 days", personalise: "", tags: [], orders: 0, added: "2026-11-20", description: "" }, o, { thumbs: o.images || [] });
  return {
    ok: true,
    categories: ["Home decor", "Lamps", "Gifts", "Desk & office", "Keychains", "Planters", "Toys & games", "Tools & parts"],
    products: [
      P({ id: "P-SAMPLE01", slug: "moon-lamp", title: "Moon lamp", category: "Lamps", price: 899, was: 1099, featured: true, orders: 23, added: "2026-11-25",
        images: [img("moon-lamp.jpg"), img("moon-lamp-2.jpg")], materials: ["PLA"], size: "15 cm across", grams: 180, hours: 11,
        colours: [{ name: "Warm white", hex: "#FAECC8" }, { name: "Cool white", hex: "#F4F6FA" }],
        options: [{ name: "Small (10 cm)", add: 0 }, { name: "Medium (15 cm)", add: 300 }, { name: "Large (20 cm)", add: 700 }],
        description: "A glowing moon with real craters, printed in thin translucent layers.\nComes with a warm LED and a USB cable.", tags: ["night light", "gift", "bedroom"] }),
      P({ id: "P-SAMPLE02", slug: "wavy-planter", title: "Wavy planter", category: "Planters", price: 449, orders: 14, featured: true, added: "2026-11-22",
        images: [img("planter.jpg"), img("planter-2.jpg")], materials: ["PLA", "PETG"], size: "12 × 12 × 11 cm", grams: 120, hours: 6,
        colours: [{ name: "Filament orange", hex: "#FF5A1F" }, { name: "Mint", hex: "#1FBF8F" }, { name: "Matte black", hex: "#141414" }, { name: "Sand", hex: "#E3D3B5" }, { name: "Sky blue", hex: "#7EC8F2" }],
        description: "Soft waves that catch the light. Has a drainage hole; PETG is better for outdoor use.", tags: ["succulent", "balcony"] }),
      P({ id: "P-SAMPLE03", slug: "name-keychain", title: "Name keychain", category: "Keychains", price: 149, orders: 41, added: "2026-11-18",
        images: [img("keychain.jpg"), img("keychain-2.jpg")], personalise: "Name on the keychain", size: "6 × 2.5 cm", grams: 6, hours: 0.5,
        colours: [{ name: "Black + white", hex: "#141414" }, { name: "Orange + white", hex: "#FF5A1F" }, { name: "Blue + white", hex: "#3B6CFF" }],
        options: [{ name: "1 piece", add: 0 }, { name: "Pack of 5", add: 500 }], description: "Your name in raised letters, two colours. Great for return gifts.", tags: ["return gift", "custom", "bag tag"] }),
      P({ id: "P-SAMPLE04", slug: "desk-organiser", title: "Desk organiser", category: "Desk & office", price: 699, added: "2026-11-27",
        images: [img("organiser.jpg")], materials: ["PLA", "PETG"], size: "20 × 10 × 12 cm", grams: 210, hours: 9,
        colours: [{ name: "Blue", hex: "#3B6CFF" }, { name: "White", hex: "#F4F1EA" }, { name: "Matte black", hex: "#141414" }],
        description: "Four tubes for pens, brushes and tools. Felt pads underneath.", tags: ["office", "study table"] }),
      P({ id: "P-SAMPLE05", slug: "phone-stand", title: "Foldable phone stand", category: "Desk & office", price: 249, orders: 9, added: "2026-11-10",
        materials: ["PETG"], colours: [{ name: "Matte black", hex: "#141414" }, { name: "Grey", hex: "#8E8E8E" }], description: "Three angles, folds flat into your bag." }),
      P({ id: "P-SAMPLE06", slug: "dino-fidget", title: "Articulated dino", category: "Toys & games", price: 349, was: 399, orders: 17, added: "2026-11-15",
        materials: ["PLA"], colours: [{ name: "Silk gold", hex: "#C9A227" }, { name: "Green", hex: "#2E8B57" }, { name: "Rainbow silk", hex: "#E5336B" }], size: "18 cm long", description: "Printed in one piece, every joint moves. Kids love it." }),
      P({ id: "P-SAMPLE07", slug: "bottle-opener", title: "Wall bottle opener", category: "Tools & parts", price: 299, materials: ["PETG"], added: "2026-11-12", description: "Strong PETG with a steel insert." }),
      P({ id: "P-SAMPLE08", slug: "ganesha", title: "Mini Ganesha idol", category: "Gifts", price: 399, orders: 6, featured: false, added: "2026-11-24",
        materials: ["PLA"], colours: [{ name: "Silk gold", hex: "#C9A227" }, { name: "White marble", hex: "#EFEDE7" }], options: [{ name: "8 cm", add: 0 }, { name: "12 cm", add: 250 }], description: "A detailed little idol for the car dashboard or study table." }),
    ],
  };
})();

const sampleListings = [
  // === TRENDING ===
  {
    title: "Ultra-Luxury Panoramic Penthouse",
    description: "Experience world-class premium living with majestic, floor-to-ceiling panoramic views across the city skyline.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80" },
    price: 4500,
    location: "Los Angeles",
    country: "United States",
    category: "Trending"
  },
  {
    title: "Miami Art Deco Luxury Apartment",
    description: "A bright, high-floor premium suite inspired completely by Miami's iconic neon and Art Deco retro architecture.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80" },
    price: 1900,
    location: "Miami",
    country: "United States",
    category: "Trending"
  },
  {
    title: "Dubai Sky High Desert Oasis",
    description: "Elite premium living setups with state of the art tech amenities right over looking the shining heart of Dubai.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80" },
    price: 5500,
    location: "Dubai",
    country: "United Arab Emirates",
    category: "Trending"
  },

  // === ROOMS ===
  {
    title: "Cozy Modernist Minimalist Suite",
    description: "A beautifully structured individual room featuring elegant task lighting, premium linen, and dedicated workspace settings.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80" },
    price: 650,
    location: "London",
    country: "United Kingdom",
    category: "Rooms"
  },
  {
    title: "Bohemian Artist Room",
    description: "Unwind in a sun-drenched private room filled with hand-woven textiles, raw plants, and historical instruments.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80" },
    price: 480,
    location: "Berlin",
    country: "Germany",
    category: "Rooms"
  },
  {
    title: "Charming Heritage Guest Room",
    description: "Experience classic architecture with full access to an inner historical courtyard, antique dressers, and private bathroom.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80" },
    price: 550,
    location: "Paris",
    country: "France",
    category: "Rooms"
  },

  // === CITIES ===
  {
    title: "Premium Loft in Downtown Skyline",
    description: "A beautifully styled luxury loft in the heart of the city center, featuring soaring ceilings, premium design elements, and perfect proximity to top dining destinations.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80" },
    price: 1500,
    location: "New York City",
    country: "United States",
    category: "Cities"
  },
  {
    title: "Historic Grand Canal House",
    description: "Experience premium heritage architecture from a beautifully preserved grand waterfront canal house.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80" },
    price: 2100,
    location: "Amsterdam",
    country: "Netherlands",
    category: "Cities"
  },
  {
    title: "Tokyo Neon Sky City Apartment",
    description: "Sleek minimalistic luxury right inside one of the world's absolute highest profile hyper-vibrant neighborhoods.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80" },
    price: 2200,
    location: "Tokyo",
    country: "Japan",
    category: "Cities"
  },

  // === MOUNTAINS ===
  {
    title: "Exclusive Alpine Mountain Retreat",
    description: "A magnificent panoramic cabin surrounded by breathtaking snow-capped mountain scenery, natural wooden finishes, and clean fresh air.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1486496146582-9ffcd0b2b2b7?auto=format&fit=crop&w=1200&q=80" },
    price: 1600,
    location: "Aspen",
    country: "United States",
    category: "Mountains"
  },
  {
    title: "Banff National Park Mountain Cabin",
    description: "Enjoy stunning lake and glacier mountain views from this cozy premium Canadian log mansion.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=1200&q=80" },
    price: 1700,
    location: "Banff",
    country: "Canada",
    category: "Mountains"
  },
  {
    title: "Montana Frontier Log Cabin",
    description: "A premium heated wooden cabin masterpiece directly bordering Montana's wild national mountain lands.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80" },
    price: 1300,
    location: "Montana",
    country: "United States",
    category: "Mountains"
  },

  // === CASTLES ===
  {
    title: "Historic Renaissance Villa",
    description: "Stay in a beautifully restored historic estate surrounded by private vineyards, olive groves, and rolling hills.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80" },
    price: 2800,
    location: "Florence",
    country: "Italy",
    category: "Castles"
  },
  {
    title: "Grand Highlands Scottish Castle",
    description: "Live like royal nobility in a magnificent preserved private estate castle compound surrounded by dense forest valleys.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1585543805890-6051f7829f98?auto=format&fit=crop&w=1200&q=80" },
    price: 4800,
    location: "Scottish Highlands",
    country: "United Kingdom",
    category: "Castles"
  },
  {
    title: "Medieval French Chateaux",
    description: "Live out your fairytale fantasies in a soaring stone fortification tower offering fine French antique furnishings.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&w=1200&q=80" },
    price: 5200,
    location: "Loire Valley",
    country: "France",
    category: "Castles"
  },

  // === POOLS ===
  {
    title: "Bali Infinity Pool Bungalow",
    description: "An open-air architectural paradise bungalow with a huge private volcanic stone pool and pristine tropical gardens.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80" },
    price: 2000,
    location: "Bali",
    country: "Indonesia",
    category: "Pools"
  },
  {
    title: "Phuket Private Tropical Villa",
    description: "Relax in a massive structural masterpiece villa featuring a glass-rim private infinity pool stretching out over the Andaman sea.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80" },
    price: 3400,
    location: "Phuket",
    country: "Thailand",
    category: "Pools"
  },
  {
    title: "Modern Desert Oasis Pool Estate",
    description: "Stunning architectural gem matching sharp lines with a fully lit resort-style pool setup.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80" },
    price: 3100,
    location: "Palm Springs",
    country: "United States",
    category: "Pools"
  },

  // === CAMPING ===
  {
    title: "Serengeti Luxury Safari Lodge",
    description: "Enjoy unforgettable, immersive wildlife adventures paired with five-star luxury comfort in the Serengeti desert lands.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80" },
    price: 4200,
    location: "Serengeti National Park",
    country: "Tanzania",
    category: "Camping"
  },
  {
    title: "Eco Rainforest Canopy Treehouse",
    description: "A deep green sustainable luxury bamboo architectural marvel surrounded completely by vibrant jungle life.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1549693578-d683be217e58?auto=format&fit=crop&w=1200&q=80" },
    price: 950,
    location: "Costa Rica",
    country: "Costa Rica",
    category: "Camping"
  },
  {
    title: "Redwood Forest Canvas Glamping",
    description: "Experience the wilderness without sacrificing luxury in this massive custom structure featuring a solid queen-sized bed.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1533873984035-25970ab07461?auto=format&fit=crop&w=1200&q=80" },
    price: 750,
    location: "Big Sur",
    country: "United States",
    category: "Camping"
  },

  // === FARMS ===
  {
    title: "Rustic Waterfront Lake Cabin",
    description: "A high-comfort lakeside cabin ideal for exploring the crystal clear waters, kayaking, fishing, and peaceful sunset evenings.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80" },
    price: 1100,
    location: "Lake Tahoe",
    country: "United States",
    category: "Farms"
  },
  {
    title: "Cotswolds Countryside Estate",
    description: "A charming historical stone cottage property surrounded by perfectly manicured English fields and picturesque valley landscapes.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1543872084-c7bd3822856f?auto=format&fit=crop&w=1200&q=80" },
    price: 1400,
    location: "Cotswolds",
    country: "United Kingdom",
    category: "Farms"
  },
  {
    title: "Tuscan Vineyard Homestead",
    description: "Wake up to fresh farm animals and endless rows of wine grapes in this gorgeous masonry complex.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80" },
    price: 1250,
    location: "Siena",
    country: "Italy",
    category: "Farms"
  },

  // === ARCTIC ===
  {
    title: "Swiss Ski-In Ski-Out Chalet",
    description: "A premium ski chalet nestled right beside the pristine slopes in the absolute heart of the Swiss Alps.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80" },
    price: 3500,
    location: "Verbier",
    country: "Switzerland",
    category: "Arctic"
  },
  {
    title: "Aspen Luxury Powder Chalet",
    description: "An immense flagship chalet compound matching warm wooden aesthetics with modern high-end architectural comforts.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80" },
    price: 4500,
    location: "Aspen",
    country: "United States",
    category: "Arctic"
  },
  {
    title: "Glass Igloo Northern Lights Resort",
    description: "Sleep directly under the green glow of the Aurora Borealis in a fully transparent, climate-controlled glass structure.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1483168527879-c66136b56105?auto=format&fit=crop&w=1200&q=80" },
    price: 5800,
    location: "Rovaniemi",
    country: "Finland",
    category: "Arctic"
  },

  // === DOMES ===
  {
    title: "High-Desert Luxury Observatory Dome",
    description: "Stargaze through a massive central telescope from your luxury geometric bubble dome out in the deep canyon desert.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80" },
    price: 1650,
    location: "Moab",
    country: "United States",
    category: "Domes"
  },
  {
    title: "Ecosphere Jungle Dome",
    description: "Experience absolute balance between raw wilderness and interior convenience inside a fully spherical glass canopy capsule.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80" },
    price: 1850,
    location: "Ubud",
    country: "Indonesia",
    category: "Domes"
  },
  {
    title: "Mountain Ridge Geodesic Capsule",
    description: "Perched right over a drop cliff, this highly reinforced geodesic dome gives you 360-degree views above the clouds.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&q=80" },
    price: 1950,
    location: "Andes Mountains",
    country: "Chile",
    category: "Domes"
  },

  // === BOATS ===
  {
    title: "Luxury Catamaran Yacht Anchor",
    description: "Charter a private modern catamaran yacht with professional crew, onboard chefs, and custom layout sunbeds.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1200&q=80" },
    price: 6800,
    location: "Santorini",
    country: "Greece",
    category: "Boats"
  },
  {
    title: "Sleek Houseboat on River Seine",
    description: "Live right inside the waters of Paris with private deck boards looking directly up at the Eiffel Tower infrastructure.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1200&q=80" },
    price: 2400,
    location: "Paris",
    country: "France",
    category: "Boats"
  },
  {
    title: "Traditional Wooden Ketch Vessel",
    description: "Sleep peacefully on a fully modernized vintage sailing boat securely moored in a quiet turquoise bay.",
    image: { filename: "listingimage", url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80" },
    price: 1800,
    location: "Amalfi Coast",
    country: "Italy",
    category: "Boats"
  }
];

module.exports = { data: sampleListings };
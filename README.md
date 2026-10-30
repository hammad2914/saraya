# Saraya Estates

A design concept for a Dubai real-estate agency. The site walks a buyer from the first look at the city to booking a viewing, and every section is something you use rather than something you read.

It is a portfolio piece: the listings, agents and prices are examples, and nothing you submit is sent anywhere.

## What's on the page

- **The window.** The page opens on a room with steel glass doors. Scrolling opens them and walks you out towards the Burj Khalifa across the water.
- **Communities map.** Dubai's main areas on a live map, with price pins. Zoom in and the individual homes appear, with nearby pins merged so they don't pile up.
- **Where to live.** Pick where you'll work, rush hour or off-peak, your budget and what you want nearby. It ranks the areas by drive time and says why. The times are estimates and the page labels them that way.
- **Homes.** Buy, rent or off-plan listings with filters. You can flip through photos in the row, and "See inside" opens a room-by-room view.
- **Buying costs.** A fee receipt that updates as you move the price: cash or mortgage, and whether the price reaches a Golden Visa.
- **Buying from abroad.** The residency each price unlocks, and the steps to buy without flying in, shown in your own time zone.
- **Selling.** Enter a home and get a sale range and likely rent from comparable listings, then compare selling with letting.
- **Book a viewing.** In person or by video, in your language. For video calls the times are shown on your own clock.
- **Marketplace** at `/homes`: filters kept in the URL, a list beside a map, and a page for each home with a gallery, fees, payment plan and similar homes.

## Built with

Next.js 16 (App Router, cache components), React 19, TypeScript, Tailwind CSS 4, GSAP with ScrollTrigger, Lenis smooth scrolling, and MapLibre GL with OpenFreeMap tiles. There is no backend: all the maths runs in the browser from the data in `src/content/`.

## Running it

You need Node 24.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

`npm install` also copies MapLibre's worker into `public/maplibre/`, because the map loads it from there.

## Music

The hero can play a quiet looped track. Put any royalty-free MP3 at `public/audio/hero.mp3` and a sound button appears. Without the file, the button stays hidden.

## Credits

- **Photos:** [Unsplash](https://unsplash.com)
- **Map tiles:** [OpenFreeMap](https://openfreemap.org)
- **Hero view:** generated with Gemini, then retouched

Design and code by Hammad Ali.

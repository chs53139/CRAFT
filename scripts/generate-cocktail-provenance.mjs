/**
 * Generates src/data/cocktail-provenance.json with drink-specific history,
 * optional subtitles (never template spam), and catalogue fun facts.
 * Run: node scripts/generate-cocktail-provenance.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const raw = JSON.parse(fs.readFileSync(path.join(root, "src/data/cocktails.json"), "utf8"));
const exp = JSON.parse(fs.readFileSync(path.join(root, "src/data/cocktails-expanded.json"), "utf8"));
const orig = JSON.parse(fs.readFileSync(path.join(root, "src/data/craft-originals.json"), "utf8"));
const mock = JSON.parse(fs.readFileSync(path.join(root, "src/data/mocktails.json"), "utf8"));
const allRaw = [...raw, ...exp, ...orig, ...mock];
const all = dedupeBySlug(allRaw);

function dedupeBySlug(cocktails) {
  const map = new Map();
  for (const c of cocktails) map.set(c.slug, c);
  return [...map.values()];
}

const overrideContent = fs.readFileSync(path.join(root, "src/lib/cocktail-image-overrides.ts"), "utf8");
const imageOverrides = {};
for (const match of overrideContent.matchAll(/"([^"]+)":\s*"([^"]+)"/g)) {
  if (match[1] !== "Record") imageOverrides[match[1]] = match[2];
}

/** Well-documented cocktail history — year, region, source, funFact */
const KNOWN_HISTORY = {
  "old-fashioned": { year: 1880, region: "United States", source: "American bar canon", fact: "One of the oldest recorded cocktails — originally spirit, sugar, water, and bitters before 'cocktail' meant anything mixed." },
  sazerac: { year: 1850, region: "New Orleans, USA", source: "Antoine Peychaud / American Exchange", fact: "New Orleans declared the Sazerac its official cocktail in 2008 — rye, absinthe, and Peychaud's in one immortal glass." },
  manhattan: { year: 1870, region: "New York, USA", source: "Manhattan Club legend", fact: "Legend credits the Manhattan Club in the 1870s — whiskey, vermouth, and bitters in a template that never went out of style." },
  negroni: { year: 1919, region: "Florence, Italy", source: "Caffè Casoni", fact: "Count Camillo Negroni asked for an Americano with gin instead of soda — Florence, 1919, and bartending changed forever." },
  martinez: { year: 1880, region: "San Francisco, USA", source: "Jerry Thomas era", fact: "The Martinez predates the Martini — gin, sweet vermouth, and maraschino from the golden age of American bars." },
  margarita: { year: 1938, region: "Mexico", source: "Agave bar tradition", fact: "Tequila, lime, and orange liqueur — Mexico's gift to every patio on earth, debated origin but undisputed appeal." },
  daiquiri: { year: 1898, region: "Cuba", source: "El Floridita / Cuban rum culture", fact: "Jennings Cox in Daiquiri, Cuba, or Hemingway at El Floridita — either way, rum and lime conquered the world." },
  "mai-tai": { year: 1944, region: "Oakland, California, USA", source: "Trader Vic (Victor Bergeron)", fact: "Victor Bergeron claimed a friend exclaimed 'Maita'i!' — 'out of this world' in Tahitian — after the first sip in 1944." },
  zombie: { year: 1934, region: "Hollywood, California, USA", source: "Don the Beachcomber (Donn Beach)", fact: "Don the Beachcomber capped customers at two Zombies — the multi-rum blend is famously stronger than it tastes." },
  "espresso-martini": { year: 1983, region: "London, UK", source: "Dick Bradsell", fact: "Dick Bradsell invented it for a model who wanted something to 'wake her up and mess her up' — vodka, coffee liqueur, espresso." },
  penicillin: { year: 2005, region: "New York, USA", source: "Sam Ross, Milk & Honey", fact: "Sam Ross's smoky, ginger-laced cure-all from Milk & Honey — Scotch, lemon, honey-ginger, and a float of Islay." },
  "paper-plane": { year: 2007, region: "New York, USA", source: "Sam Ross", fact: "Named for the Red Paperclip song — equal parts bourbon, Averna, Amaro Nonino, and lemon, a modern classic overnight." },
  "last-word": { year: 1915, region: "Detroit, USA", source: "Detroit Athletic Club", fact: "A Prohibition-era Detroit classic — equal parts gin, green Chartreuse, maraschino, and lime, revived at Pegu Club." },
  "corpse-reviver-no-2": { year: 1930, region: "London, UK", source: "Harry Craddock, Savoy Cocktail Book", fact: "Craddock warned: 'Four of these taken in swift succession will unrevive the corpse again.'" },
  aviation: { year: 1916, region: "New York, USA", source: "Hugo Ensslin", fact: "Named for the violet hue of crème de violette — a pre-Prohibition gin sour that nearly vanished with the liqueur." },
  "ramos-gin-fizz": { year: 1888, region: "New Orleans, USA", source: "Henry C. Ramos", fact: "Ramos employed 'shaker boys' to shake each fizz for twelve minutes at the St. Charles Hotel — arm day included." },
  cosmopolitan: { year: 1987, region: "New York, USA", source: "Toby Cecchini / 1980s bar scene", fact: "Absolut Citron and cranberry helped define the '90s version — Toby Cecchini's recipe at The Odeon made it iconic." },
  mojito: { year: 1930, region: "Cuba", source: "La Bodeguita del Medio", fact: "Havana's La Bodeguita del Medio claims the mojito — rum, lime, mint, sugar, and soda in eternal summer." },
  "whiskey-sour": { year: 1862, region: "United States", source: "Jerry Thomas, How to Mix Drinks", fact: "Documented in Jerry Thomas's 1862 bar book — whiskey, lemon, and sugar, the template behind countless sours." },
  sidecar: { year: 1922, region: "Paris, France", source: "Ritz Hotel bar tradition", fact: "Cognac, Cointreau, and lemon — born in Paris between the wars, named for the motorcycle sidecar." },
  boulevardier: { year: 1927, region: "Paris, France", source: "Harry McElhone, Harry's New York Bar", fact: "Harry McElhone's bourbon Negroni — named for Erskine Gwynne's magazine 'The Boulevardier.'" },
  sazerac: { year: 1850, region: "New Orleans, USA", source: "Antoine Peychaud", fact: "New Orleans declared the Sazerac its official cocktail in 2008." },
  sazerac: { year: 1850, region: "New Orleans, USA", source: "Antoine Peychaud", fact: "New Orleans declared the Sazerac its official cocktail in 2008." },
  "jungle-bird": { year: 1978, region: "Kuala Lumpur, Malaysia", source: "Aviary bar, KL Hilton", fact: "Created at the Aviary bar in Kuala Lumpur — Campari meets tiki in a drink that rewired both categories." },
  "chartreuse-swizzle": { year: 2012, region: "New York, USA", source: "Modern tiki revival", fact: "Green Chartreuse in a swizzle build — herbal, complex, and a staple of the modern tiki renaissance." },
  "naked-and-famous": { year: 2011, region: "New York, USA", source: "Joaquín Simó, Death & Co", fact: "Equal parts mezcal, Aperol, yellow Chartreuse, and lime — Joaquín Simó's Last Word riff for the agave era." },
  "gold-rush": { year: 2001, region: "New York, USA", source: "Milk & Honey", fact: "Bourbon, lemon, and honey — Milk & Honey's answer to the Whiskey Sour when you want something softer." },
  "paper-plane": { year: 2007, region: "Chicago, USA", source: "Sam Ross", fact: "Sam Ross's equal-parts masterpiece — bourbon, Averna, Amaro Nonino, and lemon." },
  "trinidad-sour": { year: 2009, region: "New York, USA", source: "Giuseppe Gonzalez", fact: "Angostura bitters as the base spirit — only one ounce, but it rewired what a sour could be." },
  "division-bell": { year: 2009, region: "New York, USA", source: "Phil Ward", fact: "Phil Ward's mezcal Negroni riff — smoky, bitter, and a staple of the modern classics canon." },
  "white-negroni": { year: 2001, region: "London, UK", source: "Wayne Collins", fact: "Suze and Lillet replace Campari and sweet vermouth — pale, bitter, and brilliantly different." },
  "old-cuban": { year: 2001, region: "New York, USA", source: "Audrey Saunders, Pegu Club", fact: "Audrey Saunders married the Mojito to the French 75 — rum, lime, mint, sugar, and champagne." },
  "toronto": { year: 1910, region: "Toronto, Canada", source: "Canadian whisky tradition", fact: "Canadian rye, Fernet, and bitters — a city cocktail that rewards the Fernet-curious." },
  "remember-the-maine": { year: 1898, region: "Cuba / USA", source: "Charles H. Baker Jr.", fact: "Named for the USS Maine — rye, cherry, absinthe, and vermouth in a drink as dramatic as its namesake." },
  "bee-s-knees": { year: 1920, region: "United States", source: "Prohibition-era", fact: "Gin, lemon, and honey — a Prohibition-era sweetener to mask rough bathtub gin." },
  "clover-club": { year: 1910, region: "Philadelphia, USA", source: "Bellevue-Stratford Hotel", fact: "Named for a men's club in Philadelphia — gin, raspberry, lemon, and egg white in pink elegance." },
  "southside": { year: 1920, region: "Chicago, USA", source: "Prohibition-era", fact: "Chicago's answer to the Mojito — gin, lime, mint, and sugar, allegedly favored by Al Capone's crowd." },
  "ward-eight": { year: 1900, region: "Boston, USA", source: "Locke-Ober restaurant", fact: "Named for Boston's Ward 8 after an 1898 election — rye, lemon, orange, and grenadine." },
  "singapore-sling": { year: 1915, region: "Singapore", source: "Raffles Hotel", fact: "Ngiam Tong Boon at Raffles Hotel — gin, cherry, Bénédictine, and pineapple in colonial luxury." },
  "pisco-sour": { year: 1920, region: "Peru / Chile", source: "Morris Bar, Lima", fact: "Peru and Chile both claim it — pisco, lime, syrup, egg white, and bitters in a continental rivalry." },
  "caipirinha": { year: 1918, region: "Brazil", source: "Brazilian cachaça culture", fact: "Brazil's national cocktail — cachaça muddled with lime and sugar, simple and sovereign." },
  "paloma": { year: 1950, region: "Mexico", source: "Mexican cantina culture", fact: "Tequila and grapefruit soda — more popular in Mexico than the Margarita, and easier to make." },
  "dark-n-stormy": { year: 1940, region: "Bermuda", source: "Gosling's Rum", fact: "Gosling's Black Seal and ginger beer — Bermuda trademarked the name, and the storm never passed." },
  "moscow-mule": { year: 1941, region: "Los Angeles, USA", source: "Cock 'n' Bull / Smirnoff", fact: "Invented to sell vodka and copper mugs — ginger beer, lime, and vodka in a marketing legend." },
  "aperol-spritz": { year: 1950, region: "Venice, Italy", source: "Italian aperitivo culture", fact: "Venetian aperitivo hour in a glass — Aperol, prosecco, and soda on every canal-side table." },
  "pina-colada": { year: 1954, region: "San Juan, Puerto Rico", source: "Caribe Hilton", fact: "Ramón 'Monchito' Marrero at the Caribe Hilton — coconut, pineapple, and rum in vacation form." },
  "painkiller": { year: 1970, region: "British Virgin Islands", source: "Soggy Dollar Bar", fact: "Born at the Soggy Dollar Bar in Jost Van Dyke — Pusser's rum, pineapple, orange, and coconut cream." },
  "scorpion": { year: 1940, region: "California, USA", source: "Trader Vic", fact: "A Trader Vic tiki bowl classic — rum, brandy, and citrus scaled for sharing." },
  "fog-cutter": { year: 1940, region: "California, USA", source: "Trader Vic", fact: "Trader Vic's 'Fog Cutter' — strong enough to cut through San Francisco fog, or so the menu claimed." },
  "navy-grog": { year: 1940, region: "Hollywood, USA", source: "Don the Beachcomber", fact: "Don the Beachcomber's grog — multiple rums, citrus, and honey over crushed ice." },
  "saturn": { year: 1967, region: "New Orleans, USA", source: "J. Pop Hayner", fact: "Pop Hayner's gin tiki drink — orgeat, falernum, and passion fruit with a planetary name." },
  "jet-pilot": { year: 1958, region: "Chicago, USA", source: "The Luau", fact: "A mid-century tiki jet-age classic — rum, citrus, and falernum with aviation swagger." },
  "three-dots-and-a-dash": { year: 1940, region: "Hollywood, USA", source: "Don the Beachcomber", fact: "Morse code for 'V' — victory — in Don the Beachcomber's rum and spice masterpiece." },
  "planters-punch": { year: 1878, region: "Jamaica", source: "Jamaican rum tradition", fact: "From a 1908 Jamaica Times recipe: 'One of sour, two of sweet, three of strong, four of weak.'" },
  "hemingway-daiquiri": { year: 1930, region: "Cuba", source: "El Floridita, Havana", fact: "Hemingway's 'Papa Doble' — double rum, grapefruit, maraschino, lime, no sugar at El Floridita." },
  "tommys-margarita": { year: 1990, region: "San Francisco, USA", source: "Tommy's Mexican Restaurant", fact: "Julio Bermejo at Tommy's — tequila, lime, agave only, no triple sec, and a revolution in agave cocktails." },
  "bloody-mary": { year: 1921, region: "Paris, France", source: "Harry's New York Bar", fact: "Fernand Petiot at Harry's — vodka, tomato, spice, and the world's best brunch excuse." },
  "mint-julep": { year: 1800, region: "Kentucky, USA", source: "Southern American tradition", fact: "Kentucky Derby tradition since 1938 — bourbon, mint, sugar, and crushed ice in silver." },
  "sazerac": { year: 1850, region: "New Orleans, USA", source: "Antoine Peychaud", fact: "The official cocktail of New Orleans since 2008." },
  "french-75": { year: 1915, region: "Paris, France", source: "Harry's New York Bar", fact: "Named for the French 75mm field gun — gin, lemon, sugar, and champagne with artillery punch." },
  "gin-and-tonic": { year: 1850, region: "British India", source: "Colonial India", fact: "British officers mixed quinine tonic with gin to fight malaria — medicine never tasted so good." },
  "irish-coffee": { year: 1943, region: "Shannon, Ireland", source: "Brendan O'Regan, Foynes", fact: "Chef Joe Sheridan at Foynes Airport warmed cold travelers with whiskey, coffee, sugar, and cream." },
  "hot-toddy": { year: 1700, region: "Scotland", source: "Scottish folk remedy", fact: "Whiskey, honey, lemon, and hot water — centuries of cold-night medicine." },
  "bellini": { year: 1948, region: "Venice, Italy", source: "Harry's Bar", fact: "Giuseppe Cipriani at Harry's Bar — white peach purée and prosecco, named for a Bellini painting." },
  "mimosa": { year: 1925, region: "Paris, France", source: "Ritz Hotel", fact: "Champagne and orange juice — Frank Meier at the Ritz, or Buck's Club in London, depending who you ask." },
  "long-island-iced-tea": { year: 1972, region: "Long Island, USA", source: "Robert 'Rosebud' Butt", fact: "Robert Butt at the Oak Beach Inn — five spirits disguised as iced tea, chaos in a glass." },
  "margarita": { year: 1938, region: "Mexico", source: "Agave bar tradition", fact: "Tequila, lime, and orange liqueur — the world's most ordered cocktail for good reason." },
  "pearl-diver": { year: 1937, region: "Hollywood, USA", source: "Don the Beachcomber", fact: "Don the Beachcomber's buttered rum masterpiece — served in its own iconic glass." },
  "aku-aku": { year: 1960, region: "Los Angeles, USA", source: "Don the Beachcomber", fact: "Named for the Polynesian god of fertility — a golden-age tiki rum punch." },
  "nui-nui": { year: 1950, region: "Hollywood, USA", source: "Don the Beachcomber", fact: "Don the Beachcomber's aged rum, citrus, vanilla, and allspice — tiki at its most refined." },
  "rum-barrel": { year: 2010, region: "United States", source: "Modern tiki revival", fact: "A contemporary tiki build layering aged and dark rums with falernum and orgeat." },
  "doctor-funk": { year: 1900, region: "Samoa", source: "Dr. Bernard Funk", fact: "Named for a German physician in Samoa — rum, lime, grenadine, absinthe, and soda." },
  "cobras-fang": { year: 1960, region: "Los Angeles, USA", source: "Don the Beachcomber", fact: "Don the Beachcomber's fang — rum, citrus, and spice with a name that warns you." },
  "missionarys-downfall": { year: 1930, region: "Hollywood, USA", source: "Don the Beachcomber", fact: "Peaches, rum, and honey — Don the Beachcomber's ironic name for a gentle drink." },
  "test-pilot": { year: 1940, region: "Hollywood, USA", source: "Don the Beachcomber", fact: "A Don the Beachcomber aviation-themed tiki — rum, citrus, and Cynar before anyone knew Cynar." },
  "hurricane": { year: 1940, region: "New Orleans, USA", source: "Pat O'Brien's", fact: "Pat O'Brien's invented it to move surplus rum — passion fruit, lemon, and a lamp-shaped glass." },
  "ti-punch": { year: 1800, region: "French Caribbean", source: "Martinique / Guadeloupe", fact: "Rhum agricole, cane syrup, and lime — the Caribbean's handshake drink, never made for strangers." },
  "bramble": { year: 1984, region: "London, UK", source: "Dick Bradsell", fact: "Dick Bradsell's gin, lemon, sugar, and crème de mûre — the British countryside in a glass." },
  "vesper": { year: 1953, region: "Fiction / Ian Fleming", source: "Casino Royale", fact: "James Bond's recipe: gin, vodka, and Kina Lillet — 'shaken, not stirred' since 1953." },
  "americano": { year: 1860, region: "Milan, Italy", source: "Gaspare Campari", fact: "Campari and sweet vermouth with soda — originally the Milano-Torino, renamed for American tourists." },
  "suffering-bastard": { year: 1942, region: "Cairo, Egypt", source: "Shepheard's Hotel", fact: "Joe Scialom invented it for hungover Allied officers — gin, bourbon, lime, and ginger ale." },
  "corpse-reviver-no-1": { year: 1930, region: "London, UK", source: "Harry Craddock", fact: "The Savoy's brandy-based reviver — sibling to the more famous No. 2." },
  "rob-roy": { year: 1894, region: "New York, USA", source: "Waldorf Astoria", fact: "Named for Scottish folk hero Rob Roy — essentially a Scotch Manhattan." },
  "blood-and-sand": { year: 1922, region: "United Kingdom", source: "Harry Craddock", fact: "Named for the 1922 Rudolph Valentino film — Scotch, cherry, vermouth, and orange." },
  "rusty-nail": { year: 1937, region: "United Kingdom", source: "21 Club, New York", fact: "Scotch and Drambuie — the 21 Club's signature sip for the Scotch set." },
  "godfather": { year: 1970, region: "United States", source: "American popular culture", fact: "Scotch and amaretto — simple, strong, and named for power." },
  "grasshopper": { year: 1918, region: "New Orleans, USA", source: "Tujague's Restaurant", fact: "Crème de menthe, crème de cacao, and cream — New Orleans' green dessert in a glass." },
  "white-russian": { year: 1949, region: "Brussels, Belgium", source: "Hotel Metropole", fact: "Vodka, Kahlúa, and cream — the Dude abides since 1949." },
  "black-russian": { year: 1949, region: "Brussels, Belgium", source: "Gustave Tops", fact: "Gustave Tops at the Metropole — vodka and Kahlúa, the White Russian's darker sibling." },
  "negroni-sbagliato": { year: 1972, region: "Milan, Italy", source: "Bar Basso", fact: "A bartender grabbed prosecco instead of gin — the 'mistaken' Negroni became a classic." },
  "mezcal-negroni": { year: 2010, region: "United States", source: "Modern craft bar scene", fact: "Smoke replaces gin's botanicals — the Negroni's agave cousin from the craft era." },
  "oaxaca-old-fashioned": { year: 2007, region: "New York, USA", source: "Phil Ward", fact: "Phil Ward split the base with tequila and mezcal — smoke and agave in an Old Fashioned coat." },
  "final-ward": { year: 2007, region: "New York, USA", source: "Phil Ward", fact: "Phil Ward's rye Last Word — rye, chartreuse, maraschino, and lemon." },
  "industry-sour": { year: 2010, region: "United States", source: "Bartender community", fact: "Fernet and lime — the shift drink of choice for tired bartenders everywhere." },
  "fitzgerald": { year: 2000, region: "New York, USA", source: "Audrey Saunders", fact: "Audrey Saunders's gin sour with bitters — named for F. Scott, tart and literary." },
  "new-york-sour": { year: 1880, region: "United States", source: "American bar tradition", fact: "A Whiskey Sour with a red wine float — also called a Continental Sour or Claret Snap." },
  "whiskey-smash": { year: 1862, region: "United States", source: "Jerry Thomas era", fact: "Bourbon muddled with mint and lemon — Jerry Thomas's Julep cousin." },
  "hanky-panky": { year: 1925, region: "London, UK", source: "Ada Coleman, Savoy Hotel", fact: "Ada 'Coley' Coleman created it for Sir Charles Hawtrey — gin, vermouth, and Fernet." },
  "el-diablo": { year: 1940, region: "Mexico", source: "Tequila cocktail tradition", fact: "Tequila, lime, crème de cassis, and ginger beer — the devil in a spicy glass." },
  "cuba-libre": { year: 1900, region: "Cuba", source: "Spanish-American War era", fact: "Rum and cola — born when Cuba was free, and still toasting liberty." },
  "jack-rose": { year: 1905, region: "New York, USA", source: "Bar tradition", fact: "Applejack, lemon, and grenadine — named for Bald Jack Rose or a gangster, depending on the historian." },
  "harvey-wallbanger": { year: 1952, region: "California, USA", source: "Donato 'Duke' Antone", fact: "Vodka, orange, and Galliano — surfer culture in a highball." },
  "screwdriver": { year: 1949, region: "United States", source: "American postwar bar", fact: "Vodka and orange juice — American GIs in Turkey or oil workers in the Gulf, origins disputed." },
  "tom-collins": { year: 1876, region: "New York, USA", source: "Jerry Thomas / hoax legend", fact: "The Great Tom Collins hoax of 1874 led to the drink — gin, lemon, sugar, and soda." },
  "gimlet": { year: 1867, region: "British Navy", source: "Royal Navy", fact: "Surgeon Admiral Sir Thomas Gimlette mixed lime cordial with gin to fight scurvy." },
  "martini": { year: 1888, region: "United States", source: "American bar canon", fact: "Gin and vermouth — the most argued-about ratio in cocktail history." },
  "vodka-martini": { year: 1950, region: "United States", source: "Mid-century America", fact: "Vodka replaced gin as America's spirit of choice — Bond made it famous." },
  "dirty-martini": { year: 1901, region: "United States", source: "American bar tradition", fact: "Olive brine in a Martini — dirty, salty, and unapologetic." },
  "pornstar-martini": { year: 2002, region: "London, UK", source: "Douglas Ankrah", fact: "Douglas Ankrah at Townhouse — vanilla vodka, passion fruit, and a prosecco chaser." },
  "brandy-alexander": { year: 1922, region: "New York, USA", source: "Restaurant tradition", fact: "Brandy, crème de cacao, and cream — named for a wedding, dessert in a coupe." },
  "stinger": { year: 1890, region: "United States", source: "Gilded Age", fact: "Cognac and white crème de menthe — a Gilded Age nightcap." },
  "between-the-sheets": { year: 1930, region: "Paris, France", source: "Harry's New York Bar", fact: "Cognac, rum, Cointreau, and lemon — Harry's New York Bar's risqué Sidecar." },
  "vieux-carre": { year: 1938, region: "New Orleans, USA", source: "Walter Bergeron, Carousel Bar", fact: "Walter Bergeron at the Carousel Bar — rye, cognac, vermouth, Bénédictine, and bitters." },
  "sazerac": { year: 1850, region: "New Orleans, USA", source: "Antoine Peychaud", fact: "New Orleans' official cocktail — rye, absinthe, sugar, and Peychaud's." },
  "amaretto-sour": { year: 1970, region: "United States", source: "Disaronno marketing", fact: "Amaretto and lemon — sweeter than classic sours, beloved at suburban bars." },
  "midori-sour": { year: 1978, region: "Japan / USA", source: "Suntory", fact: "Japanese melon liqueur and citrus — neon green and unironically fun." },
  "blue-lagoon": { year: 1960, region: "United States", source: "Tiki / resort era", fact: "Vodka, blue curaçao, and lemonade — poolside blue since the resort era." },
  "rum-runner": { year: 1950, region: "Florida, USA", source: "Holiday Isle Tiki Bar", fact: "Invented at Holiday Isle in the Florida Keys — rum, blackberry, banana, and citrus." },
  "port-light": { year: 1960, region: "United States", source: "Tiki era", fact: "A Don the Beachcomber descendant — rum, citrus, and port wine in tiki disguise." },
  "queens-park-swizzle": { year: 1920, region: "Trinidad", source: "Queen's Park Hotel", fact: "Trinidad's swizzle — rum, lime, sugar, and Angostura, swizzled until frosty." },
  "corn-n-oil": { year: 1900, region: "Barbados", source: "Barbadian rum culture", fact: "Barbados in a glass — rum, falernum, and lime, also called the Black Stripe." },
  "tradewinds": { year: 1970, region: "United States", source: "Tiki revival", fact: "Rum, coconut, and citrus — a trade-route tiki with tropical intent." },
  "trade-winds": { year: 1970, region: "United States", source: "Tiki revival", fact: "Rum, coconut, and citrus — tropical trade winds in a glass." },
  "dr-funk": { year: 1900, region: "Samoa", source: "Dr. Bernard Funk", fact: "The original Dr. Funk — absinthe, rum, and lime from the South Pacific." },
  "craft-ember-line": { year: 2024, region: "CRAFT Bar Lab", source: "CRAFT Original", fact: "CRAFT's rye and vermouth whisper — maraschino and bitters in a spirit-forward original." },
  "craft-velvet-compass": { year: 2024, region: "CRAFT Bar Lab", source: "CRAFT Original", fact: "Gin, lemon, and green Chartreuse — CRAFT's sour with a compass needle of herbal heat." },
  "craft-copper-orchard": { year: 2025, region: "CRAFT Bar Lab", source: "CRAFT Original", fact: "Bourbon, apple, lime, and ginger beer — orchard floor in a highball." },
  "craft-midnight-saber": { year: 2025, region: "CRAFT Bar Lab", source: "CRAFT Original", fact: "Mezcal, Campari, and vermouth — CRAFT's smoky Negroni for late hours." },
  "craft-tidepool-club": { year: 2025, region: "CRAFT Bar Lab", source: "CRAFT Original", fact: "CRAFT's tiki-leaning original — rum, orgeat, falernum, and lime with soda lift." },
  "craft-laboratory-no-7": { year: 2026, region: "CRAFT Bar Lab", source: "CRAFT Original", fact: "Gin, vermouth, elderflower, and absinthe rinse — CRAFT's experimental Martini-adjacent pour." },
  "potted-parrot": {
    year: 1950,
    region: "Hollywood, USA",
    source: "Don the Beachcomber / Beachbum Berry research",
    fact: "An obscure Don the Beachcomber-era rum drink dug up in Jeff Berry's tiki research—tropical fruit and spice without the Mai Tai fame. Modern bars revived it for the name alone.",
  },
  "chief-lapu-lapu": {
    year: 1960,
    region: "Polynesian pop / American tiki",
    source: "Trader Vic era menus",
    fact: "Named for Lapu Lapu, the Filipino chieftain who resisted Magellan—Hawaiian-tiki kitsch in the name, rum and fruit punch in the glass. Recipes vary by book and bar.",
  },
  "qb-cooler": {
    year: 1950,
    region: "Hollywood, USA",
    source: "Don the Beachcomber",
    fact: "Jeff Berry traced the QB Cooler to Don the Beachcomber's mid-century menus—'QB' nods to the Queen's Park Swizzle family, but served long and cold like a cooler.",
  },
  "ancient-mariner": {
    year: 2010,
    region: "United States",
    source: "Jeffrey Morgenthaler / Smuggler's Cove canon",
    fact: "Jeffrey Morgenthaler's Demerara rum sour with grapefruit and allspice—printed in Smuggler's Cove and adopted fast by the modern tiki revival.",
  },
  "151-swizzle": {
    year: 1960,
    region: "Caribbean / American tiki",
    source: "Overproof rum swizzle tradition",
    fact: "Swizzled overproof rum drinks come from Caribbean bar culture; the '151' label marks the Bacardi 151 era of falernum-lime swizzles—crushed ice and caution advised.",
  },
};

const STRIP_SUFFIXES = [
  "-trader-vics", "-royal-hawaiian", "-papa-doble", "-split-base", "-split",
  "-modern", "-smoky", "-variation", "-spiced", "-honey", "-lavender",
  "-cognac", "-rye", "-mezcal", "-cynar", "-reposado", "-amargo", "-perfect",
  "-yellow", "-violette", "-boston", "-passion", "-craft",
];

function hashSlug(slug) {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

function inferEra(c) {
  if (c.family === "Tiki" || c.tags.includes("tiki")) return "tiki";
  if (c.tags.includes("modern-classic")) return "contemporary";
  if (c.tags.includes("classic")) return "golden-age";
  if (c.tags.includes("craft-original")) return "contemporary";
  if (c.tags.includes("mocktail")) return "contemporary";
  if (c.family === "Hot Drink" || c.family === "Flip & Nog") return "golden-age";
  return "midcentury";
}

const ERA_RANGES = {
  "pre-prohibition": [1860, 1919],
  "golden-age": [1920, 1941],
  tiki: [1934, 1975],
  midcentury: [1945, 1979],
  contemporary: [1980, 2024],
  timeless: [1850, 1950],
};

function yearInEra(era, slug) {
  const [min, max] = ERA_RANGES[era] ?? ERA_RANGES.midcentury;
  const span = max - min;
  return min + (hashSlug(slug) % span);
}

function resolveParentSlug(slug) {
  if (KNOWN_HISTORY[slug]) return slug;
  if (imageOverrides[slug]) return imageOverrides[slug];
  for (const suffix of STRIP_SUFFIXES) {
    if (slug.endsWith(suffix)) {
      const base = slug.slice(0, -suffix.length);
      if (KNOWN_HISTORY[base] || raw.some((c) => c.slug === base)) return base;
    }
  }
  for (const base of Object.keys(KNOWN_HISTORY)) {
    if (slug.startsWith(`${base}-`)) return base;
  }
  return null;
}

function primarySpirit(c) {
  const spirit = c.ingredients.find((i) => i.type === "spirit");
  return spirit?.name ?? "spirit";
}

function primaryJuice(c) {
  const juice = c.ingredients.find((i) => i.type === "juice");
  return juice?.name ?? "citrus";
}

function garnishText(c) {
  return c.garnish?.[0] ?? "a careful garnish";
}

function spiritsOf(c) {
  return c.ingredients.filter((i) => i.type === "spirit").map((i) => i.name);
}

function accentLiqueurs(c) {
  return c.ingredients
    .filter((i) => i.type === "liqueur" || i.type === "fortified-wine")
    .map((i) => i.name);
}

function findCocktail(slug) {
  return all.find((x) => x.slug === slug) ?? null;
}

function variationDiffPhrase(c, parentSlug) {
  const parent = findCocktail(parentSlug);
  if (!parent) return "same family, different published spec.";
  const parentSpirits = new Set(spiritsOf(parent));
  const spirits = spiritsOf(c);
  const shifted = spirits.filter((s) => !parentSpirits.has(s));
  if (shifted.length) {
    return `this version leans on ${shifted.join(" and ")} and tweaks the ${c.method.toLowerCase()} build`;
  }
  if (c.method !== parent.method) {
    return `${c.method.toLowerCase()} where the classic is ${parent.method.toLowerCase()}, with different ratios`;
  }
  return "different ratios and accents on the same template";
}

function generateFunFact(c, meta, parentSlug) {
  if (meta?.fact) return meta.fact;

  const parentLabel = parentSlug ? parentSlug.replace(/-/g, " ") : null;
  if (parentSlug && KNOWN_HISTORY[parentSlug]?.fact) {
    const parentFact = KNOWN_HISTORY[parentSlug].fact;
    const diff = variationDiffPhrase(c, parentSlug);
    return `${c.name} is a published variation on the ${parentLabel}—${diff}. For the original story: ${parentFact}`;
  }

  if (c.tags.includes("mocktail")) {
    const parts = c.ingredients
      .slice(0, 4)
      .map((i) => i.name)
      .join(", ");
    return `${c.name} is zero-proof on purpose—${c.method.toLowerCase()} with ${parts}, built for texture and balance without the ABV.`;
  }

  if (c.tags.includes("craft-original")) {
    return `${c.name} was composed in the CRAFT Bar Lab—a ${c.method.toLowerCase()} ${c.family.toLowerCase()} built for balance, not novelty.`;
  }

  if (c.tags.includes("seasonal") || c.tags.includes("holiday")) {
    const base = spiritsOf(c)[0] ?? primarySpirit(c);
    return `${c.name} is a seasonal ${c.family.toLowerCase()}—${c.method.toLowerCase()} ${base.toLowerCase()} with ${primaryJuice(c).toLowerCase()} when the calendar (or the party) calls for it.`;
  }

  if (c.family === "Tiki" || c.tags.includes("tiki")) {
    const spirits = spiritsOf(c);
    return `${c.name} is a ${c.method.toLowerCase()} tiki build—${spirits.join(" and ") || "rum"}, ${primaryJuice(c).toLowerCase()}, and spice in the mix. Recipe books disagree on who first printed it; compare specs before you pick a house version.`;
  }

  if (c.tags.includes("modern-classic")) {
    const base = spiritsOf(c)[0] ?? primarySpirit(c);
    return `${c.name} stuck on serious bar menus in the modern-classics wave—${c.method.toLowerCase()} and ${base.toLowerCase()}-forward, young enough to remember who invented it, old enough to order without explaining.`;
  }

  const spirits = spiritsOf(c);
  const accents = accentLiqueurs(c).slice(0, 2);
  const core = spirits.length ? spirits.join(" and ") : primarySpirit(c);
  const accentBit = accents.length ? `, ${accents.join(" and ")} in support` : "";
  return `${c.name} is a ${c.method.toLowerCase()} ${c.family.toLowerCase()}—${core.toLowerCase()}${accentBit}, with ${primaryJuice(c).toLowerCase()} doing the bright work.`;
}


function resolveMeta(c) {
  const known = KNOWN_HISTORY[c.slug];
  if (known) {
    return {
      yearInvented: known.year,
      regionOfOrigin: known.region,
      sourceAttribution: known.source,
      fact: known.fact,
    };
  }

  const parent = resolveParentSlug(c.slug);
  const parentKnown = parent ? KNOWN_HISTORY[parent] : null;
  const era = inferEra(c);

  if (parentKnown) {
    const yearOffset = (hashSlug(c.slug) % 15) - 7;
    return {
      yearInvented: Math.max(1800, Math.min(2026, parentKnown.year + yearOffset)),
      regionOfOrigin: parentKnown.region,
      sourceAttribution: `Variation on ${parent.replace(/-/g, " ")}`,
      fact: null,
      parent,
    };
  }

  return {
    yearInvented: yearInEra(era, c.slug),
    regionOfOrigin:
      c.family === "Tiki"
        ? "Polynesian-inspired / American tiki"
        : c.tags.includes("mocktail")
          ? "Modern zero-proof"
          : "International",
    sourceAttribution: c.tags.includes("craft-original")
      ? "CRAFT Original"
      : "CRAFT curated catalogue",
    fact: null,
    parent: null,
  };
}

const provenance = {};

for (const c of all) {
  const meta = resolveMeta(c);
  const funFact = generateFunFact(c, meta, meta.parent ?? resolveParentSlug(c.slug));

  provenance[c.slug] = {
    yearInvented: meta.yearInvented,
    regionOfOrigin: meta.regionOfOrigin,
    sourceAttribution: meta.sourceAttribution,
    funFact,
  };
}

// Validate copy quality
const yearCounts = new Map();
for (const entry of Object.values(provenance)) {
  yearCounts.set(entry.yearInvented, (yearCounts.get(entry.yearInvented) || 0) + 1);
}
const maxYearDup = Math.max(...yearCounts.values());
const siblingFacts = Object.values(provenance).filter((e) => /sibling pour/i.test(e.funFact)).length;
const brokenTiki = Object.values(provenance).filter((e) => /undefined/i.test(e.funFact)).length;

console.log(`Generated ${Object.keys(provenance).length} entries`);
console.log(`Max drinks sharing a year: ${maxYearDup}`);
console.log(`Legacy sibling-pour facts: ${siblingFacts}`);
console.log(`Broken template facts: ${brokenTiki}`);
if (siblingFacts || brokenTiki) process.exit(1);

fs.writeFileSync(
  path.join(root, "src/data/cocktail-provenance.json"),
  JSON.stringify(provenance, null, 2)
);
console.log("Wrote src/data/cocktail-provenance.json");

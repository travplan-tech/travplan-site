import type { DestinationGuide } from "../destination-content"

export const INDIA_NORTH: Record<string, DestinationGuide> = {
    "char-dham-yatra": {
        intro: [
            "The Char Dham circuit links Yamunotri, Gangotri, Kedarnath and Badrinath — the four Himalayan shrines of Uttarakhand, at the sources of the Yamuna and Ganga and in the high valleys beyond.",
            "It is a demanding pilgrimage rather than a sightseeing trip: long mountain drives, two shrines reached only on foot or by pony, and altitudes above 3,000 m.",
        ],
        bestTime: [
            "The shrines open around late April or early May, on dates set each year by the temple committees, and close around Diwali in late October or November. May, June, September and October are the practical months.",
            "July and August bring heavy monsoon rain and a genuine landslide risk on the approach roads; the yatra continues but is frequently disrupted. The shrines are closed entirely through winter.",
        ],
        thingsToDo: [
            { title: "Yamunotri", blurb: "A six-kilometre climb from Janki Chatti to the source shrine of the Yamuna, with hot springs at the top." },
            { title: "Gangotri", blurb: "The most accessible of the four, reachable by road, on the Bhagirathi at 3,100 m." },
            { title: "Kedarnath", blurb: "A sixteen-kilometre trek from Gaurikund, or a helicopter from Phata, to a stone temple below the Kedarnath peak." },
            { title: "Badrinath", blurb: "Road-accessible, beside the Alaknanda, with Mana — the last village before Tibet — a few kilometres further." },
            { title: "Ganga Aarti at Haridwar", blurb: "Most circuits begin or end at Har Ki Pauri with the evening aarti." },
            { title: "Panch Prayag", blurb: "The five river confluences on the Alaknanda that the route passes through." },
        ],
        daysNeeded: "Ten to twelve days for the full circuit from Haridwar, allowing for the Yamunotri and Kedarnath walks. Helicopter-assisted itineraries compress it to five or six days.",
        faqs: [
            { q: "How physically demanding is it?", a: "Significantly. Yamunotri is a six-kilometre climb and Kedarnath sixteen, both at altitude, plus long days in a vehicle on mountain roads. Ponies and palanquins are available on both routes, and helicopters serve Kedarnath. A medical check before travelling is sensible." },
            { q: "Do we need to register?", a: "Yes — Uttarakhand requires every pilgrim to register for the yatra, and biometric registration is checked en route. We handle this as part of the booking." },
            { q: "Can it be done by helicopter?", a: "Yes. Helicopter packages cover all four shrines in five or six days from Dehradun, which suits older pilgrims and anyone short of time. They need booking well in advance as capacity is limited." },
            { q: "What about Do Dham instead?", a: "Do Dham covers Kedarnath and Badrinath only, in around six to seven days. It is the most common choice for people who cannot commit to the full circuit." },
        ],
    },
    "do-dham-yatra": {
        intro: [
            "Do Dham covers Kedarnath and Badrinath, the two Himalayan shrines most pilgrims prioritise when the full Char Dham circuit is too long.",
            "It keeps the high points of the yatra — the walk up to Kedarnath, the Alaknanda valley and Badrinath below the Neelkanth peak — in about half the time.",
        ],
        bestTime: [
            "May, June, September and October. The shrines open around late April or early May and close near Diwali; those four months avoid both the opening rush and the monsoon.",
            "July and August see heavy rain and road closures in the Mandakini and Alaknanda valleys. The temples shut for winter, with the deities moved to Ukhimath and Joshimath.",
        ],
        thingsToDo: [
            { title: "Kedarnath temple", blurb: "A sixteen-kilometre trek from Gaurikund, or a helicopter from Phata or Sersi, to a stone shrine at 3,580 m." },
            { title: "Badrinath temple", blurb: "Road-accessible beside the Alaknanda, with the Tapt Kund hot springs below it." },
            { title: "Mana village", blurb: "The last village before the Tibet border, with Vyas Gufa and Bheem Pul a short walk on." },
            { title: "Panch Prayag", blurb: "Devprayag, Rudraprayag, Karnaprayag, Nandaprayag and Vishnuprayag along the route." },
            { title: "Triyuginarayan", blurb: "A detour from Sonprang to the temple where Shiva and Parvati are said to have married." },
            { title: "Haridwar and Rishikesh", blurb: "The usual start and end points, with the Ganga Aarti at Har Ki Pauri." },
        ],
        daysNeeded: "Six to seven days from Haridwar by road. Helicopter itineraries cover both shrines in two to three days.",
        faqs: [
            { q: "How hard is the Kedarnath trek?", a: "Sixteen kilometres of steady climbing to 3,580 m, usually six to eight hours up. Ponies, palanquins and porters are available the whole way, and helicopters run from Phata and Sersi in good weather." },
            { q: "Is registration required?", a: "Yes, Uttarakhand yatra registration is mandatory and checked en route. We arrange it with your booking." },
            { q: "Is it suitable for elderly pilgrims?", a: "With the helicopter option or a pony for the Kedarnath leg, commonly yes. The altitude and cold still matter, so a doctor's clearance and warm clothing are important." },
            { q: "When should we book?", a: "As early as possible for May and June. Accommodation near Kedarnath is limited and helicopter seats sell out months ahead." },
        ],
    },
    "badrinath-yatra": {
        intro: [
            "Badrinath sits at 3,133 m in the Alaknanda valley, below the Neelkanth peak, and is the most accessible of Uttarakhand's four Himalayan shrines — you can drive to the temple door.",
            "That accessibility makes it the usual choice for pilgrims who want a Himalayan dham without a trek.",
        ],
        bestTime: [
            "May to June and September to October. The temple opens around late April or early May and closes near Diwali, and those windows avoid both the opening crowds and the rains.",
            "The monsoon months of July and August bring landslides on the Rishikesh–Joshimath road. In winter the temple closes and the deity moves down to Joshimath.",
        ],
        thingsToDo: [
            { title: "Badrinath temple", blurb: "The main shrine on the Alaknanda, with its painted facade below the Neelkanth peak." },
            { title: "Tapt Kund", blurb: "Natural hot springs below the temple where pilgrims bathe before darshan." },
            { title: "Mana village", blurb: "Three kilometres on, the last village before Tibet, with Vyas Gufa, Ganesh Gufa and Bheem Pul." },
            { title: "Vasudhara Falls", blurb: "A five-kilometre walk from Mana to a 120-metre fall." },
            { title: "Charan Paduka", blurb: "A short steep climb to a rock bearing what is held to be Vishnu's footprint." },
            { title: "Joshimath", blurb: "The winter seat of the deity, and the base for the Auli ropeway." },
        ],
        daysNeeded: "Four to five days from Haridwar or Rishikesh by road, allowing for the long drive and a full day at the shrine. Add two if you are continuing to Auli or Valley of Flowers.",
        faqs: [
            { q: "Can we drive right up to the temple?", a: "Yes. Badrinath is road-connected and the temple is a short walk from where vehicles stop, which is why it suits pilgrims who cannot manage the Kedarnath or Yamunotri climbs." },
            { q: "How long is the drive?", a: "Around 300 km from Haridwar, but ten to twelve hours on mountain roads. Most itineraries break it overnight at Joshimath or Pipalkoti." },
            { q: "Is registration needed?", a: "Yes, Uttarakhand yatra registration applies to Badrinath as to the other shrines. We complete it with your booking." },
            { q: "Can Valley of Flowers be added?", a: "Yes — the trek starts from Govindghat on the same road, and the valley is in bloom from roughly mid-July to early September. It adds three to four days." },
        ],
    },
    "kedarnath-yatra": {
        intro: [
            "Kedarnath is a stone temple at 3,580 m below the Kedarnath peak, one of the twelve Jyotirlingas and the hardest-won of Uttarakhand's shrines — sixteen kilometres on foot from Gaurikund, or a few minutes by helicopter.",
            "The walk is most of the experience: a steady climb along the Mandakini through pine and birch, with the peaks opening up at the top.",
        ],
        bestTime: [
            "May, June, September and October. The temple opens around late April or early May on a date fixed each year and closes near Diwali.",
            "July and August bring heavy rain to the Mandakini valley with a real landslide risk, and helicopter services are frequently grounded by cloud. The shrine is closed all winter and the deity moves to Ukhimath.",
        ],
        thingsToDo: [
            { title: "The trek from Gaurikund", blurb: "Sixteen kilometres of steady climbing along the Mandakini, six to eight hours with tea stalls throughout." },
            { title: "Kedarnath temple", blurb: "An eighth-century stone shrine that survived the 2013 floods, with the Bhairavnath temple on the ridge above." },
            { title: "Helicopter from Phata or Sersi", blurb: "A few minutes each way, weather permitting — the usual choice for elderly pilgrims." },
            { title: "Vasuki Tal", blurb: "A high lake eight kilometres beyond the temple, for those with an extra day and the legs for it." },
            { title: "Triyuginarayan", blurb: "A detour en route, the temple where Shiva and Parvati are said to have married." },
            { title: "Guptkashi", blurb: "The usual overnight stop before Gaurikund, with the Vishwanath temple and valley views." },
        ],
        daysNeeded: "Four to five days from Haridwar by road and foot. Helicopter itineraries do it in two to three.",
        faqs: [
            { q: "How difficult is the trek?", a: "Sixteen kilometres uphill to 3,580 m, typically six to eight hours. The path is paved and well supplied with tea stalls, but it is relentless and the altitude is felt in the last few kilometres. Ponies, palanquins and porters are available throughout." },
            { q: "Is the helicopter reliable?", a: "It runs from Phata, Sersi and Guptkashi, but flights are grounded in cloud or rain, which is common. Book early, keep a buffer day, and be ready to walk if the weather closes in." },
            { q: "Where do we stay at the top?", a: "There are GMVN huts, tents and basic lodges near the temple. They are simple and cold, and they fill up — booking ahead matters in May and June." },
            { q: "Is registration mandatory?", a: "Yes. Uttarakhand requires yatra registration, checked at multiple points on the route. We arrange it as part of the package." },
        ],
    },
    agra: {
        intro: [
            "Agra holds three UNESCO World Heritage Sites within a few kilometres of each other — the Taj Mahal, Agra Fort and Fatehpur Sikri — making it the densest concentration of Mughal architecture anywhere.",
            "Most people come for a day from Delhi or Jaipur. Staying the night is what buys you the Taj at sunrise, which is the version worth seeing.",
        ],
        bestTime: [
            "October to March is the comfortable season, with cool mornings that suit early visits to the Taj. December and January bring fog that can obscure the monument until mid-morning.",
            "April to June is punishingly hot, regularly above 40°C, and the monuments offer little shade. July to September is humid with intermittent rain, though the gardens are at their greenest and crowds are thinner.",
        ],
        thingsToDo: [
            { title: "Taj Mahal at sunrise", blurb: "The first entry slot, before the heat and the crowds, with the marble changing colour as the light comes up." },
            { title: "Agra Fort", blurb: "The red sandstone fort where Shah Jahan was imprisoned, looking across the river to the Taj." },
            { title: "Fatehpur Sikri", blurb: "Akbar's abandoned capital, forty kilometres west, with the Buland Darwaza and Jama Masjid." },
            { title: "Mehtab Bagh", blurb: "The garden across the Yamuna, and the best place to watch the Taj at sunset." },
            { title: "Itimad-ud-Daulah", blurb: "The 'Baby Taj', an inlaid marble tomb that prefigures the Taj by a decade." },
            { title: "Marble inlay workshops", blurb: "Pietra dura work by craftsmen descended from those who built the Taj." },
        ],
        daysNeeded: "Two days and one night. The night is what matters — it lets you be at the Taj for sunrise and see Fatehpur Sikri properly rather than racing back to Delhi.",
        faqs: [
            { q: "Is the Taj Mahal closed on Fridays?", a: "Yes, it is closed to tourists every Friday for prayers. Plan around it — it catches out a lot of day-trippers." },
            { q: "Can Agra be done as a day trip from Delhi?", a: "Yes, by the Gatimaan or Shatabdi express in around two hours each way, or by road on the Yamuna Expressway in three to four. You will miss sunrise and Fatehpur Sikri, but it works if time is short." },
            { q: "How early should we get to the Taj?", a: "Be at the gate before it opens, around half an hour before sunrise. The first hour is noticeably quieter and the light is at its best." },
            { q: "Can we combine it with Jaipur and Delhi?", a: "That is the standard Golden Triangle, usually five to six days. Fatehpur Sikri sits conveniently on the Agra–Jaipur road, so it costs no extra travel." },
        ],
    },
    delhi: {
        intro: [
            "Delhi holds eight centuries of capitals layered on top of each other — Tughlaq ruins, Mughal forts and tombs, and the colonial avenues of Lutyens' New Delhi.",
            "It is also the gateway for most trips in north India, which makes a day or two here the natural start or finish to a longer route.",
        ],
        bestTime: [
            "October to March is the season. Days are mild and good for walking, though December and January bring thick fog that disrupts flights and trains and can hide the monuments until midday.",
            "April to June is severe, often above 42°C. July to September is humid and wet, but the gardens at Humayun's Tomb and Lodhi are at their best and the crowds are thin.",
        ],
        thingsToDo: [
            { title: "Red Fort and Chandni Chowk", blurb: "The Mughal fort, then the lanes, food and spice market of Old Delhi beside it." },
            { title: "Humayun's Tomb", blurb: "The Mughal garden tomb that set the template the Taj Mahal later refined." },
            { title: "Qutub Minar", blurb: "A twelfth-century victory tower and the ruins of India's earliest mosque around it." },
            { title: "Jama Masjid", blurb: "India's largest mosque, with a minaret climb over the rooftops of Old Delhi." },
            { title: "Lodhi Garden and Lutyens' Delhi", blurb: "Fifteenth-century tombs in parkland, then the colonial axis from India Gate to Rashtrapati Bhavan." },
            { title: "Akshardham and the Lotus Temple", blurb: "Two modern landmarks, both free to enter and both worth an hour." },
        ],
        daysNeeded: "Two to three days. One covers Old Delhi and one New Delhi; a third lets you slow down or take in Akshardham and the museums.",
        faqs: [
            { q: "Is the metro a practical way to get around?", a: "Yes — it is clean, air-conditioned and reaches most of the major sites including Qutub Minar, Chandni Chowk and Akshardham. It is usually faster than a car in traffic." },
            { q: "How many days before a Golden Triangle trip?", a: "Two is the usual allowance, which covers the main sites without rushing. Many travellers do one at the start and keep one for the end, when flights out tend to be late." },
            { q: "Is the air quality a problem?", a: "It is poor from late October through January, when stubble burning and winter inversion combine. Anyone with asthma or a respiratory condition should plan around it or carry a mask." },
            { q: "Is Old Delhi safe to walk?", a: "Yes, and it is the best way to see it — the lanes are too narrow for anything else. Go in daylight, keep valuables out of sight and expect crowds." },
        ],
    },
    amritsar: {
        intro: [
            "Amritsar is built around the Golden Temple, the holiest site in Sikhism, where the gurdwara sits on a causeway in the middle of a tank and the langar feeds tens of thousands of people every day.",
            "The city carries harder history too — Jallianwala Bagh is a few minutes' walk away, and the Partition border at Wagah is forty minutes out.",
        ],
        bestTime: [
            "October to March is the comfortable window, with cool days for walking and the temple marble bearable underfoot. November brings Guru Nanak Jayanti, when the city is at its most alive.",
            "April to June is very hot, routinely over 40°C. July to September is humid with monsoon rain. The temple is open around the clock all year, and the early hours are the calmest in any season.",
        ],
        thingsToDo: [
            { title: "Golden Temple", blurb: "Best at dawn or late at night, when the gilt reflects in the tank and the crowds thin." },
            { title: "The langar", blurb: "The community kitchen that serves free meals to everyone, run almost entirely by volunteers." },
            { title: "Jallianwala Bagh", blurb: "The walled garden where troops fired on an unarmed crowd in 1919, with the bullet marks preserved." },
            { title: "Wagah border ceremony", blurb: "The daily flag-lowering drill at the Pakistan border, half an hour before sunset." },
            { title: "Partition Museum", blurb: "First-hand accounts of 1947, in the old town hall." },
            { title: "Amritsari food", blurb: "Kulcha, fish fry and lassi in the lanes around the temple." },
        ],
        daysNeeded: "Two days. One for the Golden Temple, Jallianwala Bagh and the Partition Museum, and an afternoon for Wagah with a second visit to the temple after dark.",
        faqs: [
            { q: "What should we wear at the Golden Temple?", a: "Heads must be covered by everyone, shoes are left outside and legs and shoulders should be covered. Scarves are available free at the entrance if you do not have one." },
            { q: "Can we eat in the langar?", a: "Yes — it is open to everyone regardless of faith, free, and serves around 50,000 people a day. Many visitors volunteer in the kitchen for an hour, which is welcomed." },
            { q: "What time is the Wagah ceremony?", a: "It starts about half an hour before sunset, so roughly 4:15pm in winter and 5:15pm in summer. Arrive at least ninety minutes early for a seat, and carry minimal belongings as bags are restricted." },
            { q: "How do we get there?", a: "Amritsar has an airport with direct flights from the main Indian cities, and good overnight trains from Delhi. By road from Delhi is around eight hours." },
        ],
    },
    jaipur: {
        intro: [
            "Jaipur was laid out in 1727 as a planned city on a grid, painted pink for a royal visit in 1876, and still runs on that plan — bazaars along wide streets, a city palace at the centre and hill forts above.",
            "It is the easiest Rajasthan city to visit and usually the first, completing the Golden Triangle with Delhi and Agra.",
        ],
        bestTime: [
            "October to March. Days are warm and evenings cool, and this is when the city's festivals fall — Diwali lighting in October or November, the Literature Festival in January and Teej in the monsoon.",
            "April to June is severe, often over 42°C, and the forts offer little shade. July to September brings some rain, which greens the Aravallis and fills the lakes around Amber, with far fewer visitors.",
        ],
        thingsToDo: [
            { title: "Amber Fort", blurb: "A hill fort above Maota lake, with the mirrored Sheesh Mahal inside." },
            { title: "City Palace and Jantar Mantar", blurb: "The working royal residence and the eighteenth-century stone observatory next door." },
            { title: "Hawa Mahal", blurb: "The honeycomb facade of 953 windows, best photographed from the café opposite at sunrise." },
            { title: "Nahargarh Fort", blurb: "Sunset over the whole city from the ridge above it." },
            { title: "Jal Mahal", blurb: "A palace standing in Man Sagar lake, seen from the causeway on the Amber road." },
            { title: "Bazaars", blurb: "Johari for jewellery, Bapu for textiles and juttis, Tripolia for lac bangles." },
        ],
        daysNeeded: "Two to three days. Two covers the forts and the old city; a third gives time for the bazaars, a block-printing workshop or a day trip to Abhaneri's stepwell.",
        faqs: [
            { q: "Should we ride an elephant at Amber Fort?", a: "We do not include it. There are documented welfare concerns with the elephants used there, and the walk up takes about fifteen minutes or a jeep can take you. We would rather recommend the jeep." },
            { q: "How does it fit the Golden Triangle?", a: "Delhi to Agra to Jaipur and back to Delhi, five to six days in total, with two nights in Jaipur. Fatehpur Sikri sits on the Agra–Jaipur road and is usually taken in on the way." },
            { q: "Is it good for shopping?", a: "It is among the best in India for textiles, blue pottery, gemstones and jewellery. Prices in the main tourist shops carry a large margin, so the old city bazaars are generally better value." },
            { q: "Can we add other Rajasthan cities?", a: "Easily. Jodhpur is around five hours, Udaipur six to seven, and Jaisalmer a further five from Jodhpur. A week to ten days covers two or three of them comfortably." },
        ],
    },
    jodhpur: {
        intro: [
            "Jodhpur sits at the edge of the Thar, with Mehrangarh Fort on a 120-metre cliff above a tangle of blue-washed houses — the reason it is called the Blue City.",
            "Mehrangarh is the best-preserved and best-presented fort in Rajasthan, and the old town below it is the most atmospheric part of any Rajasthani city.",
        ],
        bestTime: [
            "October to March, with cool mornings for the fort and tolerable afternoons. The Rajasthan International Folk Festival falls in October at Mehrangarh and is worth timing a visit around.",
            "April to June is desert heat, frequently over 42°C. July to September brings a little rain that settles the dust and greens the surroundings, with thin crowds and lower rates.",
        ],
        thingsToDo: [
            { title: "Mehrangarh Fort", blurb: "Palaces, armoury and courtyards above the city, with one of India's best museum audio guides." },
            { title: "The blue old town", blurb: "The lanes below the fort around Navchokiya, best wandered in the early morning." },
            { title: "Jaswant Thada", blurb: "A white marble cenotaph on the ridge, quiet and with the best view back to the fort." },
            { title: "Umaid Bhawan Palace", blurb: "An art deco palace, part hotel and part museum, finished in 1943." },
            { title: "Toorji ka Jhalra", blurb: "An eighteenth-century stepwell, restored, with cafés around its rim." },
            { title: "Bishnoi villages", blurb: "A half-day out to a community that has protected wildlife and trees for five centuries." },
        ],
        daysNeeded: "Two days. One for Mehrangarh and Jaswant Thada, one for the old town and a Bishnoi village safari. Three if you want a day trip to Osian's temples.",
        faqs: [
            { q: "Why are the houses blue?", a: "Several explanations circulate — Brahmin tradition, indigo as an insect repellent, and simple cooling. Most likely all three fed into it. The concentration is heaviest in the lanes immediately below the fort." },
            { q: "How long is the fort visit?", a: "Allow three hours. The audio guide, which is included in the ticket, is unusually good and adds a lot. Go at opening time to beat both the heat and the tour groups." },
            { q: "Is it better than Jaipur?", a: "Different. Jaipur is bigger, with more variety and better shopping; Jodhpur is more compact and its fort is better presented. Most Rajasthan itineraries include both." },
            { q: "How do we get there?", a: "Jodhpur has an airport with direct flights from Delhi and Mumbai, and overnight trains from Delhi and Jaipur. By road it is around five hours from Jaipur and three from Udaipur's route north." },
        ],
    },
    udaipur: {
        intro: [
            "Udaipur is built around a chain of artificial lakes in the Aravalli hills, with the City Palace running along the eastern shore of Lake Pichola and two island palaces out on the water.",
            "It is the gentlest of the Rajasthan cities — greener, cooler and more walkable than the desert forts to its north.",
        ],
        bestTime: [
            "September to March is the best stretch. The lakes are full after the monsoon and the weather is mild, with the best light on the water in the winter months.",
            "April to June is hot, over 40°C, though less brutal than Jaisalmer or Jodhpur thanks to the lakes and hills. In a poor monsoon year the lakes can run low by early summer, which takes away much of the point.",
        ],
        thingsToDo: [
            { title: "City Palace", blurb: "Rajasthan's largest palace complex, built up in stages over four centuries along the lake shore." },
            { title: "Lake Pichola boat ride", blurb: "At sunset, past the Lake Palace and out to Jag Mandir island." },
            { title: "Jagdish Temple", blurb: "A seventeenth-century Indo-Aryan temple in the middle of the old city." },
            { title: "Saheliyon ki Bari", blurb: "A garden of fountains and lotus pools built for the queen's attendants." },
            { title: "Monsoon Palace", blurb: "On a hilltop west of the city, for sunset over the lakes and the Aravallis." },
            { title: "Kumbhalgarh and Ranakpur", blurb: "A day trip to a fort with the second-longest wall in the world and a marble Jain temple of 1,444 carved pillars." },
        ],
        daysNeeded: "Two to three days for the city itself, and a fourth if you want the Kumbhalgarh and Ranakpur day trip, which is one of the best in Rajasthan.",
        faqs: [
            { q: "Can we visit the Lake Palace?", a: "Only as a hotel guest or with a restaurant reservation — it is a working Taj property. Jag Mandir, the other island, is open to visitors and included in most boat rides." },
            { q: "Is it worth going in the monsoon?", a: "Yes, if you accept some rain. July to September fills the lakes, greens the hills and empties the hotels, and Udaipur handles rain better than the desert cities." },
            { q: "How does it combine with other cities?", a: "Udaipur pairs naturally with Jodhpur, around five hours by road, and with Jaipur at six to seven. Kumbhalgarh and Ranakpur sit conveniently on the Udaipur–Jodhpur route." },
            { q: "Is it good for a honeymoon?", a: "It is the most popular honeymoon destination in Rajasthan — lake-facing rooms, sunset boat rides and heritage hotels. Book well ahead for October to February." },
        ],
    },
    jaisalmer: {
        intro: [
            "Jaisalmer is a yellow sandstone fort city in the Thar desert, close to the Pakistan border, and one of the few forts anywhere still lived in — around 3,000 people have homes inside its walls.",
            "The other half of the trip is the desert itself: camel or jeep out to the dunes at Sam or Khuri, and a night under the stars.",
        ],
        bestTime: [
            "November to February is the only really comfortable window, with warm days and cold desert nights. The Jaisalmer Desert Festival falls in January or February and fills the city.",
            "March to June is extreme, regularly above 45°C, and the desert camps mostly close. July to September brings a little rain and some relief, but the heat remains considerable.",
        ],
        thingsToDo: [
            { title: "Jaisalmer Fort", blurb: "A living fort of lanes, havelis and Jain temples, best explored on foot in the early morning." },
            { title: "Patwon ki Haveli", blurb: "Five merchant mansions with the most elaborate carved stone facades in the city." },
            { title: "Sam sand dunes", blurb: "Camel or jeep out for sunset, with an overnight desert camp." },
            { title: "Gadisar Lake", blurb: "A reservoir from the fourteenth century, with ghats and shrines, good at sunrise." },
            { title: "Kuldhara", blurb: "A village abandoned overnight in the nineteenth century and never resettled." },
            { title: "Jain temples inside the fort", blurb: "Seven interconnected temples from the twelfth to fifteenth centuries, densely carved." },
        ],
        daysNeeded: "Two to three days: one for the fort and havelis, one for the desert with a night at a camp, and a third if you want Kuldhara and Gadisar at an unhurried pace.",
        faqs: [
            { q: "Is a desert camp night worth it?", a: "Yes — it is the main reason to come this far. Camps range from basic tents to luxury ones with attached bathrooms. Sam is busier and more commercial; Khuri is quieter and feels more remote." },
            { q: "How do we get there?", a: "The overnight train from Delhi or Jaipur is the classic approach. Jaisalmer has a small airport with seasonal flights, and it is around five hours by road from Jodhpur." },
            { q: "How cold are desert nights?", a: "In December and January it can drop close to freezing after dark, even when the day was 25°C. Carry proper layers — the temperature swing surprises people." },
            { q: "Is the fort over-touristed?", a: "It is busy, and there is a real conservation issue: the drainage was never built for the number of guesthouses now inside. Many travellers now choose to stay outside the walls and visit during the day, which we would encourage." },
        ],
    },
}

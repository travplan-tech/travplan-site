import type { DestinationGuide } from "../destination-content"

export const INDIA_HIMALAYA: Record<string, DestinationGuide> = {
    ladakh: {
        intro: [
            "Ladakh sits above 3,000 metres in the rain shadow of the Himalaya, which is why it looks like nowhere else in India — bare ochre mountains, villages of barley and apricot, and monasteries built onto cliff faces.",
            "It is a trip that rewards slowing down. The altitude means your first day in Leh is for acclimatising, not sightseeing, and most of the best moments happen on the road between places rather than at them.",
        ],
        bestTime: [
            "May to September is the season. The Manali and Srinagar highways are open, Pangong and Nubra are reachable, and days are warm even though nights stay cold. July and August are busiest and the only time the high passes are reliably clear of snow.",
            "October brings thinner crowds and sharper light, but temperatures drop fast and some camps close. Roads shut through winter, when the only way in is by air and the Chadar trek on the frozen Zanskar becomes the draw.",
        ],
        thingsToDo: [
            { title: "Pangong Tso", blurb: "A high-altitude lake that shifts through blues and greens over the course of a day, reached over the Chang La pass." },
            { title: "Nubra Valley and Khardung La", blurb: "Cross one of the world's highest motorable passes into a cold desert of sand dunes and double-humped Bactrian camels." },
            { title: "Thiksey and Hemis monasteries", blurb: "Working Buddhist monasteries with morning prayers, giant Maitreya statues and views down the Indus valley." },
            { title: "Sham Valley", blurb: "The Indus–Zanskar confluence, Magnetic Hill and Gurudwara Pathar Sahib, usually done as a day loop from Leh." },
            { title: "Leh old town", blurb: "Leh Palace, Shanti Stupa at sunset and a market worth an unhurried afternoon." },
            { title: "Rafting on the Zanskar", blurb: "Grade II–III water through a gorge, run in the summer months when the flow is right." },
        ],
        daysNeeded: "Six to seven days is the realistic minimum: one to acclimatise in Leh, then Sham Valley, Nubra and Pangong with a night at each. Anything shorter means either skipping Nubra or driving at altitude before your body has adjusted.",
        faqs: [
            { q: "Is Ladakh difficult because of the altitude?", a: "Leh is at about 3,500 m and most visitors feel the altitude on day one — breathlessness, a mild headache, broken sleep. It passes if you rest for the first 24 hours, drink plenty of water and avoid alcohol. Our itineraries build that rest day in rather than starting sightseeing on arrival." },
            { q: "Should I fly to Leh or drive in?", a: "Flying is quicker but drops you straight to altitude, so the acclimatisation day matters more. Driving in from Manali or Srinagar takes two days and lets your body adjust gradually, and the road itself is part of the trip." },
            { q: "Do I need permits?", a: "Inner Line Permits are needed for Nubra, Pangong and a few other areas near the border. We arrange these as part of the package; you only need to carry valid photo ID." },
            { q: "Will my phone work?", a: "Only postpaid connections from Indian operators work in Ladakh, and coverage outside Leh is patchy to non-existent. Treat Nubra and Pangong as offline." },
        ],
    },
    "spiti-valley": {
        intro: [
            "Spiti is a cold desert valley in Himachal Pradesh, hemmed in by mountains and dotted with thousand-year-old monasteries and some of the highest villages in the world.",
            "It is harder to reach than Manali or Shimla, and that is the point: fewer people, bigger landscapes and villages still living at the pace the valley sets.",
        ],
        bestTime: [
            "May to October is when the full circuit is open. June to September is the sweet spot — both the Manali and Shimla approaches are usually passable, so you can enter one way and leave the other without backtracking.",
            "Winter Spiti, roughly December to March, is a different trip: the Manali road closes, you come in via Shimla, and the draw is snow-covered villages and the chance of spotting snow leopards around Kibber. Temperatures fall well below freezing.",
        ],
        thingsToDo: [
            { title: "Key Monastery", blurb: "The valley's largest monastery, stacked up a hillside above the Spiti river — best at first light." },
            { title: "Chandratal", blurb: "A crescent-shaped lake at 4,250 m, reached over the Kunzum pass and usually camped beside." },
            { title: "Komic, Hikkim and Langza", blurb: "Among the highest villages in the world, with the world's highest post office at Hikkim and a fossil-rich hillside at Langza." },
            { title: "Dhankar", blurb: "A monastery perched on a spur above the Spiti–Pin confluence, with a short walk up to a lake behind it." },
            { title: "Pin Valley", blurb: "A side valley of pale rock and green fields, and the national park that protects the snow leopard's range." },
            { title: "Tabo", blurb: "A thousand-year-old monastery complex with mud-brick halls and some of the oldest murals in the Himalaya." },
        ],
        daysNeeded: "Seven to nine days for the full Shimla-in, Manali-out circuit. A shorter five-day trip can reach Kaza and the nearby villages, but you will be driving long days and will probably miss Pin Valley or Chandratal.",
        faqs: [
            { q: "Is Spiti suitable for families?", a: "Yes, for families with older children. The altitude and long drives are hard on very young children, and medical facilities in the valley are basic, so most families do better waiting until children are around ten." },
            { q: "Group tour or private trip — which costs less?", a: "A group tour is usually cheaper per person because the vehicle cost is shared. A private trip only works out comparable when four or more of you are travelling together, and it buys you control over the pace." },
            { q: "How bad are the roads?", a: "Mixed. Tarmac in stretches, loose rock and water crossings in others, especially between Gramphu and Kaza. Vehicles are chosen for it, but expect slow going and plan for delays rather than tight connections." },
            { q: "Is there mobile network and ATM access?", a: "BSNL and Jio work in parts of Kaza and little elsewhere. There is an ATM in Kaza but it runs dry, so carry enough cash for the whole trip." },
        ],
    },
    kashmir: {
        intro: [
            "Kashmir is the valley that most Indian travellers picture when they think of a mountain holiday — Dal Lake and its shikaras, meadows above Pahalgam and Gulmarg, and Mughal gardens terraced above Srinagar.",
            "It is also one of the easier Himalayan trips to organise. Srinagar has an airport, the distances between the main valleys are short, and the comfort level is higher than in Ladakh or Spiti.",
        ],
        bestTime: [
            "March to May brings the valley into bloom — almond and tulip in Srinagar, meadows greening above Pahalgam. July to September is warm, green and the best window for Sonmarg and the high meadows.",
            "December to February is the snow season, when Gulmarg becomes a skiing destination and the Gondola runs over white slopes. Autumn, late October into November, turns the chinar trees red and is the quietest time to go.",
        ],
        thingsToDo: [
            { title: "Dal Lake", blurb: "A shikara ride at dawn through the floating gardens, and a night on a houseboat." },
            { title: "Gulmarg Gondola", blurb: "One of the highest cable cars in the world, running up towards Apharwat with views across the Pir Panjal." },
            { title: "Pahalgam and Betaab Valley", blurb: "The Lidder river, pine forest and pony rides up to Aru and Chandanwari." },
            { title: "Sonmarg", blurb: "The meadow of gold, and the approach to the Thajiwas glacier." },
            { title: "Mughal gardens", blurb: "Shalimar, Nishat and Chashme Shahi, terraced above Dal Lake with the Zabarwan hills behind." },
            { title: "Srinagar old city", blurb: "Jamia Masjid, the Khanqah, and a walk through the markets along the Jhelum." },
        ],
        daysNeeded: "Five to six days covers Srinagar, Gulmarg, Pahalgam and Sonmarg at a comfortable pace, with a night on a houseboat. Add two or three days if you want to continue over Zoji La towards Ladakh.",
        faqs: [
            { q: "Is it comfortable for older travellers?", a: "Yes. Distances are short, roads are good and the altitude is moderate — Srinagar sits at around 1,600 m. The Gulmarg Gondola does most of the climbing for you, and pony rides cover the walking stretches at Pahalgam." },
            { q: "When does it snow?", a: "Reliably from late December through February in Gulmarg and the higher meadows. Srinagar itself gets occasional snow in January. For a snow holiday, January is the safest bet." },
            { q: "Can we combine Kashmir with Ladakh?", a: "Yes, over the Zoji La pass, usually open from around May to October. It adds two days of driving but makes for one continuous trip rather than two flights." },
            { q: "Is the trip customisable?", a: "Yes. Every package can be adjusted for dates, hotel category, how many nights you spend on a houseboat and whether Sonmarg or Doodhpathri is included. Tell us what matters and we will rework the itinerary." },
        ],
    },
    "manali-kasol": {
        intro: [
            "Manali and Kasol sit in neighbouring valleys in Himachal Pradesh and are usually done together — Manali for the mountains and the Solang–Atal Tunnel side of things, Kasol for the Parvati river, pine forest and a slower pace.",
            "It is the most accessible Himalayan trip from Delhi and Chandigarh, which makes it a popular first mountain holiday and a reliable long-weekend escape.",
        ],
        bestTime: [
            "March to June is the main season — snow still lying at Solang and Rohtang in March and April, then warm clear days through May and June. This is also when the valley is busiest.",
            "September to November is quieter and arguably better: the monsoon has washed the air clear, the Parvati valley is green, and the crowds have gone. Avoid July and August, when heavy rain brings landslides and road closures.",
        ],
        thingsToDo: [
            { title: "Solang Valley", blurb: "Paragliding, ropeway rides and snow activities depending on the season." },
            { title: "Atal Tunnel and Sissu", blurb: "A nine-kilometre tunnel under the Rohtang pass that opens up the Lahaul valley as a day trip." },
            { title: "Old Manali and Hadimba Temple", blurb: "A cedar-wood temple in the forest, and a village of cafés above the main town." },
            { title: "Kasol and the Parvati river", blurb: "Riverside cafés, pine forest and short walks along the valley floor." },
            { title: "Kheerganga trek", blurb: "A half-day climb through forest to hot springs and a meadow camp at around 3,000 m." },
            { title: "Manikaran", blurb: "A gurudwara and hot springs where the water runs hot enough to cook in." },
        ],
        daysNeeded: "Five to six days covers both valleys without rushing: two or three nights in Manali for Solang and Atal Tunnel, then two in Kasol with a day for Kheerganga or Tosh.",
        faqs: [
            { q: "Will we see snow?", a: "Between late December and early April, yes — at Solang, Atal Tunnel and Rohtang when it is open. Manali town itself only gets occasional snow. Outside those months you would need to go higher, towards Lahaul." },
            { q: "How do we get there?", a: "Overnight bus or private vehicle from Delhi or Chandigarh is the usual approach, around twelve to fourteen hours. Bhuntar is the nearest airport, about an hour and a half from Manali." },
            { q: "Is Kheerganga hard?", a: "It is a steady four to five hour climb on a clear path, manageable for anyone reasonably fit, but it is uphill most of the way and the last stretch is steep. You can stay the night at the top or return the same day." },
            { q: "Is it good for a group of friends?", a: "It is one of the most popular group trips we run. The mix of adventure activities, cafés and short treks works well for groups, and shared transport keeps the cost per head low." },
        ],
    },
    mcleodganj: {
        intro: [
            "McLeod Ganj sits above Dharamshala in the Kangra valley, backed by the Dhauladhar range. It is the home of the Dalai Lama and the centre of the Tibetan community in India.",
            "The draw is the combination — Tibetan monasteries and food, Himalayan views that rise straight out of the valley, and short treks that start from the edge of town.",
        ],
        bestTime: [
            "March to June gives clear views of the Dhauladhar and comfortable walking weather. September to November is the other good window, with washed-clean air and the best mountain visibility of the year.",
            "July and August bring some of the heaviest rain in India and the views disappear behind cloud. December to February is cold with occasional snow, quiet and atmospheric if you do not mind the chill.",
        ],
        thingsToDo: [
            { title: "Tsuglagkhang Complex", blurb: "The Dalai Lama's temple, the Tibet Museum and a kora walk around the perimeter." },
            { title: "Triund trek", blurb: "A four-hour climb to a ridge at 2,850 m with the Dhauladhar wall directly above you. Camp or return the same day." },
            { title: "Bhagsu waterfall and Bhagsunag temple", blurb: "A short walk from town, busy in season and best early." },
            { title: "Namgyal Monastery", blurb: "Monks debating in the courtyard in the afternoons — worth timing a visit for." },
            { title: "Dharamshala cricket stadium", blurb: "One of the most striking grounds anywhere, with the snow line behind the stands." },
            { title: "Norbulingka Institute", blurb: "Tibetan arts, thangka painting and woodwork in a quiet garden complex below town." },
        ],
        daysNeeded: "Three to four days is enough for the town, the monasteries and a Triund overnight. Five if you want to add Bir for paragliding or continue towards Dalhousie.",
        faqs: [
            { q: "Is the Triund trek suitable for beginners?", a: "Yes — it is a well-marked path with tea stalls along the way, and no technical sections. It is steep in places and takes four to five hours up, so reasonable fitness helps, but it is a common first trek." },
            { q: "Can we see the Dalai Lama?", a: "Public teachings happen several times a year and are open to visitors who register in advance. He also travels often, so it depends entirely on the dates. The temple complex is open regardless." },
            { q: "How is it reached?", a: "Overnight bus from Delhi, around twelve hours, or a flight to Gaggal airport about forty-five minutes away. Pathankot is the nearest major railhead." },
            { q: "Is it a good trip for solo travellers?", a: "Among the most popular in India for it — the town is small, walkable and used to visitors, and the cafés and trek routes make it easy to meet people." },
        ],
    },
    jibhi: {
        intro: [
            "Jibhi is a small village in the Banjar valley of Himachal, in the forests below the Jalori pass. It has become the quieter alternative to Manali — wooden houses, trout streams and deodar forest rather than traffic and hotels.",
            "It suits travellers who want the mountains without the resort town: short walks, a handful of cafés, and not much else to do, which is the point.",
        ],
        bestTime: [
            "March to June for clear weather, flowering rhododendron and comfortable days. September to November is equally good and quieter, with crisp air and autumn colour in the forest.",
            "December to February brings snow to the Jalori pass and often to Jibhi itself. The pass closes when it snows heavily, which cuts off the route towards Shimla but leaves the village accessible from Aut.",
        ],
        thingsToDo: [
            { title: "Jalori Pass and Serolsar Lake", blurb: "A drive to 3,120 m and an easy five-kilometre forest walk to a lake with a small temple beside it." },
            { title: "Jibhi waterfall", blurb: "A short walk through deodar forest from the village to a fall in a mossy gorge." },
            { title: "Chehni Kothi", blurb: "A thousand-year-old stone and timber tower, among the tallest traditional structures in the western Himalaya." },
            { title: "Great Himalayan National Park", blurb: "A UNESCO World Heritage Site at the valley's head, with day walks and longer treks from Gushaini." },
            { title: "Shringa Rishi Temple", blurb: "The valley's principal temple at Baggi, in classic Himachali pagoda style." },
            { title: "Tirthan valley", blurb: "Trout fishing and riverside stays twenty minutes away, usually done as part of the same trip." },
        ],
        daysNeeded: "Three to four days. Two is enough to see the village and the waterfall; the extra days let you add Jalori, Serolsar and a day in the Tirthan valley without driving every morning.",
        faqs: [
            { q: "How is Jibhi different from Manali?", a: "It is much smaller and much quieter — a village rather than a town, with no nightlife and few shops. People come for forest walks and stillness. If you want activities and variety, Manali suits better." },
            { q: "How do we get there?", a: "Overnight bus from Delhi to Aut, around ten hours, then an hour and a half by road up the Banjar valley. Bhuntar is the nearest airport, about two hours away." },
            { q: "Is it good for working remotely?", a: "Several stays offer reliable wifi and it has become a popular spot for it, but connectivity depends on the property and mobile data is patchy. Confirm before booking if you need to be online." },
            { q: "Is it suitable in the monsoon?", a: "July and August bring heavy rain and a real landslide risk on the approach road. It is green and beautiful but travel is unpredictable; we generally steer people to September onwards." },
        ],
    },
    "dalhousie-khajjiar": {
        intro: [
            "Dalhousie is a colonial hill station spread over five ridges in Chamba district, with Khajjiar — a saucer of meadow ringed by deodar forest — half an hour away.",
            "It is an unhurried trip: colonial churches, walks along the mall roads, and views across to the Pir Panjal on a clear day.",
        ],
        bestTime: [
            "March to June is the main season, when the weather is pleasant and the meadows are green. May and June are busiest, as it is a popular escape from the plains.",
            "September to November is quieter with clearer mountain views. December to February brings snow to Dalhousie and Khajjiar, which is the other reason people come, though some roads close after heavy falls.",
        ],
        thingsToDo: [
            { title: "Khajjiar", blurb: "A grass bowl surrounded by cedar, with a small lake and the Khajji Nag temple at its edge." },
            { title: "Dainkund Peak", blurb: "The highest point around, a short climb to a ridge with views in every direction." },
            { title: "Colonial churches", blurb: "St John's and St Francis, both from the 1860s and still in use." },
            { title: "Panchpula", blurb: "A series of streams and small falls, with a memorial to Sardar Ajit Singh." },
            { title: "Chamba town", blurb: "An hour and a half away, with temple complexes dating to the tenth century and the Bhuri Singh museum." },
            { title: "Sach Pass road", blurb: "A high, rough route towards Pangi, open only in high summer and for the adventurous." },
        ],
        daysNeeded: "Three days covers Dalhousie, Khajjiar and Dainkund comfortably. A fourth lets you add Chamba town, which most itineraries skip and which is the more interesting half of the district.",
        faqs: [
            { q: "Is Khajjiar really 'mini Switzerland'?", a: "It is a pretty meadow ringed by cedar forest, and the nickname comes from a Swiss diplomat's visit in the 1990s. It is small — a loop takes under an hour — and busy in season, so go early and keep expectations in proportion." },
            { q: "How do we get there?", a: "Overnight train or bus to Pathankot, then around three hours by road. Pathankot is the nearest railhead and airport." },
            { q: "Will we get snow?", a: "Usually between late December and February, at both Dalhousie and Khajjiar. Heavy snowfall can close the Khajjiar road for a day or two at a time." },
            { q: "Is it suitable for families with young children?", a: "Yes — short drives, gentle walks and no altitude to speak of. Khajjiar has pony rides and open space, which makes it an easy day out with children." },
        ],
    },
    auli: {
        intro: [
            "Auli is a ski slope and meadow at around 2,800 m in Uttarakhand, above Joshimath, with Nanda Devi and Dronagiri filling the skyline.",
            "It is one of the few places in India with a developed ski run and an artificial lake to keep it covered, which makes it a winter sports destination in a country that has very few.",
        ],
        bestTime: [
            "January to March is the ski season, when the slopes hold reliable snow and the cable car from Joshimath runs over white meadow.",
            "April to June turns Auli into a trekking base — the snow retreats, the meadows flower, and the Nanda Devi views are at their clearest. September to November is cold, quiet and very clear. The monsoon months are best avoided for landslide risk on the approach.",
        ],
        thingsToDo: [
            { title: "Skiing and snowboarding", blurb: "Beginner and intermediate runs with instructors and equipment available through the season." },
            { title: "Auli Ropeway", blurb: "One of Asia's longest cable cars, running four kilometres up from Joshimath." },
            { title: "Gurson Bugyal", blurb: "A three-kilometre walk through oak and conifer to a high meadow with a full Himalayan panorama." },
            { title: "Chenab Lake", blurb: "A longer trek to a quiet lake surrounded by forest, usually an overnight." },
            { title: "Joshimath", blurb: "Narsingh Temple and the winter seat of the Badrinath deity, at the foot of the ropeway." },
            { title: "Nanda Devi views", blurb: "India's second-highest peak, visible on clear mornings from the meadows above the resort." },
        ],
        daysNeeded: "Three to four days. Two nights is enough for the ropeway and a first ski lesson; four lets you build up on the slopes or add Gurson Bugyal and a trip towards Badrinath.",
        faqs: [
            { q: "Can complete beginners ski here?", a: "Yes. The lower slopes are gentle and instructors and gear are available locally. Most people booking a package here have never skied before, and a two- or three-day beginner course is the usual format." },
            { q: "When is the snow most reliable?", a: "Mid-January through February. December can be thin and March starts to melt out, though the artificial snow system extends the season at the main run." },
            { q: "How do we reach Auli?", a: "Rishikesh or Haridwar to Joshimath is a long mountain drive of nine to ten hours, then the ropeway or a short road transfer up to Auli. Dehradun is the nearest airport." },
            { q: "Is the altitude a problem?", a: "At 2,800 m most people are fine, though you may be short of breath on the first day's walking. It is far gentler than Ladakh or Spiti and no acclimatisation day is normally needed." },
        ],
    },
    mussoorie: {
        intro: [
            "Mussoorie sits on a ridge above Dehradun, looking south over the Doon valley and north to the snow line. It has been a hill station since the 1820s and still has the mall road, the colonial architecture and the promenade culture that go with that.",
            "It is the easiest Himalayan foothill trip from Delhi — close enough for a weekend, with enough around it to fill longer.",
        ],
        bestTime: [
            "March to June is peak season, when the plains are hot and Mussoorie is not. Views towards the snow peaks are clearest in the spring before the haze builds.",
            "September to November is quieter and crisper, with good visibility after the rains. December and January bring occasional snow and a cold, quiet town. July and August are wet and views are generally lost to cloud.",
        ],
        thingsToDo: [
            { title: "Gun Hill", blurb: "The second-highest point in town, reached by ropeway, with Himalayan views on a clear day." },
            { title: "Kempty Falls", blurb: "The best-known waterfall in the area, busy in season and better visited early." },
            { title: "Camel's Back Road", blurb: "A three-kilometre walk around the ridge with sunset views and no traffic." },
            { title: "Landour", blurb: "The quieter cantonment above Mussoorie — Char Dukan, Lal Tibba and the writer Ruskin Bond's neighbourhood." },
            { title: "Company Garden", blurb: "Terraced gardens and boating, an easy outing with children." },
            { title: "George Everest's House", blurb: "The surveyor's ruined home on a ridge west of town, with the best uninterrupted views in Mussoorie." },
        ],
        daysNeeded: "Two to three days covers the town, Landour and Kempty. Add a day if you want to continue to Dhanaulti or Rishikesh, which pair naturally with it.",
        faqs: [
            { q: "How far is it from Delhi?", a: "Around 280 km, six to seven hours by road, or a train to Dehradun and an hour's drive up. It is one of the most practical hill stations for a short break from Delhi." },
            { q: "Does it snow?", a: "Occasionally, usually in late December and January, and rarely enough to settle for long. If snow is the main aim, Auli or Dhanaulti are more reliable." },
            { q: "Is Landour worth staying in rather than Mussoorie?", a: "If you want quiet, yes. Landour is a cantonment a few hundred metres higher, with far less traffic and a handful of cafés and bakeries. Mussoorie itself is busier and more convenient for shops and restaurants." },
            { q: "Is it crowded?", a: "Very, during May, June and long weekends — the mall road can be shoulder to shoulder. Visiting midweek or outside the summer rush makes a large difference." },
        ],
    },
    "nainital-rishikesh": {
        intro: [
            "Nainital and Rishikesh sit at opposite ends of Uttarakhand and offer two different trips — a lake town in the Kumaon hills, and a river town at the point where the Ganga leaves the mountains.",
            "Together they make a varied week: boating and ridge walks around Naini lake, then rafting, yoga and the evening Ganga Aarti at Triveni Ghat.",
        ],
        bestTime: [
            "March to June suits both — Nainital is cool when the plains are not, and the Ganga at Rishikesh is at a good level for rafting. September to November is the other strong window, with clear Himalayan views from the Nainital ridges after the rains.",
            "Rafting generally runs from late September to June and stops during the monsoon. December to February is cold and quiet, with occasional snow at Nainital and a very subdued Rishikesh.",
        ],
        thingsToDo: [
            { title: "Naini Lake", blurb: "Boating under the ridge, and the Naina Devi temple on the northern shore." },
            { title: "Snow View and Tiffin Top", blurb: "Ropeway or pony up to viewpoints looking towards Nanda Devi and Trishul." },
            { title: "White-water rafting", blurb: "Grade II–III runs on the Ganga from Shivpuri or Marine Drive down to Rishikesh." },
            { title: "Ganga Aarti at Triveni Ghat", blurb: "Lamps and chanting at dusk on the river's edge." },
            { title: "Lakshman Jhula and Ram Jhula", blurb: "Suspension bridges over the Ganga, with ashrams and cafés on both banks." },
            { title: "Jim Corbett", blurb: "The national park is around two hours from Nainital and is often added as a safari extension." },
        ],
        daysNeeded: "Six to seven days to do both properly, including the drive between them. Three days at each is enough; less and one of the two becomes a stopover rather than a stay.",
        faqs: [
            { q: "How far apart are they?", a: "Around 280 km, seven to eight hours by road. Most itineraries break the journey or use Haridwar as the link, since it sits between the two and has the better rail connections." },
            { q: "Is rafting safe for first-timers?", a: "Yes, on the standard Grade II–III stretches with a licensed operator, life jackets and a guide in every raft. Minimum ages apply and the river is closed during the monsoon." },
            { q: "Is alcohol available in Rishikesh?", a: "No. Rishikesh and Haridwar are both vegetarian and alcohol-free by local rule. Nainital has no such restriction." },
            { q: "Can we add Mussoorie or Jim Corbett?", a: "Both work well. Mussoorie is around two hours from Rishikesh, and Corbett is a short detour from Nainital. Tell us which and we will build it into the route." },
        ],
    },
}

// Lake data for FisherMN
const LAKES_DATA = {
  'upper-red-lake': {
    id: 'upper-red-lake',
    name: 'Upper Red Lake',
    region: 'Northern Minnesota',
    lat: 48.0635,
    lon: -94.8797,
    condition: 'excellent',
    thickness: 14,
    reports: 12,
    lastReport: '2 days ago',
    description: 'Upper Red Lake is one of Minnesota\'s premier walleye fisheries. The lake spans over 107,000 acres and offers excellent ice fishing opportunities throughout the winter season.',
    weather: {
      temp: 12,
      feelsLike: -5,
      wind: { speed: 8, direction: 'NW' },
      conditions: 'Partly Cloudy',
      forecast: [
        { day: 'Sat', high: 15, low: 2, icon: 'snow' },
        { day: 'Sun', high: 18, low: 5, icon: 'cloudy' },
        { day: 'Mon', high: 22, low: 8, icon: 'sunny' }
      ]
    },
    pois: [
      { name: 'Red Lake Bait & Tackle', type: 'bait', lat: 48.0712, lon: -94.8654, address: '123 Lakeshore Dr' },
      { name: 'Shoreline Sports', type: 'bait', lat: 48.0589, lon: -94.8901, address: '456 Main St' },
      { name: 'Rocky Reef Bar', type: 'bar', lat: 48.0698, lon: -94.8723, address: '789 Harbor Rd' },
      { name: 'The Ice Shack Pub', type: 'bar', lat: 48.0621, lon: -94.8812, address: '321 Lake Ave' },
      { name: 'Walleye Willies', type: 'bar', lat: 48.0545, lon: -94.8678, address: '555 Fish St' },
      { name: 'Ponemah Public Access', type: 'launch', lat: 48.0401, lon: -94.9012, address: 'Ponemah Point Rd' },
      { name: 'Washkish Landing', type: 'launch', lat: 48.0823, lon: -94.8534, address: 'Washkish Bay' },
      { name: 'Red Lake Lodge', type: 'lodging', lat: 48.0678, lon: -94.8789, address: '100 Lodge Lane' },
      { name: 'Northwind Resort', type: 'lodging', lat: 48.0534, lon: -94.8923, address: '200 Resort Dr' },
      { name: 'Lakeside Fish Houses', type: 'fishhouse', lat: 48.0612, lon: -94.8756, address: '150 Rental Rd' }
    ],
    recentReports: [
      { user: 'IceMaster99', text: 'Great day on the ice! Pulled 8 walleye, biggest was 24 inches.', date: '2 days ago' },
      { user: 'MNFisher', text: 'Ice is solid at 14 inches. Roads are in good shape.', date: '3 days ago' },
      { user: 'WalleyeKing', text: 'Slow morning but picked up in the afternoon. Try the north end.', date: '5 days ago' }
    ],
    activity: [
      { id: 1, user: 'IceMaster99', type: 'catch', content: 'Just pulled a 28" walleye from the north end! Ice is solid at 14". Beautiful day out here.', timestamp: '2 hours ago', likes: 24, comments: 8 },
      { id: 2, user: 'MNFisher', type: 'ice', content: 'Heads up everyone - found some slush near the south bay access. Recommend staying on the marked roads for now.', timestamp: '5 hours ago', likes: 18, comments: 5 },
      { id: 3, user: 'WalleyeKing', type: 'hotspot', content: 'Pro tip: The mud flats on the northeast corner are producing. 18-22 feet, jigging Rapalas tipped with minnow heads.', timestamp: '8 hours ago', likes: 32, comments: 12 },
      { id: 4, user: 'RedLakeRegular', type: 'photo', content: 'Nothing beats sunrise on Upper Red. Another perfect morning on the ice!', timestamp: '1 day ago', likes: 45, comments: 6 },
      { id: 5, user: 'FishingFred', type: 'catch', content: 'Perch bite was insane today! Lost count after 40. Kids had a blast.', timestamp: '1 day ago', likes: 28, comments: 4 },
      { id: 6, user: 'NorthernAngler', type: 'general', content: 'Anyone else heading out tomorrow morning? Looking to meet up around Ponemah access.', timestamp: '2 days ago', likes: 8, comments: 15 },
      { id: 7, user: 'IceRoadTrucker', type: 'ice', content: 'Ice roads are in great shape. Plowed all the way to the north reef. Truck traffic no problem.', timestamp: '2 days ago', likes: 52, comments: 3 }
    ],
    discussions: [
      {
        id: 1,
        title: 'Best spots for walleye this week?',
        author: 'WalleyeKing',
        createdAt: 'Dec 4, 2024',
        pinned: true,
        replyCount: 12,
        lastReplyAt: '2 hours ago',
        posts: [
          { id: 1, author: 'WalleyeKing', content: 'Hey everyone, heading out this weekend. Where are the walleye biting? Heard the north end is good but looking for more specific spots. Any tips appreciated!', timestamp: 'Dec 4', isOP: true },
          { id: 2, author: 'LocalAngler', content: 'Try the mud flats in 18-22 feet. Been hot all week. Jigging Rapalas working great.', timestamp: '1 day ago', isOP: false },
          { id: 3, author: 'IcePro99', content: 'Second the mud flats. Also check the drop-off near the sunken island. Best action at dawn and dusk.', timestamp: '12 hours ago', isOP: false },
          { id: 4, author: 'RedLakeVet', content: 'North reef has been producing too. 24-28 feet. Try gold/orange colors.', timestamp: '6 hours ago', isOP: false },
          { id: 5, author: 'WalleyeKing', content: 'Thanks everyone! Heading to the mud flats first thing tomorrow. Will report back!', timestamp: '2 hours ago', isOP: true }
        ]
      },
      {
        id: 2,
        title: 'Ice road conditions - December 2024',
        author: 'IceRoadTrucker',
        createdAt: 'Dec 1, 2024',
        pinned: true,
        replyCount: 8,
        lastReplyAt: '5 hours ago',
        posts: [
          { id: 1, author: 'IceRoadTrucker', content: 'Starting this thread to track ice road conditions this season. Currently plowed to the north reef. Ice is 14" in most areas.', timestamp: 'Dec 1', isOP: true },
          { id: 2, author: 'SafetyFirst', content: 'Thanks for this! Saw some ATVs out by Ponemah. Any word on that area?', timestamp: 'Dec 2', isOP: false },
          { id: 3, author: 'IceRoadTrucker', content: 'Ponemah access is open. Roads plowed. Watch for pressure ridge about 2 miles out.', timestamp: 'Dec 3', isOP: true },
          { id: 4, author: 'TruckFisher', content: 'Just drove out. Roads in excellent shape. Full-size truck no problem.', timestamp: '5 hours ago', isOP: false }
        ]
      },
      {
        id: 3,
        title: 'Recommended fish houses to rent?',
        author: 'NewToIceFishing',
        createdAt: 'Nov 28, 2024',
        pinned: false,
        replyCount: 15,
        lastReplyAt: '1 day ago',
        posts: [
          { id: 1, author: 'NewToIceFishing', content: 'First time ice fishing Upper Red. Looking for a good fish house rental. Any recommendations? Prefer heated with bathroom.', timestamp: 'Nov 28', isOP: true },
          { id: 2, author: 'FishHouseFan', content: 'Lakeside Fish Houses is great. Clean, heated, good locations. Book early though!', timestamp: 'Nov 28', isOP: false },
          { id: 3, author: 'RedLakeRegular', content: 'Red Lake Lodge also rents. A bit pricier but really nice setups.', timestamp: 'Nov 29', isOP: false },
          { id: 4, author: 'BudgetAngler', content: 'If you want to save money, bring your own portable. Plenty of access points.', timestamp: '1 day ago', isOP: false }
        ]
      },
      {
        id: 4,
        title: 'Perch vs Walleye - which are you targeting?',
        author: 'PerchPro',
        createdAt: 'Dec 2, 2024',
        pinned: false,
        replyCount: 6,
        lastReplyAt: '2 days ago',
        posts: [
          { id: 1, author: 'PerchPro', content: 'Curious what everyone is mainly going for this year. Perch numbers seem up but walleye is always king. What\'s your focus?', timestamp: 'Dec 2', isOP: true },
          { id: 2, author: 'WalleyeOrBust', content: 'Walleye all day. That\'s why we come to Red Lake!', timestamp: 'Dec 2', isOP: false },
          { id: 3, author: 'PanfishFan', content: 'Perch for eating, walleye for bragging rights. Why not both?', timestamp: 'Dec 3', isOP: false },
          { id: 4, author: 'PerchPro', content: 'Good point! Been catching more perch than walleye lately but the walleye are bigger.', timestamp: '2 days ago', isOP: true }
        ]
      },
      {
        id: 5,
        title: 'Best bait shop in the area?',
        author: 'BaitBuyer',
        createdAt: 'Nov 25, 2024',
        pinned: false,
        replyCount: 9,
        lastReplyAt: '4 days ago',
        posts: [
          { id: 1, author: 'BaitBuyer', content: 'Which bait shop do you guys prefer? Looking for quality minnows and good service.', timestamp: 'Nov 25', isOP: true },
          { id: 2, author: 'LocalFisher', content: 'Red Lake Bait & Tackle. Been going there for years. Always have fresh bait.', timestamp: 'Nov 25', isOP: false },
          { id: 3, author: 'ShorelineShopper', content: 'Shoreline Sports is good too. Better selection of tackle.', timestamp: 'Nov 26', isOP: false },
          { id: 4, author: 'BaitBuyer', content: 'Thanks! Will check out Red Lake Bait first since it\'s closest to where I\'m fishing.', timestamp: '4 days ago', isOP: true }
        ]
      }
    ]
  },
  'lake-of-the-woods': {
    id: 'lake-of-the-woods',
    name: 'Lake of the Woods',
    region: 'Northern Minnesota',
    lat: 49.0,
    lon: -94.6,
    condition: 'excellent',
    thickness: 16,
    reports: 18,
    lastReport: '1 day ago',
    description: 'Lake of the Woods is a massive lake straddling the US-Canada border. Known for world-class walleye and sauger fishing, it\'s a bucket-list destination for ice anglers.',
    weather: {
      temp: 8,
      feelsLike: -10,
      wind: { speed: 12, direction: 'N' },
      conditions: 'Light Snow',
      forecast: [
        { day: 'Sat', high: 10, low: -5, icon: 'snow' },
        { day: 'Sun', high: 12, low: -2, icon: 'snow' },
        { day: 'Mon', high: 15, low: 0, icon: 'cloudy' }
      ]
    },
    pois: [
      { name: 'Border Bait Co', type: 'bait', lat: 49.0123, lon: -94.5876, address: '100 Border Rd' },
      { name: 'Arnesen\'s Tackle', type: 'bait', lat: 48.9956, lon: -94.6123, address: '250 Hwy 11' },
      { name: 'The Freeze Bar', type: 'bar', lat: 49.0078, lon: -94.5934, address: '500 Main St, Baudette' },
      { name: 'Walleye Inn', type: 'bar', lat: 48.9912, lon: -94.6201, address: '300 Lake Ave' },
      { name: 'Border Bar & Grill', type: 'bar', lat: 49.0156, lon: -94.5812, address: '150 1st Ave' },
      { name: 'Sportsman\'s Casino', type: 'casino', lat: 49.0034, lon: -94.5989, address: '700 Casino Dr' },
      { name: 'Rocky Point Access', type: 'launch', lat: 49.0234, lon: -94.5678, address: 'Rocky Point Rd' },
      { name: 'Baudette Bay Launch', type: 'launch', lat: 48.9845, lon: -94.6345, address: 'Bay Access Rd' },
      { name: 'Baudette Lodge', type: 'lodging', lat: 49.0089, lon: -94.5923, address: '450 Lodge Way' },
      { name: 'Woods Edge Resort', type: 'lodging', lat: 48.9978, lon: -94.6078, address: '600 Resort Lane' },
      { name: 'LOW Fish House Rentals', type: 'fishhouse', lat: 49.0145, lon: -94.5856, address: '125 Rental Row' },
      { name: 'Border Gas & Convenience', type: 'gas', lat: 49.0067, lon: -94.5901, address: '50 Hwy 11' }
    ],
    recentReports: [
      { user: 'BorderAngler', text: 'Incredible day! Limits before noon. 16 inches of solid ice.', date: '1 day ago' },
      { user: 'LOWFisher', text: 'Sauger bite was hot. Try jigging spoons tipped with minnow heads.', date: '2 days ago' },
      { user: 'WinterWarrior', text: 'Roads plowed and in great shape. Fish houses everywhere!', date: '4 days ago' }
    ],
    activity: [
      { id: 1, user: 'BorderAngler', type: 'catch', content: 'Limits before noon! 16" of solid ice and the walleye are hungry. Best day of the season so far.', timestamp: '1 day ago', likes: 67, comments: 14 },
      { id: 2, user: 'SaugerSlayer', type: 'catch', content: 'Sauger are absolutely crushing it. 30+ fish day. Try jigging spoons with minnow heads in 28-32 feet.', timestamp: '2 days ago', likes: 43, comments: 8 },
      { id: 3, user: 'LOWFisher', type: 'ice', content: 'Ice report: 16 inches across the main basin. Plowed roads to all major spots. Safe for trucks.', timestamp: '2 days ago', likes: 89, comments: 6 },
      { id: 4, user: 'CanadaBound', type: 'general', content: 'Crossing into Canadian waters this weekend. Anyone know if the border checkpoint is staffed?', timestamp: '3 days ago', likes: 12, comments: 22 },
      { id: 5, user: 'WinterWarrior', type: 'hotspot', content: 'Long Point has been producing big walleye. 22-26 feet on the break. Morning bite best.', timestamp: '3 days ago', likes: 55, comments: 9 },
      { id: 6, user: 'FishHouseKing', type: 'photo', content: 'Our setup for the week! LOW never disappoints. Fish house city out here!', timestamp: '4 days ago', likes: 78, comments: 11 }
    ],
    discussions: [
      {
        id: 1,
        title: 'Sauger vs Walleye - techniques that work',
        author: 'SaugerSlayer',
        createdAt: 'Dec 3, 2024',
        pinned: true,
        replyCount: 18,
        lastReplyAt: '6 hours ago',
        posts: [
          { id: 1, author: 'SaugerSlayer', content: 'Sauger bite has been incredible. What\'s everyone using? I\'ve had luck with small jigging spoons tipped with minnow heads.', timestamp: 'Dec 3', isOP: true },
          { id: 2, author: 'LOWVet', content: 'Same here. Gold/glow works best in low light. Don\'t forget the subtle jigging - sauger like it slow.', timestamp: 'Dec 3', isOP: false },
          { id: 3, author: 'WalleyeWanter', content: 'Any tips for targeting walleye specifically? Sauger are fun but want some bigger fish.', timestamp: 'Dec 4', isOP: false },
          { id: 4, author: 'SaugerSlayer', content: 'For walleye, go bigger - 1/4 oz jigs, bigger minnows. Find the 22-28 foot breaks.', timestamp: '6 hours ago', isOP: true }
        ]
      },
      {
        id: 2,
        title: 'Best resorts/lodging for ice fishing?',
        author: 'FirstTimeLOW',
        createdAt: 'Nov 30, 2024',
        pinned: false,
        replyCount: 11,
        lastReplyAt: '1 day ago',
        posts: [
          { id: 1, author: 'FirstTimeLOW', content: 'Planning my first trip to LOW. Looking for a resort that caters to ice fishermen. Full service preferred.', timestamp: 'Nov 30', isOP: true },
          { id: 2, author: 'BorderBum', content: 'Baudette Lodge is solid. Good food, heated parking, can arrange fish house rentals.', timestamp: 'Nov 30', isOP: false },
          { id: 3, author: 'WoodsEdgeFan', content: 'Woods Edge Resort treats fishermen right. Been going 10 years.', timestamp: 'Dec 1', isOP: false }
        ]
      },
      {
        id: 3,
        title: 'Casino trip + fishing weekend',
        author: 'LuckAndLures',
        createdAt: 'Dec 1, 2024',
        pinned: false,
        replyCount: 7,
        lastReplyAt: '3 days ago',
        posts: [
          { id: 1, author: 'LuckAndLures', content: 'Anyone combine a casino night with fishing? Sportsman\'s Casino any good?', timestamp: 'Dec 1', isOP: true },
          { id: 2, author: 'SlotsFisher', content: 'Great combo! Fish all day, hit the tables at night. Casino has decent food too.', timestamp: 'Dec 2', isOP: false },
          { id: 3, author: 'LuckAndLures', content: 'Perfect! Booking now. Wife approved since there\'s something for her too.', timestamp: '3 days ago', isOP: true }
        ]
      },
      {
        id: 4,
        title: 'Border crossing for fishing - requirements?',
        author: 'CanadaBound',
        createdAt: 'Nov 28, 2024',
        pinned: false,
        replyCount: 14,
        lastReplyAt: '2 days ago',
        posts: [
          { id: 1, author: 'CanadaBound', content: 'Want to fish the Canadian side. What do I need? Passport? Fishing license? Any restrictions?', timestamp: 'Nov 28', isOP: true },
          { id: 2, author: 'BorderPro', content: 'Passport required. Need Ontario fishing license for Canadian waters. Easy to get online.', timestamp: 'Nov 28', isOP: false },
          { id: 3, author: 'CustomsClearance', content: 'Declare all your gear. They check sometimes. No live bait across the border!', timestamp: 'Nov 29', isOP: false }
        ]
      },
      {
        id: 5,
        title: 'Ice thickness reports - update thread',
        author: 'SafetySteve',
        createdAt: 'Nov 25, 2024',
        pinned: true,
        replyCount: 22,
        lastReplyAt: '8 hours ago',
        posts: [
          { id: 1, author: 'SafetySteve', content: 'Let\'s keep track of ice conditions throughout the season. Post your measurements here!', timestamp: 'Nov 25', isOP: true },
          { id: 2, author: 'LOWFisher', content: 'Dec 5: Main basin 16 inches. Excellent quality clear ice.', timestamp: '8 hours ago', isOP: false },
          { id: 3, author: 'BorderAngler', content: 'Rocky Point area - 15 inches solid. Truck traffic all day.', timestamp: '1 day ago', isOP: false }
        ]
      }
    ]
  },
  'mille-lacs': {
    id: 'mille-lacs',
    name: 'Mille Lacs Lake',
    region: 'Central Minnesota',
    lat: 46.2633,
    lon: -93.6578,
    condition: 'good',
    thickness: 10,
    reports: 24,
    lastReport: '6 hours ago',
    description: 'Mille Lacs is Minnesota\'s second-largest lake and one of the most popular ice fishing destinations in the state. Famous for walleye, perch, and northern pike.',
    weather: {
      temp: 18,
      feelsLike: 5,
      wind: { speed: 10, direction: 'W' },
      conditions: 'Cloudy',
      forecast: [
        { day: 'Sat', high: 20, low: 8, icon: 'cloudy' },
        { day: 'Sun', high: 25, low: 12, icon: 'sunny' },
        { day: 'Mon', high: 22, low: 10, icon: 'cloudy' }
      ]
    },
    pois: [
      { name: 'Mille Lacs Bait', type: 'bait', lat: 46.2712, lon: -93.6654, address: '1000 Hwy 169' },
      { name: 'Mac\'s Twin Bay', type: 'bait', lat: 46.2589, lon: -93.6801, address: '7568 US-169' },
      { name: 'Nitti\'s Hunters Point', type: 'bait', lat: 46.2456, lon: -93.6912, address: '5765 Hwy 169' },
      { name: 'Twin Pines Bar', type: 'bar', lat: 46.2698, lon: -93.6623, address: '8521 US-169' },
      { name: 'Eddy\'s Resort Bar', type: 'bar', lat: 46.2621, lon: -93.6712, address: '7632 Hwy 169' },
      { name: 'The Blue Goose', type: 'bar', lat: 46.2545, lon: -93.6578, address: '6200 Lake Shore Dr' },
      { name: 'Izzy\'s Lounge', type: 'bar', lat: 46.2478, lon: -93.7012, address: '5890 US-169' },
      { name: 'Grand Casino Mille Lacs', type: 'casino', lat: 46.2734, lon: -93.6489, address: '777 Grand Ave' },
      { name: 'Garrison Public Access', type: 'launch', lat: 46.2856, lon: -93.6345, address: 'Main St, Garrison' },
      { name: 'Cove Bay Access', type: 'launch', lat: 46.2401, lon: -93.7123, address: 'Cove Bay Rd' },
      { name: 'Malmo Access', type: 'launch', lat: 46.2978, lon: -93.6201, address: 'Malmo Loop' },
      { name: 'McQuoid\'s Inn', type: 'lodging', lat: 46.2623, lon: -93.6756, address: '7234 Hwy 169' },
      { name: 'Izatys Resort', type: 'lodging', lat: 46.2534, lon: -93.6923, address: '5820 Izatys Dr' },
      { name: 'Grand Casino Hotel', type: 'lodging', lat: 46.2745, lon: -93.6478, address: '777 Grand Ave' },
      { name: 'Barnacle Bill\'s Fish Houses', type: 'fishhouse', lat: 46.2612, lon: -93.6656, address: '7100 Hwy 169' },
      { name: 'Reed\'s Sporting Goods', type: 'fishhouse', lat: 46.2578, lon: -93.6789, address: '6850 US-169' },
      { name: 'Garrison Shell', type: 'gas', lat: 46.2867, lon: -93.6312, address: 'Main St, Garrison' }
    ],
    recentReports: [
      { user: 'MilleLacsLocal', text: 'Perch bite is on fire! 50+ fish day, all nice size.', date: '6 hours ago' },
      { user: 'WalleyeWonder', text: 'Ice is at 10 inches. Be careful in the mud flats area.', date: '1 day ago' },
      { user: 'IceProMN', text: 'Walleye slow but persistent. Dawn and dusk best.', date: '2 days ago' }
    ],
    activity: [
      { id: 1, user: 'MilleLacsLocal', type: 'catch', content: 'Perch bite is ON FIRE! 50+ fish day, all nice eating size. Best perch fishing in years!', timestamp: '6 hours ago', likes: 89, comments: 23 },
      { id: 2, user: 'WalleyeWonder', type: 'ice', content: 'Ice update: 10 inches in most areas but be careful in the mud flats - found some thin spots.', timestamp: '1 day ago', likes: 45, comments: 12 },
      { id: 3, user: 'GrandCasinoFan', type: 'general', content: 'Casino + fishing weekend = perfection. Slots paid out then the walleye cooperated!', timestamp: '1 day ago', likes: 34, comments: 7 },
      { id: 4, user: 'IceProMN', type: 'hotspot', content: 'Walleye are staging on the 18-24 foot break north of Garrison. Dawn and dusk windows are key.', timestamp: '2 days ago', likes: 67, comments: 15 },
      { id: 5, user: 'PerchPatrol', type: 'catch', content: 'Jumbo perch in 28 feet near the sunken island. Using small tungsten jigs with waxies.', timestamp: '2 days ago', likes: 52, comments: 9 },
      { id: 6, user: 'FamilyFisher', type: 'photo', content: 'Kids\' first ice fishing trip! Mille Lacs delivered - smiles all around!', timestamp: '3 days ago', likes: 123, comments: 18 },
      { id: 7, user: 'NightBiteFisher', type: 'hotspot', content: 'Night bite has been insane. 8pm-midnight producing the biggest walleye. Glow jigs a must.', timestamp: '3 days ago', likes: 78, comments: 11 }
    ],
    discussions: [
      {
        id: 1,
        title: 'Perch locations this week',
        author: 'PerchPatrol',
        createdAt: 'Dec 4, 2024',
        pinned: true,
        replyCount: 24,
        lastReplyAt: '3 hours ago',
        posts: [
          { id: 1, author: 'PerchPatrol', content: 'Perch bite is incredible right now. Let\'s share spots. I\'m finding them in 26-30 feet near structure.', timestamp: 'Dec 4', isOP: true },
          { id: 2, author: 'JumboPursuer', content: 'Mud flats are loaded. 28 feet has been magic. Small jigs with spikes.', timestamp: 'Dec 4', isOP: false },
          { id: 3, author: 'MilleLacsVet', content: 'Sunken island area producing jumbos. Worth the drive from Garrison access.', timestamp: 'Dec 5', isOP: false },
          { id: 4, author: 'PerchPatrol', content: 'Great tips! Heading to the mud flats tomorrow. Will update.', timestamp: '3 hours ago', isOP: true }
        ]
      },
      {
        id: 2,
        title: 'Walleye slot limits - what to keep?',
        author: 'RegulationRick',
        createdAt: 'Dec 1, 2024',
        pinned: true,
        replyCount: 16,
        lastReplyAt: '1 day ago',
        posts: [
          { id: 1, author: 'RegulationRick', content: 'Reminder about Mille Lacs slot limits. One fish over 28" allowed. Let\'s protect the fishery!', timestamp: 'Dec 1', isOP: true },
          { id: 2, author: 'ConservationCarl', content: 'Thanks for posting. Too many people don\'t know the rules. Check the DNR site for current regs.', timestamp: 'Dec 1', isOP: false },
          { id: 3, author: 'LegalKeeper', content: 'Kept my one big fish yesterday - 29". Released several slot fish. Do your part!', timestamp: '1 day ago', isOP: false }
        ]
      },
      {
        id: 3,
        title: 'Best fish house rentals around Garrison?',
        author: 'GarrisonGuest',
        createdAt: 'Nov 29, 2024',
        pinned: false,
        replyCount: 13,
        lastReplyAt: '2 days ago',
        posts: [
          { id: 1, author: 'GarrisonGuest', content: 'Looking for wheelhouse rental near Garrison. 4-6 people, need heat and bunks. Recommendations?', timestamp: 'Nov 29', isOP: true },
          { id: 2, author: 'BarnacleCustomer', content: 'Barnacle Bill\'s is the go-to. Great locations, clean houses, good service.', timestamp: 'Nov 29', isOP: false },
          { id: 3, author: 'ReedsFan', content: 'Reed\'s Sporting Goods also rents. Slightly cheaper but still quality.', timestamp: 'Nov 30', isOP: false }
        ]
      },
      {
        id: 4,
        title: 'Night fishing - worth it?',
        author: 'NightOwlAngler',
        createdAt: 'Dec 2, 2024',
        pinned: false,
        replyCount: 19,
        lastReplyAt: '12 hours ago',
        posts: [
          { id: 1, author: 'NightOwlAngler', content: 'Heard the night bite is hot. Is it worth staying out late? What time does it pick up?', timestamp: 'Dec 2', isOP: true },
          { id: 2, author: 'MidnightFisher', content: 'Absolutely worth it. 8pm-midnight is prime time. Bring glow jigs and dress warm!', timestamp: 'Dec 2', isOP: false },
          { id: 3, author: 'NightBiteFisher', content: 'Best walleye of my life came at 10:30pm last week. 27 inches. Don\'t miss out!', timestamp: '12 hours ago', isOP: false }
        ]
      },
      {
        id: 5,
        title: 'Grand Casino package deals?',
        author: 'CasinoCombo',
        createdAt: 'Nov 27, 2024',
        pinned: false,
        replyCount: 8,
        lastReplyAt: '4 days ago',
        posts: [
          { id: 1, author: 'CasinoCombo', content: 'Does Grand Casino offer any fishing packages? Hotel + fish house combo would be perfect.', timestamp: 'Nov 27', isOP: true },
          { id: 2, author: 'GrandRegular', content: 'They have partnership with some resorts. Call the hotel directly - ask about fishing packages.', timestamp: 'Nov 28', isOP: false },
          { id: 3, author: 'PackageDeal', content: 'Got one last year. Room + 2 nights fish house. Worth calling ahead.', timestamp: '4 days ago', isOP: false }
        ]
      }
    ]
  },
  'leech-lake': {
    id: 'leech-lake',
    name: 'Leech Lake',
    region: 'North Central Minnesota',
    lat: 47.2158,
    lon: -94.4194,
    condition: 'excellent',
    thickness: 13,
    reports: 15,
    lastReport: '1 day ago',
    description: 'Leech Lake is Minnesota\'s third-largest lake, offering outstanding fishing for walleye, perch, and muskie. The Walker area provides excellent amenities for ice anglers.',
    weather: {
      temp: 10,
      feelsLike: -2,
      wind: { speed: 8, direction: 'NW' },
      conditions: 'Partly Cloudy',
      forecast: [
        { day: 'Sat', high: 14, low: 0, icon: 'cloudy' },
        { day: 'Sun', high: 18, low: 4, icon: 'sunny' },
        { day: 'Mon', high: 20, low: 6, icon: 'sunny' }
      ]
    },
    pois: [
      { name: 'Reed\'s Family Outdoor', type: 'bait', lat: 47.1012, lon: -94.5876, address: '606 Minnesota Ave, Walker' },
      { name: 'Leech Lake Bait', type: 'bait', lat: 47.2089, lon: -94.4123, address: 'Federal Dam Rd' },
      { name: 'Teal\'s Market', type: 'bait', lat: 47.2234, lon: -94.4312, address: '7600 State Hwy 371' },
      { name: 'The 502 Bar', type: 'bar', lat: 47.1034, lon: -94.5901, address: '502 Minnesota Ave, Walker' },
      { name: 'Chase on the Lake', type: 'bar', lat: 47.1056, lon: -94.5834, address: '500 Cleveland Blvd' },
      { name: 'Lucky Moose Bar', type: 'bar', lat: 47.2178, lon: -94.4234, address: 'Federal Dam' },
      { name: 'Northern Lights Casino', type: 'casino', lat: 47.1089, lon: -94.5912, address: '6800 Y Frontage Rd NW' },
      { name: 'Walker City Dock', type: 'launch', lat: 47.1001, lon: -94.5823, address: 'Front St, Walker' },
      { name: 'Federal Dam Access', type: 'launch', lat: 47.2256, lon: -94.4189, address: 'Federal Dam' },
      { name: 'Stony Point Access', type: 'launch', lat: 47.1923, lon: -94.4534, address: 'Stony Point Rd' },
      { name: 'Chase on the Lake Hotel', type: 'lodging', lat: 47.1067, lon: -94.5845, address: '500 Cleveland Blvd' },
      { name: 'Northern Lights Hotel', type: 'lodging', lat: 47.1078, lon: -94.5923, address: '6800 Y Frontage Rd' },
      { name: 'Anderson\'s Fish Houses', type: 'fishhouse', lat: 47.1123, lon: -94.5789, address: 'Walker Bay' },
      { name: 'Holiday Gas', type: 'gas', lat: 47.1045, lon: -94.5878, address: 'Hwy 371, Walker' }
    ],
    recentReports: [
      { user: 'LeechLakeLarry', text: 'Found \'em in 22 feet. Caught limits by 2pm.', date: '1 day ago' },
      { user: 'WalkerAngler', text: 'Ice is beautiful! 13 inches of clear ice.', date: '2 days ago' },
      { user: 'NorthernPike99', text: 'Big pike are cruising. Tip-ups with suckers working great.', date: '3 days ago' }
    ],
    activity: [
      { id: 1, user: 'LeechLakeLarry', type: 'catch', content: 'Found the walleye in 22 feet today. Caught limits by 2pm! Agency Bay is producing.', timestamp: '1 day ago', likes: 56, comments: 12 },
      { id: 2, user: 'WalkerAngler', type: 'ice', content: 'Ice conditions update: 13 inches of beautiful clear ice. Walker Bay and Agency Bay both safe for trucks.', timestamp: '2 days ago', likes: 72, comments: 8 },
      { id: 3, user: 'NorthernPike99', type: 'catch', content: 'Big pike are cruising! Set up 6 tip-ups with suckers and landed 4 pike, biggest was 38 inches!', timestamp: '3 days ago', likes: 89, comments: 15 },
      { id: 4, user: 'ChaseGuest', type: 'general', content: 'Chase on the Lake is treating us right. Great bar, great fishing, great time!', timestamp: '3 days ago', likes: 34, comments: 6 },
      { id: 5, user: 'WalkerLocal', type: 'hotspot', content: 'Federal Dam area is hot. 18-24 feet on the main lake break. Gold jigs in the morning.', timestamp: '4 days ago', likes: 61, comments: 9 },
      { id: 6, user: 'CasinoFisher', type: 'photo', content: 'Northern Lights Casino then early morning fishing. This is the life!', timestamp: '4 days ago', likes: 45, comments: 7 }
    ],
    discussions: [
      {
        id: 1,
        title: 'Walker Bay vs Agency Bay - where to fish?',
        author: 'BayDebater',
        createdAt: 'Dec 3, 2024',
        pinned: true,
        replyCount: 21,
        lastReplyAt: '4 hours ago',
        posts: [
          { id: 1, author: 'BayDebater', content: 'First time on Leech Lake. Should I focus on Walker Bay or Agency Bay? Targeting walleye primarily.', timestamp: 'Dec 3', isOP: true },
          { id: 2, author: 'LeechLakeLarry', content: 'Agency Bay has been hot lately. More structure, more fish. Walker Bay is easier access though.', timestamp: 'Dec 3', isOP: false },
          { id: 3, author: 'LocalGuide', content: 'Both produce. Walker Bay in morning, Agency Bay afternoon. Fish move around.', timestamp: 'Dec 4', isOP: false },
          { id: 4, author: 'BayDebater', content: 'Thanks! Starting at Walker since I\'m staying at Chase, then maybe venture to Agency later.', timestamp: '4 hours ago', isOP: true }
        ]
      },
      {
        id: 2,
        title: 'Northern pike tips - tackle and technique',
        author: 'PikeHunter',
        createdAt: 'Dec 1, 2024',
        pinned: false,
        replyCount: 17,
        lastReplyAt: '1 day ago',
        posts: [
          { id: 1, author: 'PikeHunter', content: 'Leech Lake has monster pike. What\'s everyone using? Tip-ups? Quick-strikes? Bait size?', timestamp: 'Dec 1', isOP: true },
          { id: 2, author: 'NorthernPike99', content: 'Large suckers on quick-strike rigs under tip-ups. 8-12 foot depth along weed edges.', timestamp: 'Dec 1', isOP: false },
          { id: 3, author: 'DeadSticker', content: 'Dead smelt work great too. Pike love the smell. Just make sure your hooks are sharp!', timestamp: 'Dec 2', isOP: false },
          { id: 4, author: 'PikeHunter', content: 'Got a 36" today using your tips! Quick-strike with sucker. Thanks!', timestamp: '1 day ago', isOP: true }
        ]
      },
      {
        id: 3,
        title: 'Walker area lodging recommendations',
        author: 'WeekendWarrior',
        createdAt: 'Nov 30, 2024',
        pinned: false,
        replyCount: 11,
        lastReplyAt: '3 days ago',
        posts: [
          { id: 1, author: 'WeekendWarrior', content: 'Planning a long weekend. What\'s the best place to stay in Walker for ice fishing? Budget friendly preferred.', timestamp: 'Nov 30', isOP: true },
          { id: 2, author: 'ChaseRegular', content: 'Chase on the Lake is worth it. Not the cheapest but right on the lake with great amenities.', timestamp: 'Nov 30', isOP: false },
          { id: 3, author: 'BudgetFisher', content: 'Northern Lights Casino hotel has good rates. Free parking, can arrange fish house rentals.', timestamp: 'Dec 1', isOP: false }
        ]
      },
      {
        id: 4,
        title: 'Muskie through the ice - anyone tried?',
        author: 'MuskieManiac',
        createdAt: 'Dec 2, 2024',
        pinned: false,
        replyCount: 8,
        lastReplyAt: '2 days ago',
        posts: [
          { id: 1, author: 'MuskieManiac', content: 'Leech Lake has great muskies. Has anyone targeted them through the ice? Legal? Techniques?', timestamp: 'Dec 2', isOP: true },
          { id: 2, author: 'DNRKnower', content: 'Check regs - muskie season closes in some areas. Legal in others. Giant suckers on tip-ups.', timestamp: 'Dec 2', isOP: false },
          { id: 3, author: 'BigFishChaser', content: 'Caught one incidentally while pike fishing. 42 inches. Had to release - amazing fight through the ice!', timestamp: '2 days ago', isOP: false }
        ]
      },
      {
        id: 5,
        title: 'Best bait shop near Walker?',
        author: 'BaitSeeker',
        createdAt: 'Nov 28, 2024',
        pinned: false,
        replyCount: 9,
        lastReplyAt: '5 days ago',
        posts: [
          { id: 1, author: 'BaitSeeker', content: 'Need to stock up on minnows and suckers. What\'s the best shop near Walker?', timestamp: 'Nov 28', isOP: true },
          { id: 2, author: 'WalkerLocal', content: 'Reed\'s Family Outdoor is the spot. Great selection, friendly staff, good prices.', timestamp: 'Nov 28', isOP: false },
          { id: 3, author: 'TealsFan', content: 'Teal\'s Market on 371 also has bait. Convenient if you\'re coming from the south.', timestamp: '5 days ago', isOP: false }
        ]
      }
    ]
  },
  'winnibigoshish': {
    id: 'winnibigoshish',
    name: 'Lake Winnibigoshish',
    region: 'North Central Minnesota',
    lat: 47.4417,
    lon: -94.1575,
    condition: 'excellent',
    thickness: 15,
    reports: 8,
    lastReport: '3 days ago',
    description: 'Lake Winnibigoshish, known locally as "Big Winnie," is famous for its jumbo perch and excellent walleye fishing. The vast lake offers plenty of room to spread out.',
    weather: {
      temp: 6,
      feelsLike: -8,
      wind: { speed: 15, direction: 'N' },
      conditions: 'Clear',
      forecast: [
        { day: 'Sat', high: 10, low: -5, icon: 'sunny' },
        { day: 'Sun', high: 12, low: -2, icon: 'sunny' },
        { day: 'Mon', high: 15, low: 2, icon: 'cloudy' }
      ]
    },
    pois: [
      { name: 'Big Winnie Bait', type: 'bait', lat: 47.4312, lon: -94.1623, address: 'Hwy 2, Bena' },
      { name: 'Nodak Lodge Bait', type: 'bait', lat: 47.4489, lon: -94.1534, address: '51 Nodak Dr' },
      { name: 'The Dam Store', type: 'bait', lat: 47.4234, lon: -94.1789, address: 'Dam Rd' },
      { name: 'Nodak Lodge Bar', type: 'bar', lat: 47.4478, lon: -94.1545, address: '51 Nodak Dr' },
      { name: 'Denny\'s Resort Bar', type: 'bar', lat: 47.4389, lon: -94.1678, address: 'Winnie Shores' },
      { name: 'Bena Public Access', type: 'launch', lat: 47.4267, lon: -94.1712, address: 'Bena' },
      { name: 'Tamarack Point Access', type: 'launch', lat: 47.4567, lon: -94.1389, address: 'Tamarack Point Rd' },
      { name: 'Nodak Lodge', type: 'lodging', lat: 47.4501, lon: -94.1523, address: '51 Nodak Dr' },
      { name: 'Denny\'s Resort', type: 'lodging', lat: 47.4378, lon: -94.1689, address: 'Winnie Shores' },
      { name: 'Four Seasons Resort', type: 'lodging', lat: 47.4423, lon: -94.1601, address: 'Hwy 2' },
      { name: 'Winnie Fish Houses', type: 'fishhouse', lat: 47.4356, lon: -94.1634, address: 'Bena Bay' }
    ],
    recentReports: [
      { user: 'BigWinnieBob', text: 'Jumbo perch are stacked up in 28 feet. Best day of the year!', date: '3 days ago' },
      { user: 'PerchPro', text: '15 inches of ice. Truck traffic all over the lake.', date: '4 days ago' },
      { user: 'Fisherman_Mike', text: 'Slow walleye bite but perch made up for it.', date: '6 days ago' }
    ]
  },
  'vermilion': {
    id: 'vermilion',
    name: 'Lake Vermilion',
    region: 'Northern Minnesota',
    lat: 47.9356,
    lon: -92.3375,
    condition: 'good',
    thickness: 11,
    reports: 10,
    lastReport: '2 days ago',
    description: 'Lake Vermilion is one of Minnesota\'s most scenic lakes with over 40,000 acres and 365 islands. Known for excellent walleye, crappie, and smallmouth bass fishing.',
    weather: {
      temp: 5,
      feelsLike: -10,
      wind: { speed: 12, direction: 'NE' },
      conditions: 'Light Snow',
      forecast: [
        { day: 'Sat', high: 8, low: -8, icon: 'snow' },
        { day: 'Sun', high: 12, low: -4, icon: 'cloudy' },
        { day: 'Mon', high: 15, low: 0, icon: 'sunny' }
      ]
    },
    pois: [
      { name: 'Vermilion Sport & Bait', type: 'bait', lat: 47.9234, lon: -92.3456, address: 'Tower' },
      { name: 'Zup\'s Grocery & Bait', type: 'bait', lat: 47.9178, lon: -92.3534, address: 'Main St, Tower' },
      { name: 'Good Ol\' Days Bar', type: 'bar', lat: 47.9189, lon: -92.3501, address: 'Main St, Tower' },
      { name: 'D\'Erick\'s Tower Tap', type: 'bar', lat: 47.9201, lon: -92.3478, address: 'Tower' },
      { name: 'Fortune Bay Casino', type: 'casino', lat: 47.9389, lon: -92.3123, address: '1430 Bois Forte Rd' },
      { name: 'Tower Public Access', type: 'launch', lat: 47.9156, lon: -92.3589, address: 'Tower Harbor' },
      { name: 'Moccasin Point Access', type: 'launch', lat: 47.9456, lon: -92.3012, address: 'Moccasin Point Rd' },
      { name: 'Fortune Bay Resort', type: 'lodging', lat: 47.9378, lon: -92.3134, address: '1430 Bois Forte Rd' },
      { name: 'Vermilion Club', type: 'lodging', lat: 47.9267, lon: -92.3389, address: 'Hwy 169' },
      { name: 'Tyler\'s Fish Houses', type: 'fishhouse', lat: 47.9212, lon: -92.3467, address: 'Tower Bay' },
      { name: 'Tower Shell', type: 'gas', lat: 47.9167, lon: -92.3523, address: 'Hwy 169, Tower' }
    ],
    recentReports: [
      { user: 'VermilionVet', text: 'Crappies are hitting! Found them in 18-20 feet.', date: '2 days ago' },
      { user: 'TowerTom', text: 'Ice is 11 inches. Watch for pressure ridges near Pike Bay.', date: '3 days ago' },
      { user: 'NorthernMNFish', text: 'Beautiful day, decent walleye action at sunrise.', date: '5 days ago' }
    ]
  },
  'gull-lake': {
    id: 'gull-lake',
    name: 'Gull Lake',
    region: 'Brainerd Lakes',
    lat: 46.4069,
    lon: -94.3553,
    condition: 'fair',
    thickness: 8,
    reports: 6,
    lastReport: '4 days ago',
    description: 'Gull Lake is a popular destination in the Brainerd Lakes area. While smaller than some other lakes, it offers good fishing for walleye, northern pike, and panfish.',
    weather: {
      temp: 22,
      feelsLike: 12,
      wind: { speed: 6, direction: 'SW' },
      conditions: 'Sunny',
      forecast: [
        { day: 'Sat', high: 25, low: 10, icon: 'sunny' },
        { day: 'Sun', high: 28, low: 15, icon: 'sunny' },
        { day: 'Mon', high: 24, low: 12, icon: 'cloudy' }
      ]
    },
    pois: [
      { name: 'Gull Lake Bait', type: 'bait', lat: 46.4012, lon: -94.3601, address: 'Hwy 371, Nisswa' },
      { name: 'Nisswa Bait & Tackle', type: 'bait', lat: 46.3978, lon: -94.3534, address: 'Main St, Nisswa' },
      { name: 'Zorbaz on Gull', type: 'bar', lat: 46.4089, lon: -94.3578, address: '8105 Lost Lake Rd' },
      { name: 'The Goose', type: 'bar', lat: 46.3989, lon: -94.3612, address: 'Nisswa' },
      { name: 'Ernie\'s on Gull', type: 'bar', lat: 46.4034, lon: -94.3523, address: '10700 Squaw Point Rd' },
      { name: 'Grand Casino Mille Lacs', type: 'casino', lat: 46.2734, lon: -93.6489, address: '777 Grand Ave (30 min drive)' },
      { name: 'Gull Lake Dam Access', type: 'launch', lat: 46.4123, lon: -94.3478, address: 'Dam Rd' },
      { name: 'Squaw Point Access', type: 'launch', lat: 46.4056, lon: -94.3512, address: 'Squaw Point' },
      { name: 'Cragun\'s Resort', type: 'lodging', lat: 46.4078, lon: -94.3589, address: '11000 Craguns Dr' },
      { name: 'Madden\'s Resort', type: 'lodging', lat: 46.4156, lon: -94.3401, address: '11266 Pine Beach Peninsula' },
      { name: 'Kavanaugh\'s Resort', type: 'lodging', lat: 46.4001, lon: -94.3623, address: '2300 Kavanaugh Dr' }
    ],
    recentReports: [
      { user: 'BrainerdBass', text: 'Ice is marginal at 8 inches. Use caution on the west end.', date: '4 days ago' },
      { user: 'NisswaNate', text: 'Caught some nice crappies near the sunken island.', date: '5 days ago' },
      { user: 'GullGuy', text: 'Slow fishing but ice is building. Give it another week.', date: '1 week ago' }
    ]
  },
  'rainy-lake': {
    id: 'rainy-lake',
    name: 'Rainy Lake',
    region: 'International Falls',
    lat: 48.6167,
    lon: -93.3808,
    condition: 'excellent',
    thickness: 17,
    reports: 9,
    lastReport: '1 day ago',
    description: 'Rainy Lake straddles the US-Canada border and offers some of the best walleye and crappie fishing in the region. The International Falls area provides full services.',
    weather: {
      temp: 2,
      feelsLike: -15,
      wind: { speed: 18, direction: 'N' },
      conditions: 'Cold & Clear',
      forecast: [
        { day: 'Sat', high: 5, low: -12, icon: 'sunny' },
        { day: 'Sun', high: 8, low: -8, icon: 'sunny' },
        { day: 'Mon', high: 10, low: -5, icon: 'cloudy' }
      ]
    },
    pois: [
      { name: 'Rainy Lake Bait', type: 'bait', lat: 48.6012, lon: -93.4023, address: 'Hwy 11, International Falls' },
      { name: 'Jim\'s Bait & Tackle', type: 'bait', lat: 48.5978, lon: -93.4156, address: 'Hwy 53' },
      { name: 'Thunderbird Lodge Bar', type: 'bar', lat: 48.6089, lon: -93.3934, address: 'Island View' },
      { name: 'The Chocolate Moose', type: 'bar', lat: 48.5989, lon: -93.4089, address: 'International Falls' },
      { name: 'Gold Mine Access', type: 'launch', lat: 48.6234, lon: -93.3712, address: 'Gold Mine Rd' },
      { name: 'Voyageurs NP Access', type: 'launch', lat: 48.6123, lon: -93.3856, address: 'Voyageurs NP' },
      { name: 'Rainy Lake Access', type: 'launch', lat: 48.6056, lon: -93.4001, address: 'Rainy Lake Rd' },
      { name: 'Thunderbird Lodge', type: 'lodging', lat: 48.6078, lon: -93.3945, address: 'Island View' },
      { name: 'Island View Lodge', type: 'lodging', lat: 48.6145, lon: -93.3823, address: 'Island View Rd' },
      { name: 'Border Bob\'s Fish Houses', type: 'fishhouse', lat: 48.6034, lon: -93.4012, address: 'Hwy 11' },
      { name: 'Holiday Gas', type: 'gas', lat: 48.5967, lon: -93.4134, address: 'Hwy 53, International Falls' }
    ],
    recentReports: [
      { user: 'RainyRob', text: 'Crappies are crushing it! Found a school in 15 feet.', date: '1 day ago' },
      { user: 'BorderPatrol', text: '17 inches of ice. Coldest winter in years = great ice!', date: '3 days ago' },
      { user: 'VoyageurVince', text: 'Walleye bite slow but crappies saved the day.', date: '4 days ago' }
    ]
  },
  'otter-tail': {
    id: 'otter-tail',
    name: 'Otter Tail Lake',
    region: 'West Central Minnesota',
    lat: 46.4236,
    lon: -95.6978,
    condition: 'good',
    thickness: 9,
    reports: 7,
    lastReport: '3 days ago',
    description: 'Otter Tail Lake is one of the largest lakes in the Otter Tail County lake district. It\'s known for excellent walleye and largemouth bass fishing.',
    weather: {
      temp: 15,
      feelsLike: 2,
      wind: { speed: 10, direction: 'W' },
      conditions: 'Partly Cloudy',
      forecast: [
        { day: 'Sat', high: 18, low: 5, icon: 'cloudy' },
        { day: 'Sun', high: 22, low: 8, icon: 'sunny' },
        { day: 'Mon', high: 20, low: 6, icon: 'sunny' }
      ]
    },
    pois: [
      { name: 'Otter Tail Bait', type: 'bait', lat: 46.4189, lon: -95.7034, address: 'Hwy 78, Ottertail' },
      { name: 'Battle Lake Bait', type: 'bait', lat: 46.4012, lon: -95.7123, address: 'Battle Lake' },
      { name: 'Zorbaz on Otter Tail', type: 'bar', lat: 46.4156, lon: -95.6912, address: 'Otter Tail Beach' },
      { name: 'Ottertail Pub', type: 'bar', lat: 46.4078, lon: -95.7001, address: 'Main St, Ottertail' },
      { name: 'Ottertail Public Access', type: 'launch', lat: 46.4201, lon: -95.6923, address: 'Otter Tail' },
      { name: 'Amor Public Access', type: 'launch', lat: 46.4312, lon: -95.6834, address: 'Amor' },
      { name: 'Thumper Pond Resort', type: 'lodging', lat: 46.4134, lon: -95.6978, address: '1500 Otter Tail Beach Rd' },
      { name: 'Otter Tail Beach Resort', type: 'lodging', lat: 46.4167, lon: -95.6889, address: 'Beach Rd' },
      { name: 'Casey\'s', type: 'gas', lat: 46.4023, lon: -95.7089, address: 'Battle Lake' }
    ],
    recentReports: [
      { user: 'OTLangler', text: 'Good walleye bite in 18-22 feet. Ice at 9 inches.', date: '3 days ago' },
      { user: 'WestMNFish', text: 'Caught nice crappies at sunset. Try the south basin.', date: '4 days ago' },
      { user: 'BattleLakeBob', text: 'Ice is building nicely. Should be great by next week.', date: '6 days ago' }
    ]
  },
  'cass-lake': {
    id: 'cass-lake',
    name: 'Cass Lake',
    region: 'North Central Minnesota',
    lat: 47.3919,
    lon: -94.6050,
    condition: 'excellent',
    thickness: 12,
    reports: 11,
    lastReport: '2 days ago',
    description: 'Cass Lake is connected to several other lakes including Pike Bay and features Star Island in its center. Known for excellent walleye, perch, and northern pike.',
    weather: {
      temp: 8,
      feelsLike: -5,
      wind: { speed: 10, direction: 'NW' },
      conditions: 'Cloudy',
      forecast: [
        { day: 'Sat', high: 12, low: -2, icon: 'cloudy' },
        { day: 'Sun', high: 15, low: 2, icon: 'snow' },
        { day: 'Mon', high: 18, low: 5, icon: 'cloudy' }
      ]
    },
    pois: [
      { name: 'Cass Lake Bait', type: 'bait', lat: 47.3812, lon: -94.6123, address: 'Hwy 371, Cass Lake' },
      { name: 'Big Fish Tackle', type: 'bait', lat: 47.3789, lon: -94.6201, address: 'Main St, Cass Lake' },
      { name: 'Palace Casino Bar', type: 'bar', lat: 47.3834, lon: -94.6078, address: 'Palace Dr' },
      { name: 'Stony Point Bar', type: 'bar', lat: 47.3901, lon: -94.5989, address: 'Stony Point' },
      { name: 'Palace Casino', type: 'casino', lat: 47.3845, lon: -94.6067, address: '6280 Upper Cass Frontage Rd' },
      { name: 'Cass Lake Public Access', type: 'launch', lat: 47.3856, lon: -94.6134, address: 'Cass Lake' },
      { name: 'Pike Bay Access', type: 'launch', lat: 47.3978, lon: -94.5912, address: 'Pike Bay' },
      { name: 'Stony Point Access', type: 'launch', lat: 47.3923, lon: -94.5967, address: 'Stony Point Rd' },
      { name: 'Palace Casino Hotel', type: 'lodging', lat: 47.3856, lon: -94.6056, address: '6280 Upper Cass Frontage' },
      { name: 'Cass Lake Lodge', type: 'lodging', lat: 47.3801, lon: -94.6156, address: 'Cass Lake' },
      { name: 'Star Island Fish Houses', type: 'fishhouse', lat: 47.3889, lon: -94.6012, address: 'Knutson Dam Rd' },
      { name: 'Casey\'s', type: 'gas', lat: 47.3778, lon: -94.6189, address: 'Hwy 371, Cass Lake' }
    ],
    recentReports: [
      { user: 'CassLakeKing', text: 'Star Island is the spot! Caught limits of walleye.', date: '2 days ago' },
      { user: 'PikeBayPete', text: '12 inches of solid ice. Roads out to the houses are good.', date: '3 days ago' },
      { user: 'StarIslandSam', text: 'Perch are schooled up. Try small jigs with wax worms.', date: '5 days ago' }
    ]
  }
};

// POI type icons and labels
const POI_TYPES = {
  bait: { icon: '🎣', label: 'Bait Shop', color: '#1D4D3C' },
  bar: { icon: '🍺', label: 'Bar', color: '#D4AF37' },
  casino: { icon: '🎰', label: 'Casino', color: '#9333EA' },
  launch: { icon: '🚤', label: 'Boat Launch', color: '#0A3A60' },
  lodging: { icon: '🏨', label: 'Lodging', color: '#059669' },
  fishhouse: { icon: '🏠', label: 'Fish House Rental', color: '#DC2626' },
  gas: { icon: '⛽', label: 'Gas Station', color: '#4B5563' }
};

// General discussions (not tied to specific lakes)
const GENERAL_DISCUSSIONS = [
  {
    id: 1,
    title: 'Best ice auger recommendations 2024?',
    author: 'GearGuru',
    createdAt: 'Dec 1, 2024',
    pinned: true,
    replyCount: 23,
    lastReplyAt: '3 hours ago',
    category: 'gear',
    posts: [
      { id: 1, author: 'GearGuru', content: 'Looking to upgrade my auger this season. What\'s everyone running? Debating between Strikemaster, Ion, and Eskimo. Budget around $400-600. Mostly drilling 8" holes.', timestamp: 'Dec 1', isOP: true },
      { id: 2, author: 'DrillSergeant', content: 'Ion G2 all the way. Light, powerful, great battery life. Had mine for 3 years with zero issues.', timestamp: 'Dec 2', isOP: false },
      { id: 3, author: 'OldSchoolIce', content: 'Can\'t beat a Jiffy propane for the price. More power than electric and no batteries to worry about in the cold.', timestamp: 'Dec 3', isOP: false },
      { id: 4, author: 'TechFisher', content: 'Just got the Strikemaster 40V. Cuts through 2 feet of ice like butter. Worth every penny.', timestamp: '5 hours ago', isOP: false },
      { id: 5, author: 'GearGuru', content: 'Thanks everyone! Leaning towards the Ion G2 based on the reviews. Anyone have issues with battery life in sub-zero temps?', timestamp: '3 hours ago', isOP: true }
    ]
  },
  {
    id: 2,
    title: 'Favorite jigging techniques for walleye',
    author: 'JigMaster',
    createdAt: 'Nov 28, 2024',
    pinned: true,
    replyCount: 31,
    lastReplyAt: '6 hours ago',
    category: 'techniques',
    posts: [
      { id: 1, author: 'JigMaster', content: 'Let\'s share our go-to jigging techniques! I\'ve been having success with a slow lift and drop, pausing at the top. What\'s working for you?', timestamp: 'Nov 28', isOP: true },
      { id: 2, author: 'WalleyeWhisperer', content: 'Pounding the bottom has been deadly for me. Aggressive lifts with a hard snap back down. Seems to trigger reaction strikes.', timestamp: 'Nov 29', isOP: false },
      { id: 3, author: 'SubtleAngler', content: 'Dead stick with a minnow while jigging a rattlebait nearby. The commotion brings them in, the easy meal closes the deal.', timestamp: 'Nov 30', isOP: false },
      { id: 4, author: 'NightBiter', content: 'After dark, super slow swimming motion. Barely moving the jig. The glow spoons have been money.', timestamp: '6 hours ago', isOP: false }
    ]
  },
  {
    id: 3,
    title: 'Electronics - Vexilar vs Marcum?',
    author: 'SonarSam',
    createdAt: 'Nov 25, 2024',
    pinned: false,
    replyCount: 18,
    lastReplyAt: '1 day ago',
    category: 'gear',
    posts: [
      { id: 1, author: 'SonarSam', content: 'Time for a new flasher. Been using an old Vexilar FL-8 forever. Looking at the FLX-28 vs Marcum LX-7. What do you guys prefer and why?', timestamp: 'Nov 25', isOP: true },
      { id: 2, author: 'FlasherFan', content: 'Marcum LX-7 is incredible. The display is so crisp you can see individual fish. Zoom feature is game-changing.', timestamp: 'Nov 26', isOP: false },
      { id: 3, author: 'VexilarVet', content: 'Vexilar reliability is unmatched. My FL-20 has been going strong for 12 years. FLX-28 has all the modern features.', timestamp: 'Nov 27', isOP: false },
      { id: 4, author: 'LiveScopeLover', content: 'Have you considered forward-facing sonar? Game changer once you try it. Can see fish 50+ feet away.', timestamp: '1 day ago', isOP: false }
    ]
  },
  {
    id: 4,
    title: 'Minnesota ice fishing regulations Q&A',
    author: 'RulesRanger',
    createdAt: 'Nov 20, 2024',
    pinned: false,
    replyCount: 14,
    lastReplyAt: '2 days ago',
    category: 'regulations',
    posts: [
      { id: 1, author: 'RulesRanger', content: 'Lot of questions come up every year about regulations. Let\'s use this thread to help each other out. What questions do you have about MN ice fishing rules?', timestamp: 'Nov 20', isOP: true },
      { id: 2, author: 'NewToIce', content: 'How many lines can I fish? And do I need a separate license for a fish house?', timestamp: 'Nov 21', isOP: false },
      { id: 3, author: 'RulesRanger', content: '@NewToIce - 2 lines when attended, up to 3 if unattended. No separate license for the house, but it needs to be registered with your info on it.', timestamp: 'Nov 21', isOP: true },
      { id: 4, author: 'BorderFisher', content: 'What about Lake of the Woods Canadian waters? Different rules there?', timestamp: '2 days ago', isOP: false }
    ]
  },
  {
    id: 5,
    title: 'Cold weather gear that actually works',
    author: 'FrostBite',
    createdAt: 'Dec 3, 2024',
    pinned: false,
    replyCount: 19,
    lastReplyAt: '8 hours ago',
    category: 'gear',
    posts: [
      { id: 1, author: 'FrostBite', content: 'What gear keeps you warm when it\'s -20? Looking for boot, glove, and bibs recommendations that actually hold up in extreme cold.', timestamp: 'Dec 3', isOP: true },
      { id: 2, author: 'ArcticAngler', content: 'Muck Arctic Pro boots are the real deal. Rated to -60 and my feet have never been cold. Worth every penny.', timestamp: 'Dec 3', isOP: false },
      { id: 3, author: 'LayerKing', content: 'Gloves - Ice Armor by Clam. The flip-top mittens let you tie knots without freezing your fingers off.', timestamp: 'Dec 4', isOP: false },
      { id: 4, author: 'FloatSuitFan', content: 'Striker Ice Climate bibs. Float-assist, waterproof, and warm down to stupid cold. Never going back.', timestamp: '8 hours ago', isOP: false }
    ]
  },
  {
    id: 6,
    title: 'Ice fishing meetup - Saturday Dec 14',
    author: 'SocialAngler',
    createdAt: 'Dec 5, 2024',
    pinned: true,
    replyCount: 12,
    lastReplyAt: '1 hour ago',
    category: 'community',
    posts: [
      { id: 1, author: 'SocialAngler', content: 'Organizing a meetup at Mille Lacs this Saturday! Planning to set up near the big reef. All skill levels welcome. Bring your own gear, we\'ll share tips and maybe some hot dogs. Meet at Nitti\'s access at 7am.', timestamp: 'Dec 5', isOP: true },
      { id: 2, author: 'WeekendWarrior', content: 'Count me in! Been wanting to fish Mille Lacs but intimidated to go alone. This is perfect.', timestamp: 'Dec 5', isOP: false },
      { id: 3, author: 'GroupGuy', content: 'I\'ll bring extra minnows and my propane heater. How many people are we expecting?', timestamp: 'Dec 6', isOP: false },
      { id: 4, author: 'SocialAngler', content: 'Looking like 8-10 people so far! Going to be a great time. Weather looks cold but fishable.', timestamp: '1 hour ago', isOP: true }
    ]
  },
  {
    id: 7,
    title: 'Looking for fishing buddy - Twin Cities area',
    author: 'SoloFisher',
    createdAt: 'Dec 2, 2024',
    pinned: false,
    replyCount: 8,
    lastReplyAt: '12 hours ago',
    category: 'community',
    posts: [
      { id: 1, author: 'SoloFisher', content: 'New to the area and all my fishing buddies are back in Wisconsin. Anyone in the Twin Cities want to link up? I\'ve got a truck and a good wheelhouse. Usually fish weekends.', timestamp: 'Dec 2', isOP: true },
      { id: 2, author: 'MetroAngler', content: 'I\'m in Bloomington and fish most Saturdays. Always looking for someone to split gas with. What lakes do you like?', timestamp: 'Dec 3', isOP: false },
      { id: 3, author: 'SoloFisher', content: '@MetroAngler Been hitting Minnetonka and some of the smaller metro lakes. Open to traveling further though!', timestamp: 'Dec 4', isOP: true },
      { id: 4, author: 'NorthernRuns', content: 'If you guys want to venture up north, I make the drive to Mille Lacs almost every weekend. Room for more!', timestamp: '12 hours ago', isOP: false }
    ]
  },
  {
    id: 8,
    title: 'Youth ice fishing programs?',
    author: 'DadAngler',
    createdAt: 'Nov 30, 2024',
    pinned: false,
    replyCount: 11,
    lastReplyAt: '3 days ago',
    category: 'community',
    posts: [
      { id: 1, author: 'DadAngler', content: 'My kids (8 and 11) are dying to try ice fishing. Are there any youth programs or guided trips that cater to families? Don\'t want their first experience to be miserable!', timestamp: 'Nov 30', isOP: true },
      { id: 2, author: 'FamilyFisher', content: 'DNR does free "Learn to Fish" clinics! They provide all the gear and have great instructors. Check the MN DNR website for dates.', timestamp: 'Dec 1', isOP: false },
      { id: 3, author: 'GuidePro', content: 'A lot of guides offer family-friendly trips with heated houses. Kids love it because they stay warm and catch fish. Worth the investment for the first time.', timestamp: 'Dec 2', isOP: false },
      { id: 4, author: 'ScoutLeader', content: 'Local Boy/Girl Scout troops sometimes organize ice fishing outings too. Great way to meet other families.', timestamp: '3 days ago', isOP: false }
    ]
  }
];

// Get lake by slug
function getLakeBySlug(slug) {
  return LAKES_DATA[slug] || null;
}

// Get all lakes as array
function getAllLakes() {
  return Object.values(LAKES_DATA);
}

// Get condition badge color
function getConditionColor(condition) {
  const colors = {
    excellent: 'bg-evergreen',
    good: 'bg-gold',
    fair: 'bg-secondary',
    marginal: 'bg-danger'
  };
  return colors[condition] || 'bg-secondary';
}

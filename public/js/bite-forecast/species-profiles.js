/**
 * Species Profiles Module
 *
 * Complete behavioral and environmental preference data for all 20 Minnesota
 * fish species targeted during ice fishing season. Each profile includes:
 * - Time-of-day feeding patterns
 * - Weather sensitivity weights
 * - Educational content about habits
 * - UI styling (colors, icons)
 *
 * Data sourced from BiteForecastMatrix.md
 *
 * @module SpeciesProfiles
 */

const SpeciesProfiles = (() => {
  'use strict';

  const PROFILES = {
    walleye: {
      id: 'walleye',
      name: 'Walleye',
      icon: '🎣',
      color: '#D4AF37', // Gold

      // Time-of-day modifiers (added to baseline 50)
      timePatterns: {
        dawn: { offsetMinutes: -90, durationMinutes: 135, modifier: +15 },
        dusk: { offsetMinutes: -45, durationMinutes: 135, modifier: +15 },
        earlyNight: { hoursAfterSunset: 3, modifier: +10 },
        midday: { modifier: -10 },
        lateNight: { modifier: 0 }
      },

      // Weather factor sensitivity (multipliers)
      weatherWeights: {
        pressureTrend: 1.2,
        temperature: 0.8,
        cloudCover: 1.1,
        precipitation: 1.0,
        wind: 0.5
      },

      // Specific cloud/temp adjustments
      cloudPreference: {
        overcast: +5,  // 70-100% clouds
        clear: -5      // 0-30% clouds at midday
      },

      education: {
        habits: 'Walleye are low-light predators with exceptional vision in dim conditions. They feed most actively during dawn and dusk twilight periods when they have a hunting advantage over prey.',
        bestConditions: 'Falling barometer before a storm, overcast skies extending feeding windows, and early morning or evening hours.',
        winterBehavior: 'Under ice, walleye often suspend over deep basins during the day and move shallow to feed during golden hours. Target depths of 15-30 feet near structure.',
        tipOfTheDay: 'Use glow jigs tipped with minnow heads. Aggressive jigging followed by long pauses often triggers strikes.'
      },

      // Seasonal/Moon/Day Length factors
      seasonalModifiers: {
        early_ice: +7,
        mid_winter: -5,
        late_ice: +8
      },
      nightFeeder: true,
      moonSensitivity: 1.0,        // High
      dayLengthSensitivity: 0.6    // Moderate
    },

    northernPike: {
      id: 'northernPike',
      name: 'Northern Pike',
      icon: '🐊',
      color: '#1D4D3C', // Evergreen

      timePatterns: {
        dawn: { offsetMinutes: -90, durationMinutes: 135, modifier: +10 },
        dusk: { offsetMinutes: -45, durationMinutes: 135, modifier: +10 },
        midday: { modifier: 0 },
        night: { modifier: -10 }
      },

      weatherWeights: {
        pressureTrend: 1.0,
        temperature: 0.9,
        cloudCover: 0.8,
        precipitation: 1.0,
        wind: 0.5
      },

      cloudPreference: {
        overcast: +3,
        clear: 0  // Pike handle bright conditions better
      },

      education: {
        habits: 'Pike are ambush predators that hunt visually throughout the day. They prefer to lie in wait near weed edges, drop-offs, and structure.',
        bestConditions: 'Active all day on overcast conditions. Look for pike around weed edges, rocky points, and shallow bays with vegetation.',
        winterBehavior: 'Pike remain active under ice and will chase lures aggressively during feeding periods. They often occupy shallower water (5-15 feet) than other predators.',
        tipOfTheDay: 'Quick-strike rigs with large minnows or dead bait work well. Pike love flash and movement - use tip-ups with bright flags.'
      },

      seasonalModifiers: { early_ice: +10, mid_winter: -3, late_ice: +10 },
      nightFeeder: false,
      moonSensitivity: 1.0,
      dayLengthSensitivity: 0.3
    },

    muskellunge: {
      id: 'muskellunge',
      name: 'Muskellunge',
      icon: '🦈',
      color: '#2F4F4F', // Dark slate

      timePatterns: {
        dawn: { offsetMinutes: -90, durationMinutes: 135, modifier: +10 },
        dusk: { offsetMinutes: -45, durationMinutes: 135, modifier: +10 },
        midday: { modifier: -10 },
        night: { modifier: 0 }
      },

      weatherWeights: {
        pressureTrend: 1.1,
        temperature: 0.7,
        cloudCover: 1.0,
        precipitation: 1.0,
        wind: 0.5
      },

      cloudPreference: {
        overcast: +5,
        clear: -5
      },

      education: {
        habits: 'Muskies are large apex predators that become very sluggish in winter. Ice fishing for muskie is rare but possible during twilight periods.',
        bestConditions: 'Dawn and dusk during falling barometer events. Very difficult to catch through ice - patience required.',
        winterBehavior: 'Muskies often just suspend and barely move in cold water. They may feed once every few days. Target deep edges near historical summer haunts.',
        tipOfTheDay: 'Large dead sucker or cisco on quick-strike rig. Set tip-ups in 20-40 feet over weed edges.'
      },

      seasonalModifiers: { early_ice: +5, mid_winter: -8, late_ice: +6 },
      nightFeeder: false,
      moonSensitivity: 1.0,
      dayLengthSensitivity: 0.3
    },

    largemouthBass: {
      id: 'largemouthBass',
      name: 'Largemouth Bass',
      icon: '🐟',
      color: '#228B22', // Forest green

      timePatterns: {
        midday: { modifier: +5 },
        dawn: { offsetMinutes: -60, durationMinutes: 120, modifier: +5 },
        dusk: { offsetMinutes: -30, durationMinutes: 120, modifier: +5 },
        night: { modifier: -15 }
      },

      weatherWeights: {
        pressureTrend: 0.7,
        temperature: 1.3,  // Temperature matters most for bass
        cloudCover: 0.6,
        precipitation: 0.8,
        wind: 0.4
      },

      cloudPreference: {
        overcast: +2,
        clear: +2  // Bass like some sun for warmth
      },

      education: {
        habits: 'Bass have much slower metabolism in winter. They still feed, but infrequently. They often choose times when water might be marginally warmer - typically afternoon.',
        bestConditions: 'Warm spells and sunny afternoons when shallow water gets slight solar warming. Midday (11am-3pm) can be best.',
        winterBehavior: 'Bass often hold tight to cover in 8-15 feet. They become more active during warming trends and will strike small jigs tipped with waxworms.',
        tipOfTheDay: 'Downsize your presentation. Small jigs (1/16 oz) with finesse baits. Fish very slow with subtle twitches.'
      },

      seasonalModifiers: { early_ice: +3, mid_winter: -10, late_ice: +5 },
      nightFeeder: false,
      moonSensitivity: 0.3,
      dayLengthSensitivity: 0.3
    },

    smallmouthBass: {
      id: 'smallmouthBass',
      name: 'Smallmouth Bass',
      icon: '🟤',
      color: '#8B4513', // Saddle brown

      timePatterns: {
        dawn: { offsetMinutes: -75, durationMinutes: 135, modifier: +8 },
        dusk: { offsetMinutes: -45, durationMinutes: 135, modifier: +8 },
        midday: { modifier: +5 },
        night: { modifier: -20 }
      },

      weatherWeights: {
        pressureTrend: 0.8,
        temperature: 1.2,
        cloudCover: 0.7,
        precipitation: 0.9,
        wind: 0.4
      },

      cloudPreference: {
        overcast: +3,
        clear: +2
      },

      education: {
        habits: 'Smallmouth in winter often occupy deeper water near rocks. They can be slightly more active in cold water than largemouth.',
        bestConditions: 'Dawn/dusk and midday warmth. They respond to stable warm periods and will chase baitfish near rocky structure.',
        winterBehavior: 'Smallmouth stick to rock piles and points in 15-25 feet. They may move slightly shallower during afternoon sun.',
        tipOfTheDay: 'Small tubes, hair jigs, and blade baits work well. Target rock transitions and hard bottom.'
      },

      seasonalModifiers: { early_ice: +3, mid_winter: -10, late_ice: +5 },
      nightFeeder: false,
      moonSensitivity: 0.3,
      dayLengthSensitivity: 0.3
    },

    yellowPerch: {
      id: 'yellowPerch',
      name: 'Yellow Perch',
      icon: '🟡',
      color: '#FFD700', // Yellow/Gold

      timePatterns: {
        morning: { hoursAfterSunrise: 3, modifier: +10 },
        afternoon: { hoursBeforeSunset: 2, modifier: +10 },
        midday: { modifier: +3 },
        night: { modifier: -20 }
      },

      weatherWeights: {
        pressureTrend: 0.9,
        temperature: 0.8,
        cloudCover: 0.6,
        precipitation: 1.0,
        wind: 0.5
      },

      cloudPreference: {
        overcast: +3,
        clear: +2  // Perch can handle bright conditions
      },

      education: {
        habits: 'Perch feed in schools and rely on sight to pick off small prey. They bite best during daylight, often with peaks in morning and late afternoon.',
        bestConditions: 'Morning (first 2-3 hours) and late afternoon into sunset. Stable weather helps. Big cold fronts shut them down.',
        winterBehavior: 'Perch often roam mud flats eating larvae and small crustaceans. Schools can be large - where you find one, you find many.',
        tipOfTheDay: 'Small tungsten jigs with spikes or waxworms. Aggressive jigging attracts schools, then slow down for bites.'
      },

      seasonalModifiers: { early_ice: +8, mid_winter: -3, late_ice: +10 },
      nightFeeder: false,
      moonSensitivity: 0.6,
      dayLengthSensitivity: 1.0
    },

    blackCrappie: {
      id: 'blackCrappie',
      name: 'Black Crappie',
      icon: '⚫',
      color: '#4B0082', // Indigo

      timePatterns: {
        dusk: { offsetMinutes: -30, durationMinutes: 150, modifier: +15 },
        earlyNight: { hoursAfterSunset: 4, modifier: +10 },
        dawn: { offsetMinutes: -60, durationMinutes: 120, modifier: +10 },
        midday: { modifier: -5 }
      },

      weatherWeights: {
        pressureTrend: 0.9,
        temperature: 0.7,
        cloudCover: 1.0,
        precipitation: 1.0,
        wind: 0.5
      },

      cloudPreference: {
        overcast: +5,
        clear: -3
      },

      education: {
        habits: 'Crappies are famous for the evening and nighttime bite through the ice. They often start biting at dusk and continue well after dark.',
        bestConditions: 'Sunset into night is prime time. Many anglers fish crappie from dusk through late night. Falling barometer helps.',
        winterBehavior: 'Crappies suspend at various depths (often 10-20 feet) near brush piles, green weeds, or basin edges. They feed on minnows and plankton.',
        tipOfTheDay: 'Small jigs with soft plastics or live minnows. Glow-in-the-dark jigs work great at night. Fish under lights.'
      },

      seasonalModifiers: { early_ice: +8, mid_winter: -3, late_ice: +10 },
      nightFeeder: true,
      moonSensitivity: 0.6,
      dayLengthSensitivity: 1.0
    },

    whiteCrappie: {
      id: 'whiteCrappie',
      name: 'White Crappie',
      icon: '⚪',
      color: '#9370DB', // Medium purple

      // White crappie similar to black crappie
      timePatterns: {
        dusk: { offsetMinutes: -30, durationMinutes: 150, modifier: +15 },
        earlyNight: { hoursAfterSunset: 4, modifier: +10 },
        dawn: { offsetMinutes: -60, durationMinutes: 120, modifier: +10 },
        midday: { modifier: -5 }
      },

      weatherWeights: {
        pressureTrend: 0.9,
        temperature: 0.7,
        cloudCover: 1.0,
        precipitation: 1.0,
        wind: 0.5
      },

      cloudPreference: {
        overcast: +5,
        clear: -3
      },

      education: {
        habits: 'White crappie behave very similarly to black crappie - evening and night feeders that love low light.',
        bestConditions: 'Dusk through night, overcast days. Often found in same areas as black crappie but may prefer slightly muddier water.',
        winterBehavior: 'Suspend in deeper basins or around standing timber. White crappies tolerate murkier water than blacks.',
        tipOfTheDay: 'Same tactics as black crappie - small jigs, minnows, and fish at night under lights for best action.'
      },

      seasonalModifiers: { early_ice: +8, mid_winter: -3, late_ice: +10 },
      nightFeeder: true,
      moonSensitivity: 0.6,
      dayLengthSensitivity: 1.0
    },

    bluegill: {
      id: 'bluegill',
      name: 'Bluegill',
      icon: '🔵',
      color: '#4169E1', // Royal blue

      timePatterns: {
        midday: { modifier: +10 },
        lateAfternoon: { hoursBeforeSunset: 3, modifier: +8 },
        dawn: { offsetMinutes: -45, durationMinutes: 90, modifier: +5 },
        dusk: { modifier: -5 },
        night: { modifier: -20 }
      },

      weatherWeights: {
        pressureTrend: 0.6,
        temperature: 0.9,
        cloudCover: 0.5,
        precipitation: 0.8,
        wind: 0.4
      },

      cloudPreference: {
        overcast: 0,
        clear: +3  // Bluegill like some sun
      },

      education: {
        habits: 'Bluegills feed during daylight hours and are less active at dawn/dusk than many fish. Late morning through afternoon is best.',
        bestConditions: 'Warm, sunny days can be excellent panfish days. Late morning (10am-2pm) is often peak time. They slow down as light fades.',
        winterBehavior: 'Bluegills often hold in basin areas in 15-25 feet or near green weeds. They feed on small invertebrates and insect larvae.',
        tipOfTheDay: 'Tiny jigs with waxworms or spikes. Very light line (2-4lb) and finesse presentation. They have soft mouths - use light drag.'
      },

      seasonalModifiers: { early_ice: +5, mid_winter: -8, late_ice: +8 },
      nightFeeder: false,
      moonSensitivity: 0.3,
      dayLengthSensitivity: 1.0
    },

    pumpkinseedSunfish: {
      id: 'pumpkinseedSunfish',
      name: 'Pumpkinseed Sunfish',
      icon: '🎃',
      color: '#FF8C00', // Dark orange

      // Similar to bluegill - daytime feeders
      timePatterns: {
        midday: { modifier: +10 },
        lateAfternoon: { hoursBeforeSunset: 3, modifier: +8 },
        dawn: { offsetMinutes: -45, durationMinutes: 90, modifier: +5 },
        dusk: { modifier: -5 },
        night: { modifier: -20 }
      },

      weatherWeights: {
        pressureTrend: 0.6,
        temperature: 0.9,
        cloudCover: 0.5,
        precipitation: 0.8,
        wind: 0.4
      },

      cloudPreference: {
        overcast: 0,
        clear: +3
      },

      education: {
        habits: 'Pumpkinseeds are visual hunters like bluegills. They feed on small prey during daylight and become inactive at night.',
        bestConditions: 'Similar to bluegill - midday and afternoon warmth. They often school with bluegills.',
        winterBehavior: 'Found in similar areas to bluegills, often mixed in schools. They prefer areas with some vegetation.',
        tipOfTheDay: 'Same tactics as bluegill. Small ice jigs with live bait. They have beautiful coloring - great for kids!'
      },

      seasonalModifiers: { early_ice: +5, mid_winter: -8, late_ice: +8 },
      nightFeeder: false,
      moonSensitivity: 0.3,
      dayLengthSensitivity: 1.0
    },

    lakeTrout: {
      id: 'lakeTrout',
      name: 'Lake Trout',
      icon: '🏔️',
      color: '#708090', // Slate gray

      timePatterns: {
        midday: { modifier: +5 },
        lateMorning: { hoursAfterSunrise: 2, modifier: +8 },
        dawn: { offsetMinutes: -60, durationMinutes: 120, modifier: +8 },
        dusk: { offsetMinutes: -30, durationMinutes: 120, modifier: +8 },
        night: { modifier: -10 }
      },

      weatherWeights: {
        pressureTrend: 0.7,  // Less sensitive (deep water)
        temperature: 0.6,
        cloudCover: 0.5,
        precipitation: 0.9,
        wind: 0.5
      },

      cloudPreference: {
        overcast: 0,
        clear: +2  // Lakers often in deep dim water anyway
      },

      education: {
        habits: 'Lake trout remain relatively active in winter, patrolling for ciscoes or smelt. They can be caught all day long.',
        bestConditions: 'Late morning through afternoon can be strong bite windows. Lakers are not as light-shy as walleye.',
        winterBehavior: 'Found in deep, cold lakes (depths of 40-100+ feet). They cruise rocky points and humps looking for baitfish.',
        tipOfTheDay: 'Heavy jigging spoons or tube jigs. Lakers hit hard - use stout rods and 10-12lb line. Electronics are key to find them.'
      },

      seasonalModifiers: { early_ice: +6, mid_winter: -3, late_ice: +6 },
      nightFeeder: true,
      moonSensitivity: 1.0,
      dayLengthSensitivity: 0.6
    },

    rainbowTrout: {
      id: 'rainbowTrout',
      name: 'Rainbow Trout',
      icon: '🌈',
      color: '#FF69B4', // Hot pink

      timePatterns: {
        dawn: { offsetMinutes: -75, durationMinutes: 135, modifier: +10 },
        dusk: { offsetMinutes: -45, durationMinutes: 135, modifier: +10 },
        midday: { modifier: +3 },
        night: { modifier: -20 }
      },

      weatherWeights: {
        pressureTrend: 0.8,
        temperature: 0.7,
        cloudCover: 0.8,
        precipitation: 1.0,
        wind: 0.5
      },

      cloudPreference: {
        overcast: +4,
        clear: -3
      },

      education: {
        habits: 'Rainbow trout cruise near shallow areas early and late in the day. Morning and evening are best.',
        bestConditions: 'Dawn and dusk during stable or falling barometer. Rainbows will bite mid-morning too.',
        winterBehavior: 'Often stocked in small lakes. They cruise 10-20 feet and feed on minnows and insect larvae.',
        tipOfTheDay: 'Small spoons, jigs with PowerBait or waxworms. Rainbows are aggressive - they hit hard.'
      },

      seasonalModifiers: { early_ice: +6, mid_winter: -3, late_ice: +6 },
      nightFeeder: false,
      moonSensitivity: 1.0,
      dayLengthSensitivity: 0.6
    },

    brownTrout: {
      id: 'brownTrout',
      name: 'Brown Trout',
      icon: '🟫',
      color: '#A0522D', // Sienna

      timePatterns: {
        dawn: { offsetMinutes: -75, durationMinutes: 135, modifier: +10 },
        dusk: { offsetMinutes: -45, durationMinutes: 135, modifier: +10 },
        earlyNight: { hoursAfterSunset: 2, modifier: +5 },
        midday: { modifier: -5 },  // Spooky in bright sun
        lateNight: { modifier: 0 }
      },

      weatherWeights: {
        pressureTrend: 0.8,
        temperature: 0.7,
        cloudCover: 1.0,  // Browns sensitive to clouds
        precipitation: 1.0,
        wind: 0.5
      },

      cloudPreference: {
        overcast: +6,
        clear: -5  // Browns spook easily in clear water
      },

      education: {
        habits: 'Browns are more nocturnal by nature. Big browns feed at night. Under ice, they bite strongly at dawn/dusk and can feed after dark.',
        bestConditions: 'Overcast days, dusk into evening. Browns are wary - they prefer low light and cover.',
        winterBehavior: 'Often deeper than rainbows, near structure. Browns will hold tight to bottom and ambush prey.',
        tipOfTheDay: 'Live minnows or small spoons. Browns prefer natural baits. Fish near drop-offs and rocky areas.'
      },

      seasonalModifiers: { early_ice: +6, mid_winter: -3, late_ice: +6 },
      nightFeeder: true,
      moonSensitivity: 1.0,
      dayLengthSensitivity: 0.6
    },

    brookTrout: {
      id: 'brookTrout',
      name: 'Brook Trout',
      icon: '🟩',
      color: '#20B2AA', // Light sea green

      timePatterns: {
        dawn: { offsetMinutes: -75, durationMinutes: 135, modifier: +10 },
        dusk: { offsetMinutes: -45, durationMinutes: 135, modifier: +10 },
        midday: { modifier: +3 },
        night: { modifier: -20 }
      },

      weatherWeights: {
        pressureTrend: 0.8,
        temperature: 0.6,  // Brook trout love cold
        cloudCover: 0.8,
        precipitation: 1.0,
        wind: 0.5
      },

      cloudPreference: {
        overcast: +4,
        clear: -2
      },

      education: {
        habits: 'Brook trout are native to cold streams but stocked in lakes. They feed at dawn/dusk and during the day if conditions allow.',
        bestConditions: 'Morning and evening, overcast days. Brookies thrive in very cold water.',
        winterBehavior: 'Often found in the coldest, clearest lakes. They cruise 10-25 feet near springs or oxygenated areas.',
        tipOfTheDay: 'Small jigs, spoons, or flies under the ice. Brookies are beautiful and fun to catch on light tackle.'
      },

      seasonalModifiers: { early_ice: +6, mid_winter: -3, late_ice: +6 },
      nightFeeder: false,
      moonSensitivity: 1.0,
      dayLengthSensitivity: 0.6
    },

    channelCatfish: {
      id: 'channelCatfish',
      name: 'Channel Catfish',
      icon: '😺',
      color: '#696969', // Dim gray

      timePatterns: {
        lateAfternoon: { hoursBeforeSunset: 3, modifier: +5 },
        evening: { hoursAfterSunset: 2, modifier: +5 },
        midday: { modifier: 0 },
        morning: { modifier: 0 },
        lateNight: { modifier: 0 }
      },

      weatherWeights: {
        pressureTrend: 0.5,
        temperature: 1.4,  // Temperature matters most for catfish
        cloudCover: 0.4,
        precipitation: 0.7,
        wind: 0.3
      },

      cloudPreference: {
        overcast: 0,
        clear: 0  // Catfish don't care about clouds
      },

      education: {
        habits: 'Channel cats in winter often gather in deep wintering holes and feed very infrequently (maybe once every few days).',
        bestConditions: 'Warm spells - when temps approach or exceed freezing for a day or two, channel cats may become active.',
        winterBehavior: 'They sit in the deepest holes (20-40+ feet) near river channels or deep structure. Movement is minimal.',
        tipOfTheDay: 'Cut bait or dead minnows on bottom rigs. Very patient fishing required. Warming trends are critical.'
      },

      seasonalModifiers: { early_ice: +2, mid_winter: -8, late_ice: +4 },
      nightFeeder: false,
      moonSensitivity: 0.3,
      dayLengthSensitivity: 0.3
    },

    flatheadCatfish: {
      id: 'flatheadCatfish',
      name: 'Flathead Catfish',
      icon: '😸',
      color: '#556B2F', // Dark olive green

      timePatterns: {
        dusk: { offsetMinutes: -30, durationMinutes: 120, modifier: +2 },
        // Flatheads are nearly dormant in winter
        allOther: { modifier: 0 }
      },

      weatherWeights: {
        pressureTrend: 0.3,
        temperature: 1.5,  // Only temperature really matters
        cloudCover: 0.2,
        precipitation: 0.4,
        wind: 0.2
      },

      cloudPreference: {
        overcast: 0,
        clear: 0
      },

      education: {
        habits: 'Flatheads basically hunker down in log jams or deep holes and barely eat all winter. Extremely rare to catch through ice.',
        bestConditions: 'Practically none. Flathead fishing is effectively "off" during ice season. Wait for spring.',
        winterBehavior: 'They nearly hibernate in deep, protected structure. Metabolism drops to near zero.',
        tipOfTheDay: 'Not worth targeting through ice. Focus on other species and save flathead fishing for summer.'
      },

      seasonalModifiers: { early_ice: +1, mid_winter: -10, late_ice: +2 },
      nightFeeder: false,
      moonSensitivity: 0.3,
      dayLengthSensitivity: 0.3
    },

    lakeSturgeon: {
      id: 'lakeSturgeon',
      name: 'Lake Sturgeon',
      icon: '🐋',
      color: '#2F4F4F', // Dark slate gray

      timePatterns: {
        dawn: { offsetMinutes: -60, durationMinutes: 180, modifier: +10 },
        lateMorning: { hoursAfterSunrise: 3, modifier: +8 },
        lateAfternoon: { hoursBeforeSunset: 3, modifier: +10 },
        dusk: { offsetMinutes: -30, durationMinutes: 120, modifier: +10 },
        night: { modifier: +5 },
        midday: { modifier: 0 }
      },

      weatherWeights: {
        pressureTrend: 0.6,  // Less sensitive (no swim bladder)
        temperature: 0.7,
        cloudCover: 0.5,
        precipitation: 0.8,
        wind: 0.4
      },

      cloudPreference: {
        overcast: 0,
        clear: 0
      },

      education: {
        habits: 'Lake sturgeon through ice are caught by setlines or jigging in deep holes (like on the St. Croix or Rainy River). Morning and late afternoon are best.',
        bestConditions: 'Dawn through mid-morning and late afternoon toward sunset. Stable conditions help.',
        winterBehavior: 'Sturgeon are bottom feeders in deep channels (30-60+ feet). They feed on invertebrates, crayfish, and small fish.',
        tipOfTheDay: 'Heavy rods and line (20lb+). Large hooks with cut bait or worms. Sturgeon are prehistoric - amazing fish to catch!'
      },

      seasonalModifiers: { early_ice: +4, mid_winter: -2, late_ice: +6 },
      nightFeeder: false,
      moonSensitivity: 0.3,
      dayLengthSensitivity: 0.3
    },

    sauger: {
      id: 'sauger',
      name: 'Sauger',
      icon: '🎣',
      color: '#B8860B', // Dark goldenrod

      // Sauger behave almost identically to walleye
      timePatterns: {
        dawn: { offsetMinutes: -90, durationMinutes: 135, modifier: +15 },
        dusk: { offsetMinutes: -45, durationMinutes: 135, modifier: +15 },
        earlyNight: { hoursAfterSunset: 3, modifier: +10 },
        midday: { modifier: -10 },
        lateNight: { modifier: 0 }
      },

      weatherWeights: {
        pressureTrend: 1.2,
        temperature: 0.8,
        cloudCover: 1.1,
        precipitation: 1.0,
        wind: 0.5
      },

      cloudPreference: {
        overcast: +5,
        clear: -5
      },

      education: {
        habits: 'Sauger are close cousins to walleye with nearly identical patterns: low-light feeding, active at dawn/dusk, can also bite at night.',
        bestConditions: 'Same as walleye - falling barometer, overcast, twilight hours. Sauger often found in river systems.',
        winterBehavior: 'Sauger often prefer slightly deeper water and current areas. They school tightly - catch one, catch many.',
        tipOfTheDay: 'Same tactics as walleye - jigs with minnows. Sauger have slightly different coloring but similar behavior.'
      },

      seasonalModifiers: { early_ice: +7, mid_winter: -5, late_ice: +8 },
      nightFeeder: true,
      moonSensitivity: 1.0,
      dayLengthSensitivity: 1.0
    },

    cisco: {
      id: 'cisco',
      name: 'Cisco (Tullibee)',
      icon: '🐠',
      color: '#87CEEB', // Sky blue

      timePatterns: {
        midday: { modifier: +10 },
        lateAfternoon: { hoursBeforeSunset: 3, modifier: +8 },
        dawn: { offsetMinutes: -60, durationMinutes: 120, modifier: +5 },
        dusk: { offsetMinutes: -30, durationMinutes: 90, modifier: +5 },
        night: { modifier: -20 }
      },

      weatherWeights: {
        pressureTrend: 0.6,
        temperature: 0.7,
        cloudCover: 0.7,
        precipitation: 0.8,
        wind: 0.5
      },

      cloudPreference: {
        overcast: +3,
        clear: +3  // Cisco feed when plankton are active
      },

      education: {
        habits: 'Ciscoes (tullibee) are open-water plankton feeders. They roam in the water column and feed during daylight when plankton are active.',
        bestConditions: 'Late morning through afternoon when plankton move. On sunny days they may feed more mid-day.',
        winterBehavior: 'Cisco suspend at various depths (20-60 feet) in lake basins. They are often caught while targeting lake trout.',
        tipOfTheDay: 'Small spoons, Swedish pimples, or tiny jigs. They school densely - find the depth and you can catch many.'
      },

      seasonalModifiers: { early_ice: +5, mid_winter: -4, late_ice: +6 },
      nightFeeder: false,
      moonSensitivity: 0.3,
      dayLengthSensitivity: 0.3
    },

    burbot: {
      id: 'burbot',
      name: 'Burbot (Eelpout)',
      icon: '🐍',
      color: '#4B5563', // Gray

      timePatterns: {
        evening: { hoursAfterSunset: 4, modifier: +15 },  // First 4 hours after sunset are PRIME
        earlyNight: { modifier: +12 },
        lateNight: { modifier: +8 },
        dawn: { offsetMinutes: -60, durationMinutes: 90, modifier: +5 },
        daytime: { modifier: -10 }
      },

      weatherWeights: {
        pressureTrend: 0.7,  // Less sensitive than most
        temperature: 0.6,    // They love cold
        cloudCover: 0.3,     // Don't care - they feed in dark
        precipitation: 1.2,  // Love storm activity at night
        wind: 0.5
      },

      cloudPreference: {
        overcast: 0,
        clear: 0  // Burbot feed at night regardless
      },

      education: {
        habits: 'Burbot are unique: they spawn in mid-late winter under ice at night and are very active after dark. The ultimate night-bite fish.',
        bestConditions: 'Evening into midnight (6 PM to 12 AM) is prime time. Falling barometer at night is ideal. Pre-spawn period (late Jan/Feb) is best.',
        winterBehavior: 'Burbot move shallow at night to feed, often in 5-20 feet. They are bottom-oriented and feed on fish and crayfish.',
        tipOfTheDay: 'Fish after dark with glow jigs and dead or live bait. Burbot hit hard and fight well. Delicious when cooked!'
      },

      seasonalModifiers: { early_ice: +3, mid_winter: +10, late_ice: -5 },
      nightFeeder: true,
      moonSensitivity: 1.0,
      dayLengthSensitivity: 0.3
    }
  };

  /**
   * Get profile for a specific species
   */
  function getProfile(speciesId) {
    return PROFILES[speciesId] || null;
  }

  /**
   * Get all species profiles as array
   */
  function getAllProfiles() {
    return Object.values(PROFILES);
  }

  /**
   * Get list of all species IDs
   */
  function getSpeciesIds() {
    return Object.keys(PROFILES);
  }

  /**
   * Public API
   */
  return {
    getProfile,
    getAllProfiles,
    getSpeciesIds,
    PROFILES  // Expose for direct access if needed
  };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SpeciesProfiles;
}

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding FLRanked database...");

  // Create achievements
  const achievements = await Promise.all([
    prisma.achievement.upsert({
      where: { name: "First Blood" },
      update: {},
      create: { name: "First Blood", description: "Win your first battle", icon: "⚔️", xpReward: 50 },
    }),
    prisma.achievement.upsert({
      where: { name: "Hot Streak" },
      update: {},
      create: { name: "Hot Streak", description: "Win 5 battles in a row", icon: "🔥", xpReward: 200 },
    }),
    prisma.achievement.upsert({
      where: { name: "Gold Rush" },
      update: {},
      create: { name: "Gold Rush", description: "Reach Gold rank", icon: "🥇", xpReward: 500 },
    }),
    prisma.achievement.upsert({
      where: { name: "Beat Machine" },
      update: {},
      create: { name: "Beat Machine", description: "Submit 50 beats", icon: "🎵", xpReward: 300 },
    }),
    prisma.achievement.upsert({
      where: { name: "Diamond Cutter" },
      update: {},
      create: { name: "Diamond Cutter", description: "Reach Diamond rank", icon: "💎", xpReward: 1000 },
    }),
    prisma.achievement.upsert({
      where: { name: "Master Producer" },
      update: {},
      create: { name: "Master Producer", description: "Reach Master rank", icon: "👑", xpReward: 2000 },
    }),
    prisma.achievement.upsert({
      where: { name: "Untouchable" },
      update: {},
      create: { name: "Untouchable", description: "Win 10 battles in a row", icon: "🛡️", xpReward: 500 },
    }),
    prisma.achievement.upsert({
      where: { name: "Century" },
      update: {},
      create: { name: "Century", description: "Win 100 battles", icon: "💯", xpReward: 1000 },
    }),
  ]);
  console.log(`✅ Created ${achievements.length} achievements`);

  // Create sample packs for Trap battles
  const samplePacks = await Promise.all([
    prisma.samplePack.create({
      data: {
        name: "Trap Essentials Vol. 1",
        genre: "Trap",
        files: [
          { name: "Synth_Lead_01.wav", url: "/samples/pack-1/Synth_Lead_01.wav", type: "oneshot", label: "One-Shot 1 (Synth Lead)" },
          { name: "Pad_Dark_01.wav", url: "/samples/pack-1/Pad_Dark_01.wav", type: "oneshot", label: "One-Shot 2 (Dark Pad)" },
          { name: "Pluck_Bright_01.wav", url: "/samples/pack-1/Pluck_Bright_01.wav", type: "oneshot", label: "One-Shot 3 (Bright Pluck)" },
          { name: "Snare_Trap_01.wav", url: "/samples/pack-1/Snare_Trap_01.wav", type: "snare", label: "Snare" },
          { name: "808_Sub_01.wav", url: "/samples/pack-1/808_Sub_01.wav", type: "808", label: "808" },
          { name: "Kick_Hard_01.wav", url: "/samples/pack-1/Kick_Hard_01.wav", type: "kick", label: "Kick" },
          { name: "Perc_Rim_01.wav", url: "/samples/pack-1/Perc_Rim_01.wav", type: "perc", label: "Perc" },
          { name: "HiHat_Closed_01.wav", url: "/samples/pack-1/HiHat_Closed_01.wav", type: "hihat", label: "Hi-Hat" },
          { name: "Clap_Layered_01.wav", url: "/samples/pack-1/Clap_Layered_01.wav", type: "clap", label: "Clap" },
          { name: "OpenHat_01.wav", url: "/samples/pack-1/OpenHat_01.wav", type: "openhat", label: "Open Hat" },
        ],
      },
    }),
    prisma.samplePack.create({
      data: {
        name: "Trap Essentials Vol. 2",
        genre: "Trap",
        files: [
          { name: "Strings_Haunting_01.wav", url: "/samples/pack-2/Strings_Haunting_01.wav", type: "oneshot", label: "One-Shot 1 (Haunting Strings)" },
          { name: "Synth_Arp_01.wav", url: "/samples/pack-2/Synth_Arp_01.wav", type: "oneshot", label: "One-Shot 2 (Synth Arp)" },
          { name: "Pad_Ambient_01.wav", url: "/samples/pack-2/Pad_Ambient_01.wav", type: "oneshot", label: "One-Shot 3 (Ambient Pad)" },
          { name: "Snare_Crack_01.wav", url: "/samples/pack-2/Snare_Crack_01.wav", type: "snare", label: "Snare" },
          { name: "808_Distorted_01.wav", url: "/samples/pack-2/808_Distorted_01.wav", type: "808", label: "808" },
          { name: "Kick_Punchy_01.wav", url: "/samples/pack-2/Kick_Punchy_01.wav", type: "kick", label: "Kick" },
          { name: "Perc_Conga_01.wav", url: "/samples/pack-2/Perc_Conga_01.wav", type: "perc", label: "Perc" },
          { name: "HiHat_Roll_01.wav", url: "/samples/pack-2/HiHat_Roll_01.wav", type: "hihat", label: "Hi-Hat" },
          { name: "Clap_Tight_01.wav", url: "/samples/pack-2/Clap_Tight_01.wav", type: "clap", label: "Clap" },
          { name: "OpenHat_Washy_01.wav", url: "/samples/pack-2/OpenHat_Washy_01.wav", type: "openhat", label: "Open Hat" },
        ],
      },
    }),
    prisma.samplePack.create({
      data: {
        name: "Trap Essentials Vol. 3",
        genre: "Trap",
        files: [
          { name: "Pluck_Bell_01.wav", url: "/samples/pack-3/Pluck_Bell_01.wav", type: "oneshot", label: "One-Shot 1 (Bell Pluck)" },
          { name: "Pad_Choir_01.wav", url: "/samples/pack-3/Pad_Choir_01.wav", type: "oneshot", label: "One-Shot 2 (Choir Pad)" },
          { name: "Synth_Flute_01.wav", url: "/samples/pack-3/Synth_Flute_01.wav", type: "oneshot", label: "One-Shot 3 (Flute Synth)" },
          { name: "Snare_Tight_01.wav", url: "/samples/pack-3/Snare_Tight_01.wav", type: "snare", label: "Snare" },
          { name: "808_Clean_01.wav", url: "/samples/pack-3/808_Clean_01.wav", type: "808", label: "808" },
          { name: "Kick_Deep_01.wav", url: "/samples/pack-3/Kick_Deep_01.wav", type: "kick", label: "Kick" },
          { name: "Perc_Snap_01.wav", url: "/samples/pack-3/Perc_Snap_01.wav", type: "perc", label: "Perc" },
          { name: "HiHat_Crisp_01.wav", url: "/samples/pack-3/HiHat_Crisp_01.wav", type: "hihat", label: "Hi-Hat" },
          { name: "Clap_Wide_01.wav", url: "/samples/pack-3/Clap_Wide_01.wav", type: "clap", label: "Clap" },
          { name: "OpenHat_Sizzle_01.wav", url: "/samples/pack-3/OpenHat_Sizzle_01.wav", type: "openhat", label: "Open Hat" },
        ],
      },
    }),
  ]);
  console.log(`✅ Created ${samplePacks.length} sample packs`);

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

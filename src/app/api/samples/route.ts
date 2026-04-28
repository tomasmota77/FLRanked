import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const samplesPath = path.join(process.cwd(), "public", "samples");
  
  if (!fs.existsSync(samplesPath)) {
    return NextResponse.json({ error: "Samples directory not found" }, { status: 404 });
  }

  const categories = ["808", "perc", "snare", "clap", "vox", "hihat", "openhat", "kick", "oneshot"];
  const pool: any = {};

  categories.forEach((category) => {
    const categoryPath = path.join(samplesPath, category);
    if (fs.existsSync(categoryPath) && fs.lstatSync(categoryPath).isDirectory()) {
      const files = fs.readdirSync(categoryPath)
        .filter(file => file.endsWith(".wav") || file.endsWith(".mp3") || file.endsWith(".ogg"))
        .map(file => ({
          name: `${category}/${file}`,
          type: category,
          label: category.charAt(0).toUpperCase() + category.slice(1) // Generic label
        }));
      pool[category] = files;
    } else {
      pool[category] = [];
    }
  });

  return NextResponse.json(pool);
}

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const file = searchParams.get("file");

  if (!file) {
    return NextResponse.json({ error: "No file specified" }, { status: 400 });
  }

  // Prevent directory traversal attacks
  // Prevent directory traversal attacks
  const normalizedFile = path.normalize(file).replace(/^(\.\.(\/|\\|$))+/, '');
  
  // Determine the base directory (samples or uploads)
  let baseDir = "samples";

  if (normalizedFile.startsWith("uploads/") || normalizedFile.startsWith("uploads\\")) {
    baseDir = ""; // uploads is already in the path
  }

  const filePath = path.join(process.cwd(), "public", baseDir, normalizedFile);

  if (!fs.existsSync(filePath) || fs.lstatSync(filePath).isDirectory()) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const stat = fs.statSync(filePath);
  const fileStream = fs.createReadStream(filePath);
  const filename = path.basename(filePath);

  // Determine content type
  const ext = path.extname(filename).toLowerCase();
  let contentType = "application/octet-stream";
  if (ext === ".wav") contentType = "audio/wav";
  else if (ext === ".mp3") contentType = "audio/mpeg";
  else if (ext === ".ogg") contentType = "audio/ogg";

  // Convert Node.js stream to Web stream for Next.js
  const stream = new ReadableStream({
    start(controller) {
      fileStream.on("data", (chunk) => controller.enqueue(chunk));
      fileStream.on("end", () => controller.close());
      fileStream.on("error", (err) => controller.error(err));
    }
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": stat.size.toString(),
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Accept-Ranges": "bytes", // Crucial for IDM and resume support
    },
  });
}

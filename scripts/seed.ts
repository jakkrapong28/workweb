import { config } from "dotenv";

// Load env BEFORE importing anything that reads process.env at module load time.
// (Static imports are hoisted, so DB modules are imported dynamically below.)
config({ path: ".env.local" });

async function seed() {
  const bcrypt = (await import("bcryptjs")).default;
  const mongoose = (await import("mongoose")).default;
  const { dbConnect } = await import("../src/lib/mongodb");
  const Admin = (await import("../src/models/Admin")).default;
  const Blog = (await import("../src/models/Blog")).default;
  const Comment = (await import("../src/models/Comment")).default;

  await dbConnect();

  // --- Admin ---
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "admin1234";
  const passwordHash = await bcrypt.hash(password, 10);

  await Admin.findOneAndUpdate(
    { username },
    { username, passwordHash },
    { upsert: true, returnDocument: "after" }
  );
  console.log(`✓ admin: ${username} / ${password}`);

  // --- Blogs (idempotent: clear then insert sample data) ---
  await Blog.deleteMany({});
  await Comment.deleteMany({});

  const TOTAL = 27; // ทั้งหมด
  const PUBLISHED = 25; // เผยแพร่ (ที่เหลือเป็นฉบับร่างไว้ทดสอบ publish/unpublish)
  const samples = Array.from({ length: TOTAL }).map((_, i) => {
    const n = i + 1;
    const title = `บทความตัวอย่างที่ ${n}`;
    return {
      title,
      slug: `sample-post-${n}`,
      excerpt: `นี่คือเนื้อหาอย่างย่อของบทความที่ ${n} สำหรับทดสอบหน้ารวมและการแบ่งหน้า`,
      content: `เนื้อหาเต็มของบทความที่ ${n}\n\nย่อหน้าที่สองของบทความสำหรับทดสอบการแสดงผล`,
      published: n <= PUBLISHED,
      viewCount: Math.floor(Math.random() * 200),
      images: [],
      // ไล่เวลาให้บทความที่ 1 ใหม่สุด → เรียง 1, 2, 3, ... (newest-first)
      createdAt: new Date(Date.now() - (n - 1) * 60_000),
    };
  });

  // timestamps: false กันไม่ให้ Mongoose เขียนทับ createdAt ที่กำหนดเอง
  const blogs = await Blog.insertMany(samples, { timestamps: false });
  console.log(`✓ blogs: ${blogs.length} (published ${PUBLISHED} + draft ${TOTAL - PUBLISHED})`);

  // Comments are intentionally NOT seeded — submit & moderate them yourself
  // to test the full flow (submit → pending → admin approve → shown).
  console.log("✓ comments: 0 (ทดสอบเองได้เลย)");

  await mongoose.disconnect();
  console.log("Done.");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});

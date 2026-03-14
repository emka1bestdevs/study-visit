import { PrismaClient } from "@prisma/client";
import slugify from "slugify";

const prisma = new PrismaClient();

const DESIGN_PROGRAMS = ["Graphic Design", "Interior Design", "Architecture", "Fashion Design"];

async function main() {
  const universities = await prisma.university.findMany({
    select: { id: true, name: true },
    take: 60
  });

  console.log(`Adding Design faculty to ${universities.length} universities...`);

  let added = 0;
  for (const uni of universities) {
    try {
      const faculty = await prisma.faculty.upsert({
        where: {
          universityId_name: {
            universityId: uni.id,
            name: "Faculty of Design and Architecture"
          }
        },
        create: {
          universityId: uni.id,
          name: "Faculty of Design and Architecture"
        },
        update: {}
      });

      for (const programName of DESIGN_PROGRAMS) {
        const slug = slugify(programName, { lower: true, strict: true, trim: true });
        await prisma.program.upsert({
          where: { facultyId_slug: { facultyId: faculty.id, slug } },
          create: { facultyId: faculty.id, name: programName, slug },
          update: {}
        });
      }
      added++;
    } catch {
      // skip duplicates
    }
  }

  console.log(`Done. Added design faculty to ${added} universities.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

import {
  PrismaClient,
  Role,
  ChessCategory,
  ResourceType,
} from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcryptjs from "bcryptjs";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in .env");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Limpiando la base de datos...");

  // 1. Limpieza previa en orden para evitar fallos de Foreign Keys
  await prisma.review.deleteMany();
  await prisma.notationScan.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.teacherProfile.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  console.log("🌱 Insertando nuevos usuarios y perfiles...");

  // 2. Hash de contraseñas desde el .env (con fallback seguro para dev)
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!";
  const teacherPassword = process.env.TEACHER_PASSWORD || "Teacher123!";
  const studentPassword = process.env.STUDENT_PASSWORD || "Student123!";

  const hashedAdminPassword = bcryptjs.hashSync(adminPassword, 10);
  const hashedTeacherPassword = bcryptjs.hashSync(teacherPassword, 10);
  const hashedStudentPassword = bcryptjs.hashSync(studentPassword, 10);

  // 3. Crear Administrador
  const adminEmail = process.env.ADMIN_EMAIL || "admin@chezz.com";

  const admin = await prisma.user.create({
    data: {
      email: adminEmail.toLowerCase(),
      name: "Super Admin Chezz",
      password: hashedAdminPassword,
      role: Role.ADMIN,
      image: "/user.JPG",
    },
  });

  console.log(`✅ Admin creado: ${admin.email}`);

  // 4. Crear Profesor con su Perfil
  const teacher = await prisma.user.create({
    data: {
      email: "gm.profesor@chezz.com",
      name: "GM Magnus Test",
      password: hashedTeacherPassword,
      role: Role.TEACHER,
      image: "/user.JPG",
      teacherProfile: {
        create: {
          fideTitle: "GM",
          fideId: "12345678",
          peakRating: 2850,
          bio: "Gran Maestro Internacional especializado en aperturas y finales.",
        },
      },
    },
    include: {
      teacherProfile: true,
    },
  });

  console.log(
    `✅ Profesor creado: ${teacher.name} (${teacher.teacherProfile?.fideTitle})`,
  );

  // 5. Crear Alumno de prueba
  const student = await prisma.user.create({
    data: {
      email: "alumno@chezz.com",
      name: "Tactics Student",
      password: hashedStudentPassword,
      role: Role.STUDENT,
      image: "/user.JPG",
    },
  });

  console.log(`✅ Alumno de prueba creado: ${student.email}`);

  // 6. Insertar recursos cumpliendo con los campos obligatorios del Schema (apuntando a recursos locales en /public)
  console.log("🌱 Insertando recursos y lecciones iniciales...");

  await prisma.resource.createMany({
    data: [
      {
        id: "res-tactical-01",
        title: "Mastering Tactical Patterns & Combinations",
        slug: "tactical-patterns-1200", // Coincide exactamente con la URL de prueba
        description:
          "Aprende los patrones tácticos esenciales para subir de nivel de 1200 a 1400 Elo.",
        category: ChessCategory.TACTICS,
        type: ResourceType.BUNDLE,
        minElo: 1200,
        maxElo: 1400,
        hasHomework: true,
        fileUrl: "/cv.pdf",
        previewUrl: "/learn1.png",
        price: 19.99,
        isPublished: true,
        teacherId: teacher.teacherProfile!.id,
      },
      {
        id: "res-pawn-02",
        title: "Advanced Pawn Structures & Passed Pawns",
        slug: "advanced-pawn-structures-1600",
        description:
          "Domina las estructuras de peones avanzadas y el manejo de peones pasados.",
        category: ChessCategory.STRATEGY,
        type: ResourceType.PDF_LESSON,
        minElo: 1600,
        maxElo: 1800,
        hasHomework: true,
        fileUrl: "/cv.pdf",
        previewUrl: "/learn.png",
        price: 24.99,
        isPublished: true,
        teacherId: teacher.teacherProfile!.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log("🚀 ¡Seed ejecutado correctamente!");
}

// Bloque de seguridad para evitar ejecución accidental en Producción
(() => {
  if (process.env.NODE_ENV === "production") {
    console.log("⚠️ Seeding cancelado: Entorno configurado en Producción.");
    return;
  }

  main()
    .catch((e) => {
      console.error("❌ Error durante el seeding:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
})();

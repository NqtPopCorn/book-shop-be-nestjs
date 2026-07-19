import { PrismaClient, Prisma } from "@prisma/client";
import { fakerVI as faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding sample data (mock)...");

  // 1. Create Mock Users
  const users = [];
  for (let i = 0; i < 9; i++) {
    const email = faker.internet.email();
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        password: "$2b$10$SomeHashedPasswordHere.ThisIsAMock",
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        role: "CUSTOMER",
      },
    });
    users.push(user);
  }
  console.log("Created 9 mock customer users");

  // 2. Create Categories
  const categories = [];
  const categoryNames = [
    "Văn học",
    "Kinh tế",
    "Tâm lý - Kỹ năng sống",
    "Thiếu nhi",
    "Giáo khoa",
    "Ngoại ngữ",
  ];
  for (const name of categoryNames) {
    const category = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    categories.push(category);
  }
  console.log("Created categories");

  // 4. Create Books
  const books = [];
  let variants = []; // Keep track of all variants for order seeding
  for (let i = 0; i < 30; i++) {
    const formatCount = faker.helpers.arrayElement([1, 2]); // Some books have 1 format, some have 2
    const formats = ["Bìa mềm", "Bìa cứng"];

    const bookVariantsData = [];
    for (let j = 0; j < formatCount; j++) {
      bookVariantsData.push({
        sku: faker.string.alphanumeric(8).toUpperCase(),
        isbn: faker.string.uuid(),
        format: formats[j],
        listPrice: faker.number.int({ min: 50, max: 300 }) * 1000,
        sellingPrice: faker.number.int({ min: 30, max: 250 }) * 1000,
        stock: faker.number.int({ min: 10, max: 200 }),
        weight: faker.number.int({ min: 100, max: 1000 }),
        dimensions: faker.helpers.arrayElement([
          "14 x 20 cm",
          "16 x 24 cm",
          "13 x 19 cm",
        ]),
        pages: faker.number.int({ min: 100, max: 500 }),
        imageUrl: `https://picsum.photos/seed/${faker.string.alphanumeric(4)}/300/400`,
      });
    }

    const book = await prisma.book.create({
      data: {
        title: faker.lorem.sentence({ min: 3, max: 7 }),
        description: faker.lorem.paragraphs(2),
        categoryId: faker.helpers.arrayElement(categories).id,
        authors: [faker.person.fullName()],
        publisher: faker.helpers.arrayElement([
          "NXB Trẻ",
          "NXB Kim Đồng",
          "Nhã Nam",
          "Alphabooks",
          "NXB Tổng hợp",
        ]),
        translators: faker.helpers.arrayElement([
          null,
          [faker.person.fullName()],
        ]) as Prisma.InputJsonValue,
        provider: faker.helpers.arrayElement([
          "FAHASA",
          "Tiki Trading",
          "NXB Trẻ",
        ]),
        publishYear: faker.number.int({ min: 2010, max: 2024 }),
        language: faker.helpers.arrayElement(["Tiếng Việt", "Tiếng Anh"]),
        variants: {
          create: bookVariantsData,
        },
      },
      include: {
        variants: true,
      },
    });
    books.push(book);
    variants.push(...book.variants);

    // Create a batch for each variant
    for (const variant of book.variants) {
      await prisma.batch.create({
        data: {
          code: `BATCH-${faker.string.alphanumeric(6).toUpperCase()}`,
          quantity: variant.stock,
          variantId: variant.id,
        },
      });
    }
  }
  console.log("Created 30 books with batches");

  // 5. Create Promotions
  const promotions = [];
  for (let i = 0; i < 3; i++) {
    const code = `PROMO${faker.string.alphanumeric(4).toUpperCase()}`;
    const promo = await prisma.promotion.upsert({
      where: { code },
      update: {},
      create: {
        code,
        percentage: faker.number.int({ min: 5, max: 30 }),
        maxUses: faker.number.int({ min: 50, max: 500 }),
        active: true,
      },
    });
    promotions.push(promo);
  }
  console.log("Created 3 promotions");

  // 6. Create Mock Orders
  const orders = [];
  for (let i = 0; i < 10; i++) {
    const user = faker.helpers.arrayElement(users);
    const var1 = faker.helpers.arrayElement(variants);
    let var2 = faker.helpers.arrayElement(variants);
    while (var1.id === var2.id) {
      var2 = faker.helpers.arrayElement(variants);
    }
    const status = faker.helpers.arrayElement([
      "PENDING",
      "CONFIRMED",
      "SHIPPING",
      "COMPLETED",
      "CANCELLED",
    ]);

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        status: status as any,
        total: Number(var1.sellingPrice) + Number(var2.sellingPrice) * 2,
        items: {
          create: [
            { variantId: var1.id, quantity: 1, unitPrice: var1.sellingPrice },
            { variantId: var2.id, quantity: 2, unitPrice: var2.sellingPrice },
          ],
        },
      },
    });
    orders.push(order);
  }
  console.log("Created 10 mock orders");

  console.log("Sample seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

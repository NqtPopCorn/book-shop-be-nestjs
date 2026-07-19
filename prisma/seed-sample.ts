import { PrismaClient } from '@prisma/client';
import { fakerVI as faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding sample data (mock)...');

  // 1. Create Mock Users
  const users = [];
  for (let i = 0; i < 9; i++) {
    const email = faker.internet.email();
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        password: '$2b$10$SomeHashedPasswordHere.ThisIsAMock',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        role: 'CUSTOMER',
      },
    });
    users.push(user);
  }
  console.log('Created 9 mock customer users');

  // 2. Create Categories
  const categories = [];
  const categoryNames = ['Văn học', 'Kinh tế', 'Tâm lý - Kỹ năng sống', 'Thiếu nhi', 'Giáo khoa', 'Ngoại ngữ'];
  for (const name of categoryNames) {
    const category = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    categories.push(category);
  }
  console.log('Created categories');

  // 3. Create Authors, Publishers, Translators
  const authors = [];
  for (let i = 0; i < 15; i++) {
    const author = await prisma.author.create({
      data: {
        name: faker.person.fullName(),
        biography: faker.lorem.paragraph(),
      },
    });
    authors.push(author);
  }

  const publishers = [];
  const pubNames = ['NXB Trẻ', 'NXB Kim Đồng', 'Nhã Nam', 'Alphabooks', 'NXB Tổng hợp'];
  for (const name of pubNames) {
    const publisher = await prisma.publisher.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    publishers.push(publisher);
  }

  const translators = [];
  const tranNames = ['Trịnh Lữ', 'Đinh Tiến', 'Nguyễn Bích Lan', 'Lý Lan', 'Hoàng Nhụy'];
  for (const name of tranNames) {
    const translator = await prisma.translator.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    translators.push(translator);
  }
  console.log('Created authors, publishers, translators');

  // 4. Create Books
  const books = [];
  for (let i = 0; i < 30; i++) {
    const book = await prisma.book.create({
      data: {
        title: faker.lorem.sentence({ min: 3, max: 7 }),
        description: faker.lorem.paragraphs(2),
        isbn: faker.string.uuid(),
        price: faker.number.int({ min: 30, max: 300 }) * 1000,
        stock: faker.number.int({ min: 10, max: 200 }),
        categoryId: faker.helpers.arrayElement(categories).id,
        authorId: faker.helpers.arrayElement(authors).id,
        publisherId: faker.helpers.arrayElement(publishers).id,
        translatorId: faker.helpers.arrayElement([null, ...translators])?.id,
      },
    });
    books.push(book);

    // Create a batch for each book
    await prisma.batch.create({
      data: {
        code: `BATCH-${faker.string.alphanumeric(6).toUpperCase()}`,
        quantity: book.stock,
        bookId: book.id,
      },
    });
  }
  console.log('Created 30 books with batches');

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
  console.log('Created 3 promotions');

  // 6. Create Mock Orders
  const orders = [];
  for (let i = 0; i < 10; i++) {
    const user = faker.helpers.arrayElement(users);
    const book1 = faker.helpers.arrayElement(books);
    const book2 = faker.helpers.arrayElement(books);
    const status = faker.helpers.arrayElement(["PENDING", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED"]);
    
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        status: status as any,
        total: Number(book1.price) + Number(book2.price) * 2,
        items: {
          create: [
            { bookId: book1.id, quantity: 1, unitPrice: book1.price },
            { bookId: book2.id, quantity: 2, unitPrice: book2.price }
          ]
        }
      }
    });
    orders.push(order);
  }
  console.log('Created 10 mock orders');

  console.log('Sample seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

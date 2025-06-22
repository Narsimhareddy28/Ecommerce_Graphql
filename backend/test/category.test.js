import request from 'supertest';

let app;

beforeAll(async () => {
  const mod = await import('../server.js');
    app = mod.default;

    
});
describe('Category Management', () => {

it('should allow admin to add a category', async () => {
  // First, register and login as admin
  const adminRes = await request(app)
    .post('/graphql')
    .send({
      query: `
        mutation {
          register(name: "Admin User", email: "admin@example.com", password: "adminpass", role: "admin") {
            token
          }
        }
      `
    });

  const adminToken = adminRes.body.data.register.token;

  // Now create a category using that token
  const res = await request(app)
    .post('/graphql')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      query: `
        mutation {
          addCategory(name: "Tech", description: "Technology items") {
            id
            name
            description
          }
        }
      `
    });

  expect(res.statusCode).toBe(200);
  expect(res.body.data.addCategory.name).toBe("Tech");
});

it('should allow seller to add a product', async () => {
  // 1. Register and login a seller
  const sellerRes = await request(app)
    .post('/graphql')
    .send({
      query: `
        mutation {
          register(name: "Seller", email: "seller@example.com", password: "sellerpass", role: "seller") {
            token
          }
        }
      `
    });

  const sellerToken = sellerRes.body.data.register.token;

  // 2. Get the category ID from previous test
  const categoriesRes = await request(app)
    .post('/graphql')
    .send({
      query: `
        query {
          getAllCategories {
            id
            name
          }
        }
      `
    });

  const categoryId = categoriesRes.body.data.getAllCategories[0].id;
    console.log('Category ID:', categoryId);
  // 3. Add product
  const res = await request(app)
    .post('/graphql')
    .set('Authorization', `Bearer ${sellerToken}`)
    .send({
       query: `
        mutation {
          addProduct(
            name: "Smartphone",
            description: "Latest model",
            price: 699.99,
            images: ["img1.jpg", "img2.jpg"],
            category: "${categoryId}"
          ) {
            id
            name
            price
            category{
              id
              name

                description
                
              }
            sellerId
          }
        }
      `
    });

  expect(res.statusCode).toBe(200);
  expect(res.body.data.addProduct.name).toBe("Smartphone");
});


})
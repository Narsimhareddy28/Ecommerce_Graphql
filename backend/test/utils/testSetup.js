import request from 'supertest';

export async function loadApp() {
  const mod = await import('../../server.js');
  return mod.default;
}


export async function registerUser(app, role = 'customer') {
  const email = `${role}${Date.now()}@test.com`;

  const res = await request(app).post('/graphql').send({
    query: `
      mutation {
        register(name: "${role}", email: "${email}", password: "123456", role: "${role}") {
          token
        }
      }
    `
  });

  return res.body.data.register.token;
}

export async function addCategory(app, token) {
  const res = await request(app)
    .post('/graphql')
    .set('Authorization', `Bearer ${token}`)
    .send({
      query: `
        mutation {
          addCategory(name: "Test Category", description: "Testing") {
            id
          }
        }
      `
    });

  return res.body.data.addCategory.id;
}

export async function addProduct(app, token, categoryId) {
  const res = await request(app)
    .post('/graphql')
    .set('Authorization', `Bearer ${token}`)
    .send({
      query: `
        mutation {
          addProduct(
            name: "Reusable Product",
            description: "From utils",
            price: 100,
            images: ["img.jpg"],
            category: "${categoryId}"
          ) {
            id
          }
        }
      `
    });

  return res.body.data.addProduct.id;
}
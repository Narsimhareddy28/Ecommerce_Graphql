import request from "supertest";
import { loadApp, registerUser, addCategory, addProduct } from './utils/testSetup.js';

let app;
let productId; 
let customerToken;
beforeAll(async()=>{
    app = await loadApp();
    const sellerToken = await registerUser(app, 'seller');
  customerToken = await registerUser(app, 'customer');

  const categoryId = await addCategory(app, sellerToken);
  productId = await addProduct(app, sellerToken, categoryId);

    console.log('Seller Token:', sellerToken);
    console.log('Customer Token:', customerToken);
    console.log('Category ID:', categoryId);
  console.log('Product ID:', productId);


});
describe('Order Test', () => {
  it('should create an order', async () => {
    const res = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        query: `
      mutation {
        createOrder(products: [{ product: "${productId}", quantity: 2 }]) {
          id
          products {
            product {
              id
              name
            }
            quantity
          }
        }
      }
    `
      });
    console.log('GraphQL Response:', JSON.stringify(res.body, null, 2));

    expect(res.body.data.createOrder).toBeDefined();
    expect(res.body.data.createOrder.products[0].quantity).toBe(2);
  });
});
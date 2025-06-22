import request from 'supertest';

let app;

beforeAll(async () => {
  const mod = await import('../server.js');
  app = mod.default;
});
describe('User Authentication', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/graphql')
      .send({
        query: `
          mutation {
            register(name: "Test User", email: "test@example.com", password: "123456", role: "customer") {
              id
              name
              email
              role
              token
            }
          }
        `
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.register.email).toBe("test@example.com");
    expect(res.body.data.register.token).toBeDefined();
  });


 it('should log in an existing user', async () => {
    const res = await request(app)
      .post('/graphql')
      .send({
        query: `
          mutation {
            login(email: "test@example.com", password: "123456") {
              id
              name
              role
              token
            }
          }
        `
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.login.token).toBeDefined();
    expect(res.body.data.login.role).toBe("customer");
  });
});

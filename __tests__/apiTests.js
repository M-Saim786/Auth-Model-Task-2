const request = require('supertest');
const app = require('../index'); // Adjust the path to your server file

const email = "saim@yopmail.com"
const resetToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjY4NzBlMjVjN2NiNWJlOTk3NTIzMmMwIiwiaWF0IjoxNzIxODk4MjI5LCJleHAiOjE3MjE5MDU0Mjl9.-VdpkGoKARuakQt0ZFEck1oGooVOu7jZT4-aXvC4C3g"

const otpToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjZhMjE4ZTE3OWE3MjI5ODBjMTI5YWIwIiwiaWF0IjoxNzIxODk5MjM0LCJleHAiOjE3MjE5MDY0MzR9.CMCXth6F-5ieZcaV75KQgb9Q9Dn-EH5T9E-qRkRnjvw"

const password = "newpassword123"




describe('API Routes', () => {

    let server;
    beforeAll((done) => {
        const port = 4000; // Use a different port for testing
        server = app.listen(port, () => {
            global.agent = request.agent(server); // Use a global agent to reuse the same connection
            done();
        });
    });

    afterAll(() => {
        server.close();
    });

    it('should return 200 on the base route', async () => {
        const response = await request(server).get('/');
        expect(response.status).toBe(200);
        expect(response.body).toBe("Welcome Auth App is working");
    });

    it('should sign up a user', async () => {
        const response = await request(server)
            .post('/user/signUp')
            .send({
                email: 'testuser@yopmail.com',
                password: 'password123'
            });
        expect(response.status).toBe(200); // Adjust according to your actual status code
        expect(response.body).toHaveProperty('token');
    }, 10000);

    it('should verify OTP', async () => {
        const response = await request(server)
            .post('/user/verifyOtp')
            .set('Authorization', `Bearer ${otpToken}`)
            .send({
                otp: "8538"
            });
        expect(response.status).toBe(200); // Adjust according to your actual status code
        expect(response.body).toHaveProperty('message', 'OTP verified');
    });

    it('should log in a user', async () => {
        const response = await request(server)
            .post('/user/login')
            .send({
                email: email,
                password: password
            });
        expect(response.status).toBe(200); // Adjust according to your actual status code
        expect(response.body).toHaveProperty('token');
    }, 20000);


    it('should handle forgot password', async () => {
        const response = await request(server)
            .post('/user/forgetPassword')
            .send({
                email: 'saim@yopmail.com'
            });
        expect(response.status).toBe(200); // Adjust according to your actual status code
        expect(response.body).toHaveProperty('message', `Email sent to saim@yopmail.com`);
    }, 10000); // Increase timeout to 10 seconds


    it('should reset password', async () => {
        const response = await request(server)
            .post('/user/resetPassword')
            .set('Authorization', `Bearer ${resetToken}`)
            .send({
                // email: 'saim@yopmail.com',
                password: password,
            });
        expect(response.status).toBe(200); // Adjust according to your actual status code
        expect(response.body).toHaveProperty('message', 'Password updated successfully');
    });
});

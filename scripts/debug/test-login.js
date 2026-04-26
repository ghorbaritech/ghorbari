
const { adminSignIn } = require('./src/app/adminlogin/actions');

async function testLogin() {
    const formData = new FormData();
    formData.append('email', 'admin@ghorbari.com');
    formData.append('password', 'password123');

    console.log('Testing adminSignIn...');
    try {
        const result = await adminSignIn(formData);
        console.log('Result:', result);
    } catch (error) {
        console.error('Crash:', error);
    }
}

testLogin();

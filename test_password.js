const bcrypt = require('bcryptjs');

async function test() {
  const password = 'aaa@1111';
  const hash = await bcrypt.hash(password, 10);
  console.log('Password:', password);
  console.log('Hash:', hash);
  
  const isValid = await bcrypt.compare(password, hash);
  console.log('Valid:', isValid);
}

test();

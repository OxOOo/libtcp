/// <reference path="../typings/index.d.ts" />

require('./test_lib');
import start_server_client = require('./start_server_client');

async function test() {
  var options = await start_server_client({
     compress: 'zlib',
     crypto: [
       {
         algorithm: 'AES-256-CBC',
         secret_key: 'hahaha'
       }
     ]
  });

  await require('./test_string')(options);
  await require('./test_object')(options);
  await require('./test_number')(options);
  await require('./test_boolean')(options);
  await require('./test_null')(options);
  await require('./test_buffer')(options);
  await require('./test_big_buffer')(options);
  await require('./test_array')(options);
  await require('./test_mix_object')(options);
  await require('./test_mix_array')(options);
  await require('./test_broadcast')(options);

  options.client.close();
  options.server.close();
}

async function run() {
  try {
    await test();
  } catch(e) {
    console.log('\n\n');
    console.log('Test Fail');
    console.log(e);
    process.exit(1);
    return;
  }
  console.log('Test OK');
  process.exit(0);
  return;
}

run();
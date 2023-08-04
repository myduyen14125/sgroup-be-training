const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: '127.0.0.1',
  port: '3306',
  user: 'root',
  password: 'hakiyuu004',
  database: 'sgroup',
}); 

// connection.connect(function (err) {
//     if (err) console.log("not connect");
//     console.log('Connected!');
// });

module.exports = connection;

// connection.connect(function(err) {
//     if (err) throw err;
//     console.log('Connected!');
// });
// connection.query('SELECT * FROM Item', function (err, rows) {
//    // if (err) throw err;
//     console.log(err);
//     console.log('Data received from DB:\n');
//     console.log(rows);
// });
// connection.end(function(err) {
//     if (err) throw err;
//     console.log('Connection closed!');
// });

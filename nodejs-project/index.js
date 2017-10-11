const express = require('express'),
      app = express(),
      mongoose = require('mongoose')

mongoose.connect('mongodb://mongodb/test')

var db = mongoose.connection

db.on('error', console.error.bind(console, 'database connection error:'));
db.once('open', function() {
  console.log('database connected');
});


app.get('/', (req, res) => {
  res.send('hello world')
})

app.listen(3000,() => {
  console.log('running at http://localhost:3000')
})
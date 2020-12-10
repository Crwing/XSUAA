var express = require('express');
var app = express();

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// Start server
app.listen(process.env.PORT || 3000, ()=>{});

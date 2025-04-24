const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/calendar', (req, res) => {
  res.json({
    message: 'Calendar data from Node.js backend',
    status: 'success'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; 
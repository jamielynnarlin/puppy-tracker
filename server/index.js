const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// POST endpoint to run PowerShell script
app.post('/run-script', (req, res) => {
  const { script } = req.body;
  if (!script) {
    return res.status(400).json({ error: 'No script provided' });
  }
  // Run PowerShell script
  exec(`powershell.exe -Command "${script}"`, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: stderr || error.message });
    }
    res.json({ output: stdout });
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

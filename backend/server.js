const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increased limit for base64 images
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Puppy Tracker API is running' });
});

// ==================== COMMANDS ENDPOINTS ====================

// Get all commands
app.get('/api/commands', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM commands ORDER BY age_week, id'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching commands:', error);
    res.status(500).json({ error: 'Failed to fetch commands' });
  }
});

// Get command by ID with logs
app.get('/api/commands/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const commandResult = await pool.query(
      'SELECT * FROM commands WHERE id = $1',
      [id]
    );
    
    if (commandResult.rows.length === 0) {
      return res.status(404).json({ error: 'Command not found' });
    }
    
    const pottyLogs = await pool.query(
      'SELECT * FROM potty_logs WHERE command_id = $1 ORDER BY date DESC, time DESC',
      [id]
    );
    
    const practiceLogs = await pool.query(
      'SELECT * FROM practice_logs WHERE command_id = $1 ORDER BY date DESC, time DESC',
      [id]
    );
    
    const command = {
      ...commandResult.rows[0],
      pottyLogs: pottyLogs.rows,
      practiceLogs: practiceLogs.rows
    };
    
    res.json(command);
  } catch (error) {
    console.error('Error fetching command:', error);
    res.status(500).json({ error: 'Failed to fetch command' });
  }
});

// Create or update command
app.post('/api/commands', async (req, res) => {
  try {
    const { id, name, practiced, lastPracticed, practicedBy, ageWeek } = req.body;
    
    if (id) {
      // Update existing command
      const result = await pool.query(
        `UPDATE commands 
         SET name = $1, practiced = $2, last_practiced = $3, practiced_by = $4, age_week = $5, updated_at = CURRENT_TIMESTAMP
         WHERE id = $6 
         RETURNING *`,
        [name, practiced, lastPracticed, practicedBy, ageWeek, id]
      );
      res.json(result.rows[0]);
    } else {
      // Create new command
      const result = await pool.query(
        `INSERT INTO commands (name, practiced, last_practiced, practiced_by, age_week)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [name, practiced, lastPracticed, practicedBy, ageWeek]
      );
      res.status(201).json(result.rows[0]);
    }
  } catch (error) {
    console.error('Error saving command:', error);
    res.status(500).json({ error: 'Failed to save command' });
  }
});

// Bulk upsert commands
app.post('/api/commands/bulk', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const commands = req.body.commands;
    const results = [];
    
    for (const cmd of commands) {
      if (cmd.id) {
        const result = await client.query(
          `UPDATE commands 
           SET name = $1, practiced = $2, last_practiced = $3, practiced_by = $4, age_week = $5, updated_at = CURRENT_TIMESTAMP
           WHERE id = $6 
           RETURNING *`,
          [cmd.name, cmd.practiced, cmd.lastPracticed, cmd.practicedBy, cmd.ageWeek, cmd.id]
        );
        results.push(result.rows[0]);
      } else {
        const result = await client.query(
          `INSERT INTO commands (name, practiced, last_practiced, practiced_by, age_week)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [cmd.name, cmd.practiced, cmd.lastPracticed, cmd.practicedBy, cmd.ageWeek]
        );
        results.push(result.rows[0]);
      }
    }
    
    await client.query('COMMIT');
    res.json(results);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error bulk saving commands:', error);
    res.status(500).json({ error: 'Failed to bulk save commands' });
  } finally {
    client.release();
  }
});

// ==================== POTTY LOGS ENDPOINTS ====================

// Add potty log
app.post('/api/potty-logs', async (req, res) => {
  try {
    const { commandId, type, time, location, loggedBy, date } = req.body;
    
    const result = await pool.query(
      `INSERT INTO potty_logs (command_id, type, time, location, logged_by, date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [commandId, type, time, location, loggedBy, date]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding potty log:', error);
    res.status(500).json({ error: 'Failed to add potty log' });
  }
});

// Get potty logs by command
app.get('/api/potty-logs/command/:commandId', async (req, res) => {
  try {
    const { commandId } = req.params;
    const result = await pool.query(
      'SELECT * FROM potty_logs WHERE command_id = $1 ORDER BY date DESC, time DESC',
      [commandId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching potty logs:', error);
    res.status(500).json({ error: 'Failed to fetch potty logs' });
  }
});

// ==================== PRACTICE LOGS ENDPOINTS ====================

// Add practice log
app.post('/api/practice-logs', async (req, res) => {
  try {
    const { commandId, date, time, attempts, successes, distractions, reliability, notes, loggedBy } = req.body;
    
    const result = await pool.query(
      `INSERT INTO practice_logs (command_id, date, time, attempts, successes, distractions, reliability, notes, logged_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [commandId, date, time, attempts, successes, distractions, reliability, notes, loggedBy]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding practice log:', error);
    res.status(500).json({ error: 'Failed to add practice log' });
  }
});

// Get practice logs by command
app.get('/api/practice-logs/command/:commandId', async (req, res) => {
  try {
    const { commandId } = req.params;
    const result = await pool.query(
      'SELECT * FROM practice_logs WHERE command_id = $1 ORDER BY date DESC, time DESC',
      [commandId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching practice logs:', error);
    res.status(500).json({ error: 'Failed to fetch practice logs' });
  }
});

// ==================== MILESTONES ENDPOINTS ====================

// Get all milestones
app.get('/api/milestones', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM milestones ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching milestones:', error);
    res.status(500).json({ error: 'Failed to fetch milestones' });
  }
});

// Update milestone
app.put('/api/milestones/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed, photo, completedDate, completedBy } = req.body;
    
    const result = await pool.query(
      `UPDATE milestones 
       SET title = $1, completed = $2, photo = $3, completed_date = $4, completed_by = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 
       RETURNING *`,
      [title, completed, photo, completedDate, completedBy, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Milestone not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating milestone:', error);
    res.status(500).json({ error: 'Failed to update milestone' });
  }
});

// ==================== APPOINTMENTS ENDPOINTS ====================

// Get all appointments
app.get('/api/appointments', async (req, res) => {
  try {
    const appointmentsResult = await pool.query(
      'SELECT * FROM appointments ORDER BY date, time'
    );
    
    // Fetch documents for each appointment
    const appointments = await Promise.all(
      appointmentsResult.rows.map(async (apt) => {
        const docsResult = await pool.query(
          'SELECT document_data FROM appointment_documents WHERE appointment_id = $1',
          [apt.id]
        );
        return {
          ...apt,
          documents: docsResult.rows.map(doc => doc.document_data)
        };
      })
    );
    
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Create appointment
app.post('/api/appointments', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { 
      title, type, date, time, location, notes, reminder, completed, 
      createdBy, recurring, recurringType, nextDueDate, documents 
    } = req.body;
    
    const result = await client.query(
      `INSERT INTO appointments (title, type, date, time, location, notes, reminder, completed, created_by, recurring, recurring_type, next_due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [title, type, date, time, location, notes, reminder, completed, createdBy, recurring, recurringType, nextDueDate]
    );
    
    const appointmentId = result.rows[0].id;
    
    // Insert documents if any
    if (documents && documents.length > 0) {
      for (const doc of documents) {
        await client.query(
          'INSERT INTO appointment_documents (appointment_id, document_data) VALUES ($1, $2)',
          [appointmentId, doc]
        );
      }
    }
    
    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  } finally {
    client.release();
  }
});

// Update appointment
app.put('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;
    
    const result = await pool.query(
      `UPDATE appointments SET completed = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [completed, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// Delete appointment
app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM appointments WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

// ==================== WEIGHT ENTRIES ENDPOINTS ====================

// Get all weight entries
app.get('/api/weight-entries', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM weight_entries ORDER BY week_number');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching weight entries:', error);
    res.status(500).json({ error: 'Failed to fetch weight entries' });
  }
});

// Create weight entry
app.post('/api/weight-entries', async (req, res) => {
  try {
    const { date, weight, unit, weekNumber, loggedBy, notes } = req.body;
    
    const result = await pool.query(
      `INSERT INTO weight_entries (date, weight, unit, week_number, logged_by, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [date, weight, unit, weekNumber, loggedBy, notes]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating weight entry:', error);
    res.status(500).json({ error: 'Failed to create weight entry' });
  }
});

// Delete weight entry
app.delete('/api/weight-entries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM weight_entries WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Weight entry not found' });
    }
    
    res.json({ message: 'Weight entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting weight entry:', error);
    res.status(500).json({ error: 'Failed to delete weight entry' });
  }
});

// ==================== TOOTH LOGS ENDPOINTS ====================

// Get all tooth logs
app.get('/api/tooth-logs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tooth_logs ORDER BY date_noticed DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tooth logs:', error);
    res.status(500).json({ error: 'Failed to fetch tooth logs' });
  }
});

// Create tooth log
app.post('/api/tooth-logs', async (req, res) => {
  try {
    const { toothType, dateNoticed, notes, loggedBy } = req.body;
    
    const result = await pool.query(
      `INSERT INTO tooth_logs (tooth_type, date_noticed, notes, logged_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [toothType, dateNoticed, notes, loggedBy]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating tooth log:', error);
    res.status(500).json({ error: 'Failed to create tooth log' });
  }
});

// Delete tooth log
app.delete('/api/tooth-logs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM tooth_logs WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tooth log not found' });
    }
    
    res.json({ message: 'Tooth log deleted successfully' });
  } catch (error) {
    console.error('Error deleting tooth log:', error);
    res.status(500).json({ error: 'Failed to delete tooth log' });
  }
});

// ==================== GROOMING LOGS ENDPOINTS ====================

// Get all grooming logs
app.get('/api/grooming-logs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM grooming_logs ORDER BY date DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching grooming logs:', error);
    res.status(500).json({ error: 'Failed to fetch grooming logs' });
  }
});

// Create grooming log
app.post('/api/grooming-logs', async (req, res) => {
  try {
    const { activity, date, duration, tolerance, notes, loggedBy } = req.body;
    
    const result = await pool.query(
      `INSERT INTO grooming_logs (activity, date, duration, tolerance, notes, logged_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [activity, date, duration, tolerance, notes, loggedBy]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating grooming log:', error);
    res.status(500).json({ error: 'Failed to create grooming log' });
  }
});

// Delete grooming log
app.delete('/api/grooming-logs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM grooming_logs WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Grooming log not found' });
    }
    
    res.json({ message: 'Grooming log deleted successfully' });
  } catch (error) {
    console.error('Error deleting grooming log:', error);
    res.status(500).json({ error: 'Failed to delete grooming log' });
  }
});

// ==================== FEAR LOGS ENDPOINTS ====================

// Get all fear logs
app.get('/api/fear-logs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM fear_logs ORDER BY date DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching fear logs:', error);
    res.status(500).json({ error: 'Failed to fetch fear logs' });
  }
});

// Create fear log
app.post('/api/fear-logs', async (req, res) => {
  try {
    const { trigger, date, intensity, response, duration, notes, loggedBy } = req.body;
    
    const result = await pool.query(
      `INSERT INTO fear_logs (trigger, date, intensity, response, duration, notes, logged_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [trigger, date, intensity, response, duration, notes, loggedBy]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating fear log:', error);
    res.status(500).json({ error: 'Failed to create fear log' });
  }
});

// Delete fear log
app.delete('/api/fear-logs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM fear_logs WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fear log not found' });
    }
    
    res.json({ message: 'Fear log deleted successfully' });
  } catch (error) {
    console.error('Error deleting fear log:', error);
    res.status(500).json({ error: 'Failed to delete fear log' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Puppy Tracker API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  pool.end();
  process.exit(0);
});

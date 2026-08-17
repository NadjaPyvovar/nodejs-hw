import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pinoHttp from 'pino-http';

dotenv.config();

// defining server
const app = express();

const PORT = process.env.PORT ?? 3000;

// global middleware
app.use(cors());
app.use(express.json());
// adding extended pino-config
// app.use(pinoHttp());
app.use(
  pinoHttp({
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  }),
);


// home route
app.get('/', (req, res) => {
  res.json({
    message: 'Notes API is running',
  });
});

// request GET /notes
app.get('/notes', (req, res) => {
  res.status(200).json({
    message: 'Retrieved all notes',
  });
});

// request GET /notes/:noteId
app.get('/notes/:noteId', (req, res) => {
  const { noteId } = req.params;

  res.status(200).json({
    message: `Retrieved note with ID: ${noteId}`,
  });
});

// test error route
app.get('/test-error', () => {
  throw new Error('Simulated server error');
});

// 404 middleware
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

// 500 error middleware
app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    message: err.message,
  });
});

// start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

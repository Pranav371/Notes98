/**
 * Turso Database Configuration
 * 
 * This file contains the configuration for connecting to Turso database.
 * Replace these values with your actual Turso credentials before deploying.
 */

const tursoConfig = {
  // Your Turso database URL
  // Format: libsql://your-database-name.turso.io
  dbUrl: "libsql://notes-pranav98.turso.io",
  
  // Your Turso authentication token
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NDY0MjU3MjIsImlkIjoiMTI1M2EzZDEtOWU4Ni00NjcyLTk3NTQtY2M3MzBhYTRiZDllIiwicmlkIjoiYWM2ZTJjNWUtM2RjNy00ZTlkLThjMjAtYzYwNTE3MzRkNjA0In0.drumG84p8j5yBnitSKUQ6WVJdVJPgCy2e9hu3BtF4q6PHY6J6yC_Rs8oUJN9SSI4XX0xgqoCIXfqNPBncg6lAw",
};

export default tursoConfig; 
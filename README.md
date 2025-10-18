# User Relationship & Hobby Network

A full-stack application that manages users and their relationships, visualized as a dynamic graph using React Flow.

## Features

- **Interactive Graph Visualization**: Users are displayed as nodes with relationships as edges
- **Dynamic Node Types**: High-score nodes (popularity > 5) and low-score nodes (popularity ≤ 5)
- **User Management**: Create, read, update, and delete users
- **Relationship Management**: Connect and disconnect users
- **Hobby Management**: Drag and drop hobbies onto users
- **Popularity Scoring**: Automatic calculation based on friends and shared hobbies
- **Real-time Updates**: Graph updates dynamically as data changes

## Tech Stack

### Backend
- Node.js with Express and TypeScript
- MongoDB with Mongoose
- RESTful API with comprehensive error handling

### Frontend
- Next.js 14 with React
- React Flow for graph visualization
- Tailwind CSS for styling
- TypeScript for type safety

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example environment file
cp config.env .env

# Edit .env with your MongoDB connection string
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/user-network
# NODE_ENV=development
```

4. Start MongoDB (if running locally):
```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
```

5. Start the backend server:
```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

The backend API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the main project directory:
```bash
cd ..
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### Users
- `GET /api/users` - Fetch all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Relationships
- `POST /api/users/:id/link` - Create friendship
- `DELETE /api/users/:id/unlink` - Remove friendship

### Graph Data
- `GET /api/users/graph` - Return graph data for visualization

## User Object Structure

```typescript
{
  id: string (uuid),
  username: string (required),
  age: number (required),
  hobbies: string[] (required),
  friends: string[] (ids of other users),
  createdAt: Date,
  popularityScore: number (computed)
}
```

## Popularity Score Formula

```
popularityScore = number of unique friends + (total hobbies shared with friends × 0.5)
```

## Business Rules

1. **Deletion Prevention**: Users cannot be deleted while still connected as friends to others
2. **Circular Friendship Prevention**: Prevents duplicate bidirectional relationships
3. **Dynamic Scoring**: Popularity scores update automatically when relationships or hobbies change

## Testing

Run the backend tests:
```bash
cd backend
npm test
```

## Development Features

- Hot reloading for both frontend and backend
- TypeScript for type safety
- Comprehensive error handling
- Loading states and user feedback
- Responsive design

## Project Structure

```
my-app/
├── app/                    # Next.js frontend
│   ├── components/         # React components
│   │   ├── HighScoreNode.tsx
│   │   ├── LowScoreNode.tsx
│   │   ├── UserNetworkFlow.tsx
│   │   ├── HobbySidebar.tsx
│   │   └── UserManagementPanel.tsx
│   └── page.tsx           # Main page component
├── backend/               # Express backend
│   ├── src/
│   │   ├── controllers/   # API controllers
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── config/       # Database configuration
│   │   └── tests/        # API tests
│   └── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License
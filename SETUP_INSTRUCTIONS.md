# Quick Setup Instructions

## Prerequisites
- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git (optional)

## Quick Start

### Option 1: Automated Setup (Windows)
1. Run `setup.bat` to install all dependencies
2. Make sure MongoDB is running
3. Run `start-dev.bat` to start both servers

### Option 2: Manual Setup

#### 1. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

#### 2. Start MongoDB
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

#### 3. Start the Application
```bash
# Start both frontend and backend
npm run dev:full

# OR start them separately:
# Terminal 1: Backend
npm run backend

# Terminal 2: Frontend
npm run dev
```

## Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## Features Implemented

### ✅ Backend Features
- Complete REST API with all required endpoints
- MongoDB integration with Mongoose
- User CRUD operations
- Relationship management (friendships)
- Popularity score calculation
- Business rule enforcement (deletion prevention, circular friendship prevention)
- Comprehensive error handling
- API tests

### ✅ Frontend Features
- React Flow graph visualization
- Custom node types (HighScoreNode, LowScoreNode)
- Interactive user management panel
- Draggable hobby sidebar
- Real-time graph updates
- Loading states and error handling
- Responsive design

### ✅ Advanced Features
- Dynamic popularity scoring
- Node type transitions based on popularity
- Drag and drop hobby management
- User relationship visualization
- Real-time data synchronization

## Testing

### Run Backend Tests
```bash
cd backend
npm test
```

### Test API Endpoints
```bash
# Health check
curl http://localhost:5000/api/health

# Get all users
curl http://localhost:5000/api/users

# Create a user
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","age":25,"hobbies":["reading","gaming"]}'
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `backend/config.env`

2. **Port Already in Use**
   - Change ports in `backend/config.env` and `app/page.tsx`

3. **CORS Issues**
   - Backend is configured to allow localhost:3000
   - Check CORS settings in `backend/src/server.ts`

4. **TypeScript Errors**
   - Run `npm run build` in backend directory
   - Check TypeScript configuration

### Development Tips

1. **Hot Reloading**: Both frontend and backend support hot reloading
2. **Database**: Uses MongoDB with automatic schema validation
3. **Graph Updates**: Graph automatically updates when data changes
4. **Error Handling**: Comprehensive error messages in both UI and API

## Project Structure
```
my-app/
├── app/                    # Next.js frontend
│   ├── components/         # React components
│   └── page.tsx           # Main page
├── backend/               # Express backend
│   ├── src/
│   │   ├── controllers/   # API controllers
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   └── tests/        # API tests
│   └── package.json
├── setup.bat             # Windows setup script
├── start-dev.bat        # Windows start script
└── README.md            # Detailed documentation
```

## Next Steps

1. **Add Authentication**: Implement user login/logout
2. **Enhanced Visualizations**: Add more graph layouts and animations
3. **Data Persistence**: Add undo/redo functionality
4. **Performance**: Implement lazy loading for large datasets
5. **Deployment**: Deploy to cloud platforms

## Support

For issues or questions:
1. Check the console for error messages
2. Verify MongoDB is running
3. Check network connectivity between frontend and backend
4. Review the detailed README.md for more information

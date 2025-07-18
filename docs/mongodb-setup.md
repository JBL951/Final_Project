# MongoDB Setup Guide for TasteBase

This guide will help you set up MongoDB for the TasteBase application, either locally or using MongoDB Atlas (cloud).

## Option 1: MongoDB Atlas (Recommended for Production)

### Step 1: Create a MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new project called "TasteBase"

### Step 2: Create a Cluster
1. Click "Build a Database"
2. Choose the free tier (M0 Sandbox)
3. Select your preferred cloud provider and region
4. Name your cluster (e.g., "tastebase-cluster")
5. Click "Create Cluster"

### Step 3: Configure Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and secure password
5. Set user privileges to "Read and write to any database"
6. Click "Add User"

### Step 4: Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development, click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production, add your specific IP addresses
5. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Clusters" and click "Connect" on your cluster
2. Choose "Connect your application"
3. Select "Node.js" and version "4.1 or later"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with "tastebase"

### Step 6: Configure Environment Variables
Create a `.env` file in your project root:

```env
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/tastebase
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
PORT=5000
```

## Option 2: Local MongoDB Installation

### Step 1: Install MongoDB
**On macOS (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
```

**On Ubuntu:**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

**On Windows:**
Download and install from [MongoDB Download Center](https://www.mongodb.com/try/download/community)

### Step 2: Start MongoDB Service
**On macOS:**
```bash
brew services start mongodb/brew/mongodb-community
```

**On Ubuntu:**
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

**On Windows:**
MongoDB should start automatically as a service after installation.

### Step 3: Configure Environment Variables
Create a `.env` file in your project root:

```env
DATABASE_URL=mongodb://localhost:27017/tastebase
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
PORT=5000
```

## Seeding the Database

After setting up MongoDB, you can seed the database with sample data:

```bash
# Install dependencies first
npm install

# Run the seed script
npm run seed
```

Or manually run the seed script:

```bash
npx tsx server/data/seedData.ts
```

This will create:
- 5 sample users (john_doe, sarah_johnson, mike_chen, emma_davis, gordon_ramsay)
- 5 sample recipes with various categories
- All users have the password: `password123`

## Verifying the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Check the console for the message: "MongoDB Connected: [hostname]"

3. Try registering a new user or logging in with existing credentials

4. Create, view, and manage recipes to ensure everything is working

## Troubleshooting

### Common Issues

**Connection Timeout:**
- Check your internet connection
- Verify IP whitelist in MongoDB Atlas
- Ensure correct connection string format

**Authentication Failed:**
- Double-check username and password
- Ensure the database user has proper permissions
- Verify the connection string format

**Local MongoDB Not Starting:**
- Check if MongoDB service is running
- Verify MongoDB is properly installed
- Check MongoDB logs for error messages

### Environment Variables

Make sure your `.env` file is in the project root and contains:
- `DATABASE_URL` or `MONGODB_URI`
- `JWT_SECRET`
- `NODE_ENV`
- `PORT`

### Database Indexes

The application automatically creates text indexes for search functionality. If you need to manually create them:

```javascript
// In MongoDB shell or Compass
db.recipes.createIndex({
  "title": "text",
  "description": "text", 
  "ingredients": "text",
  "tags": "text"
})
```

## Production Considerations

1. **Security:**
   - Use strong passwords
   - Restrict IP access to your application servers
   - Enable MongoDB authentication
   - Use environment variables for sensitive data

2. **Performance:**
   - Monitor database performance
   - Consider adding indexes for frequently queried fields
   - Implement connection pooling

3. **Backup:**
   - Set up automated backups in MongoDB Atlas
   - For local installations, implement regular backup scripts

4. **Monitoring:**
   - Use MongoDB Atlas monitoring tools
   - Set up alerts for performance issues
   - Monitor connection counts and query performance

## Next Steps

Once MongoDB is set up and running:

1. Test all API endpoints
2. Verify user registration and authentication
3. Test recipe CRUD operations
4. Test search functionality
5. Deploy to your preferred hosting platform

For deployment guides, see the deployment documentation in the `docs/` folder.
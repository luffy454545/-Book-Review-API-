# Book Review System API

A RESTful API for managing book reviews, built with Node.js and Express.js. This system allows users to create accounts, add books, write reviews, and search for books.

## Features

- User authentication with JWT
- CRUD operations for books and reviews
- Search functionality for books
- Pagination and filtering
- Secure API endpoints
- MongoDB database integration
- Input validation
- Error handling middleware

## Tech Stack

- Node.js
- Express.js
- MongoDB
- JWT for authentication
- bcryptjs for password hashing
- express-validator for input validation
- dotenv for environment variables

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Setup & Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd book-review-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/book-review-system
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=24h
   ```

4. Start the server:
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## API Documentation

### Authentication Endpoints

#### Register User
```bash
curl -X POST http://localhost:3000/api/auth/signup \
-H "Content-Type: application/json" \
-d '{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
-H "Content-Type: application/json" \
-d '{
  "email": "john@example.com",
  "password": "password123"
}'
```

### Book Endpoints

#### Create Book (Authenticated)
```bash
curl -X POST http://localhost:3000/api/books \
-H "Content-Type: application/json" \
-H "Authorization: Bearer your_jwt_token" \
-d '{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "genre": "Fiction",
  "description": "A story of the fabulously wealthy Jay Gatsby..."
}'
```

#### Get All Books
```bash
# Basic request
curl http://localhost:3000/api/books

# With pagination
curl http://localhost:3000/api/books?page=1&limit=10

# With filters
curl http://localhost:3000/api/books?genre=Fiction&author=Fitzgerald
```

#### Get Single Book
```bash
curl http://localhost:3000/api/books/book_id_here
```

#### Search Books
```bash
curl http://localhost:3000/api/books/search?q=Gatsby
```

### Review Endpoints

#### Add Review (Authenticated)
```bash
curl -X POST http://localhost:3000/api/books/book_id_here/reviews \
-H "Content-Type: application/json" \
-H "Authorization: Bearer your_jwt_token" \
-d '{
  "rating": 5,
  "comment": "Excellent book! Highly recommended."
}'
```

#### Update Review (Authenticated)
```bash
curl -X PUT http://localhost:3000/api/reviews/review_id_here \
-H "Content-Type: application/json" \
-H "Authorization: Bearer your_jwt_token" \
-d '{
  "rating": 4,
  "comment": "Updated review comment"
}'
```

#### Delete Review (Authenticated)
```bash
curl -X DELETE http://localhost:3000/api/reviews/review_id_here \
-H "Authorization: Bearer your_jwt_token"
```

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  username: String,    // required, unique, min: 3 chars
  email: String,       // required, unique, valid email
  password: String,    // required, min: 6 chars, hashed
  createdAt: Date,     // auto-generated
  updatedAt: Date      // auto-generated
}
```

### Book Collection
```javascript
{
  _id: ObjectId,
  title: String,       // required
  author: String,      // required
  genre: String,       // required
  description: String, // required
  averageRating: Number, // default: 0, min: 0, max: 5
  totalReviews: Number,  // default: 0
  createdAt: Date,     // auto-generated
  updatedAt: Date      // auto-generated
}
```

### Review Collection
```javascript
{
  _id: ObjectId,
  bookId: ObjectId,    // ref: Book, required
  userId: ObjectId,    // ref: User, required
  rating: Number,      // required, min: 1, max: 5
  comment: String,     // required
  createdAt: Date,     // auto-generated
  updatedAt: Date      // auto-generated
}
```

## Design Decisions & Assumptions

1. **Authentication**:
   - JWT-based authentication for stateless API
   - Token expiration for security
   - Password hashing using bcrypt

2. **Database**:
   - MongoDB for flexible schema and scalability
   - Indexes on frequently queried fields
   - Text index for search functionality

3. **API Design**:
   - RESTful principles
   - Consistent response format
   - Proper error handling
   - Input validation
   - Pagination for large datasets

4. **Security**:
   - Environment variables for sensitive data
   - Input sanitization
   - Protected routes
   - One review per user per book

5. **Performance**:
   - Pagination for large datasets
   - Indexed queries
   - Efficient search implementation

## Error Handling

The API uses a consistent error response format:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (development only)"
}
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License. 
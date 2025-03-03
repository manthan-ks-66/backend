# backend project

this project is the backend of youtube

# data model

https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj

this is the data model which I have used for implementing this backend project

# project strucure

/src
│-- db/ # mongodb connection

│-- controllers/ # Business logic for API endpoints

│-- models/ # Mongoose schemas and database models

│-- routes/ # Express routes for API endpoints

│-- middlewares/ # JWT auth, error handling, validation and multer upload

│-- index.js # Entry point of the application

|-- public/ # stores the file temporarily on server when file uplaoding occurs

|-- utils/ # ApiResponse class for sending json response, ApiError class for error handling, asyncHandler a higher order function that wraps up the controller method to handle errors when interacting with database and cloudinary method for uploading files on cloudinary

# run project

cd backend

npm run dev

# Tech stack

node js
express js
mongodb
mongoose odm
bcrypt
dotenv
jsonwebtoken
cloudinary
multer (for parsing form data and files)

# URL Shortener

This is a training project for a modern web application that provides URL shortening services. The project is built using Node.js, Express, Sequelize, and EJS.
# Table of Contents

1. [Features](#features)
2. [Project Structure](#project-structure)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Dependencies](#dependencies)
6. [Code Overview](#code-overview)
   - [Database Configuration](#database-configuration)
   - [Models](#models)
   - [Middleware](#middleware)
   - [Views](#views)
   - [Routes](#routes)
7. [Project Recovery](#project-recovery)
8. [License](#license)

## Features

- User registration and login
- URL shortening
- URL redirection
- Password reset functionality
- User-specific URL history
- EJS templating for dynamic web pages

## Project Structure

# Project Directory Structure

project-root/
├── database.sqlite
├── db.js
├── index.js
├── middlewares/
│   └── auth.middleware.js
├── package.json
├── README.md
└── views/
    ├── archive/
    │   └── sample.ejs
    ├── index.ejs
    └── user/
        ├── forget.ejs
        ├── history.ejs
        ├── login.ejs
        ├── profile.ejs
        ├── register.ejs
        └── reset-password.ejs

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/url-shortener.git
    cd url-shortener
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Run the application:
    ```sh
    node index.js
    ```

## Usage

- Visit `http://localhost:3000` to access the application.
- Register a new user or login with existing credentials.
- Shorten URLs and manage them through your user-specific history.

## Dependencies

- [express](https://www.npmjs.com/package/express)
- [ejs](https://www.npmjs.com/package/ejs)
- [express-session](https://www.npmjs.com/package/express-session)
- [sequelize](https://www.npmjs.com/package/sequelize)
- [sqlite3](https://www.npmjs.com/package/sqlite3)

## Code Overview

### Database Configuration

The database is configured using Sequelize with SQLite as the storage engine. The configuration can be found in [`db.js`](db.js).

### Models

- **User**: Defined in [`index.js`](index.js) with fields for username, email, password, and forget_pass.
- **shortUrl**: Defined in [`index.js`](index.js) with fields for url, key, and user.

### Middleware

- **Authentication Middleware**: Located in [`auth.middleware.js`](middlewares/auth.middleware.js).

### Views

- EJS templates for various pages are located in the [`views`](views) directory.

### Routes

- Defined in [`index.js`](index.js) for handling user registration, login, URL shortening, password reset, and URL history.

## Project Recovery 

Due to unforeseen issues, I lost the original version of this project. After some time and effort in recovery, I managed to restore and edit the application, resulting in this current version. While it may have undergone some changes, it is functional and maintains the core features of the original URL shortener application. :)

## License

This project is licensed under the ISC License.
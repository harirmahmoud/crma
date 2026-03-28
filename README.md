# CRMA Dashboard Project

This project consists of a Next.js Frontend and a Laravel Backend, fully containerized using Docker.

## Prerequisites
To run this project on any computer, you need to install:
- **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** (Make sure the Docker daemon is running)
- **Git** (if you are cloning the repository)

## How to run the project on another PC

### 1. Copy the project
Either clone the repository from your Git hosting provider or copy the entire `crma` folder to the new computer.

### 2. Configure the Backend Environment
Navigate into the `backend` folder and create the environment file by copying the example:
```bash
cd backend
cp .env.example .env
```
*(If you are on Windows CMD, you can simply duplicate `.env.example` and rename it to `.env` using the file explorer).*

### 3. Start the Docker Containers
Open a terminal in the root folder of the project (where `docker-compose.yml` is located) and run:
```bash
docker compose up -d --build
```
This command will pull the required images, build the Next.js and Laravel containers, and start everything in the background.

### 4. Install Backend Dependencies & Run Migrations
Once the containers are successfully running, you need to install Laravel's PHP dependencies, generate the application key, and migrate the database.

Run the following commands in your terminal (still from the root of the project):

```bash
# Install PHP dependencies using Composer inside the backend container
docker compose exec backend composer install

# Generate the Laravel application key
docker compose exec backend php artisan key:generate

# Run database migrations to create the tables
docker compose exec backend php artisan migrate --seed

docker exec -it crma-backend php artisan make:seeder UserSeeder
docker exec -it crma-backend php artisan tinker


    \App\Models\User::create([
        'username' => 'harir',
        'password' => bcrypt('harir2004'),
    ]);

```

### 5. Access the Application
The project is now running! 
- **Frontend (Dashboard):** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:8000](http://localhost:8000)

---

### Useful Docker Commands
- **Stop the project:** `docker compose down`
- **View logs:** `docker compose logs -f`
- **Run Artisan commands:** `docker compose exec backend php artisan <command>`

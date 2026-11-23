# Moviesss – Movie Discovery Application

Moviesss is a movie discovery web application that allows users to search for movies, browse popular titles, filter by genre and release year, and explore movie information. It uses The Movie Database (TMDb) API to retrieve live movie data.

**Live application:** http://18.171.137.60

**GitHub repository:** https://github.com/Abigail-Cobbina/Web_Infrastructure_Summative

## 1. Features

- Search movies by title.
- Browse popular, top-rated and newest movies.
- Filter movies by genre and release year.
- View movie descriptions, ratings, runtime and genres.
- Explore cast information.
- Watch available official movie trailers.
- Save favourite movies in the browser.
- Responsive movie discovery interface.
- Error handling for failed API requests and missing information.
- Server health endpoint for deployment monitoring.

## 2. Technologies Used

| Component | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js and Express |
| External API | TMDb REST API |
| Web servers | Ubuntu 20.04, Node.js |
| Web server/reverse proxy | Nginx |
| Load balancer | HAProxy |
| Process management | systemd |
| Version control | Git and GitHub |

## 3. Application Architecture

The application is deployed across three servers.

| Server | Role | Public IP |
|---|---|---|
| 7262-web-01 | First application server | 13.135.203.140 |
| 7262-web-02 | Second application server | 16.60.187.71 |
| 7262-lb-01 | HAProxy load balancer | 18.171.137.60 |

### Request flow

1. A user visits the public load balancer address.
2. HAProxy receives the HTTP request on port 80.
3. HAProxy distributes requests between Web01 and Web02 using round-robin balancing.
4. Nginx on the selected web server receives the request.
5. Nginx forwards the request to the local Node.js application on port 3000.
6. The Express backend communicates with TMDb when movie data is requested.
7. The response is returned to the user through the same path.

### Architecture diagram

```text
                 USER / BROWSER
                       |
                       v
              HAProxy (Lb01)
             18.171.137.60:80
                       |
              Round Robin
                /         \
               v           v
          Web01             Web02
       13.135.203.140   16.60.187.71
               |           |
             Nginx       Nginx
               |           |
          Node.js       Node.js
          Port 3000     Port 3000
               \           /
                \         /
                 v       v
                    TMDb
                 REST API
```

## 4. Local Installation

### Requirements

- Node.js and npm
- Git
- A TMDb developer API key

### Clone the repository

```bash
git clone https://github.com/Abigail-Cobbina/Web_Infrastructure_Summative.git

cd Web_Infrastructure_Summative
```

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create a local environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your TMDb API key:

```env
TMDB_API_KEY=your_api_key
PORT=3000
```

Never commit the `.env` file or expose your API key publicly.

### Start the application

```bash
npm start
```

Open:

http://localhost:3000

## 5. Deployment Process

The application was deployed to two Ubuntu web servers.

### Web01 and Web02

The following services were installed:

- Node.js 20
- Nginx
- Express application dependencies

The application files were copied to:

```text
/var/www/moviesss
```

The TMDb API key was transferred separately using SSH and stored in a protected `.env` file.

A systemd service named `moviesss` was created to manage the Node.js process and automatically restart it if it fails.

Useful commands:

```bash
sudo systemctl status moviesss
sudo systemctl restart moviesss
sudo systemctl enable moviesss
```

### Nginx configuration

Nginx listens on port 80 and forwards requests to the Node.js application on localhost port 3000.

The Node.js application listens on `127.0.0.1:3000`, keeping the backend behind Nginx.

### HAProxy configuration

HAProxy was installed on Lb01.

The backend uses round-robin balancing:

```haproxy
frontend moviesss_frontend
    bind *:80
    default_backend moviesss_servers

backend moviesss_servers
    balance roundrobin
    option httpchk GET /
    server web01 13.135.203.140:80 check
    server web02 16.60.187.71:80 check
```

Useful commands:

```bash
sudo systemctl status haproxy
sudo systemctl restart haproxy
sudo haproxy -c -f /etc/haproxy/haproxy.cfg
```

## 6. Load Balancer Testing

A health-check endpoint was implemented:

```text
GET /api/health
```

It returns the status and hostname of the server processing the request.

Example response:

```json
{
  "status": "ok",
  "server": "7262-web-01"
}
```

The endpoint was tested individually on both web servers.

Both returned successful responses:

- Web01: HTTP 200
- Web02: HTTP 200

### Load distribution test

Ten consecutive requests were sent through the public load balancer:

```bash
for i in {1..10}; do
    curl -s http://18.171.137.60/api/health
    echo
done
```

Observed results:

| Server | Requests handled |
|---|---:|
| Web01 | 5 |
| Web02 | 5 |
| Total | 10 |

The results demonstrated successful round-robin distribution between the two backend servers.

## 7. API Integration and Attribution

Moviesss uses the TMDb REST API to retrieve movie information.

API endpoints include:

- `/genre/movie/list`
- `/discover/movie`
- `/search/movie`
- `/movie/{id}?append_to_response=videos,credits`

Official resources:

- [TMDb website](https://www.themoviedb.org/)
- [TMDb developer documentation](https://developer.themoviedb.org/)
- [TMDb logo and attribution guidelines](https://www.themoviedb.org/about/logos-attribution)

Attribution:

This product uses the TMDb API but is not endorsed or certified by TMDb. Movie data, images and video metadata are provided by The Movie Database.

## 8. Security Considerations

- The TMDb API key is stored in a server-side environment file.
- The `.env` file is excluded from Git using `.gitignore`.
- The frontend does not directly access the secret API key.
- The Node.js application listens only on localhost.
- Nginx acts as a reverse proxy.
- SSH private keys are kept on the administrator's local machine.

**Current deployment uses HTTP. HTTPS/TLS configuration is a remaining security improvement.**

## 9. Challenges and Solutions

### SSH authentication

Initially, SSH connections failed because the correct private key was not being supplied. The existing `school` SSH key was identified and configured using SSH client aliases.

### Node.js environment

The local WSL environment initially used Windows Node.js/npm rather than Linux Node.js. NVM was installed to provide a working Linux Node.js environment.

### Multiple server deployment

The application needed to be installed and configured consistently on two separate web servers. SSH and remote commands were used to deploy the application and configure its services.

### Load balancing

HAProxy was configured to distribute incoming requests between the two web servers. A health endpoint was added to identify which server handled each request and verify distribution.

## 10. Future Improvements

- Configure HTTPS using TLS certificates.
- Add automated deployment through GitHub Actions.
- Introduce caching to reduce repeated API requests.
- Add user authentication and personalised settings.
- Improve monitoring and application logging.
- Explore containerisation with Docker.

## 11. Demonstration Video

**Demo video:** [Add your uploaded demonstration video link here.]

The demonstration will show:

1. The application running locally.
2. Movie search and filtering.
3. Movie details and trailer functionality.
4. The deployed application through the public load balancer.
5. Evidence of traffic distribution between Web01 and Web02.

---

Developed as part of a Software Engineering and DevOps deployment assignment.


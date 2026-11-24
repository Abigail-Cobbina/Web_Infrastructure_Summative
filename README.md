# Moviesss – Movie Discovery Application

## 1. Welcome to Moviesss!

Moviesss is a movie discovery web application that helps people find movies, explore information about films and keep track of their favourite titles.

Imagine wanting to watch a movie but not knowing what to choose. Instead of searching through different websites, you can use Moviesss to discover movies, search by title, filter by genre or release year, view ratings and descriptions, explore actors and watch available trailers.

The application retrieves movie information from **The Movie Database (TMDb)**, an external online movie information service.

Moviesss was developed as part of a Software Engineering and DevOps assignment. It demonstrates how an application can be built, connected to an external API, deployed on multiple servers and made available through a load balancer.

**Live application:** http://18.171.137.60

**GitHub repository:** https://github.com/Abigail-Cobbina/Web_Infrastructure_Summative

---

## 2. What Can You Do With Moviesss?

The application provides the following features:

- **Search:** Find movies by typing their titles.
- **Browse movies:** Explore popular, top-rated and newest movies.
- **Filter:** Narrow down movies by genre and release year.
- **Sort:** Arrange movie results using different sorting options.
- **Movie details:** View descriptions, ratings, runtime and genres.
- **Cast information:** Explore actors associated with movies.
- **Trailers:** Watch available official movie trailers through YouTube.
- **Favourites:** Save favourite movies in your browser. They remain saved after refreshing the page on the same browser.
- **Error handling:** Display appropriate responses when requests fail or information is unavailable.
- **Health monitoring:** Check which web server is handling a request.

The interface is designed to work on different screen sizes.

---

## 3. Understanding the Technologies

You do not need to be an expert in these technologies to understand the project. Here is what each one does.

| Technology | Simple explanation | How it is used |
|---|---|---|
| HTML | Provides the structure of a webpage. | Creates the content and layout of Moviesss. |
| CSS | Controls how a webpage looks. | Adds colours, spacing, fonts and styling. |
| JavaScript | Makes a webpage interactive. | Handles searching, filtering and user actions. |
| Node.js | Allows JavaScript to run outside a browser. | Runs the application's backend. |
| Express.js | A framework that makes building web servers easier. | Handles requests from the frontend. |
| TMDb API | A service that provides movie information. | Supplies movie details, posters and other data. |
| Nginx | A web server that can also forward requests to another application. | Receives requests and forwards them to Node.js. |
| HAProxy | A tool that distributes incoming requests between servers. | Shares traffic between Web01 and Web02. |
| Ubuntu | A Linux operating system. | Runs the cloud servers. |
| systemd | A Linux service manager. | Keeps the Moviesss application running. |
| Git | A tool for tracking changes to code. | Records project development. |
| GitHub | An online platform for storing Git repositories. | Hosts the project's source code. |

### What is an API?

API stands for Application Programming Interface.

Think of an API as a waiter in a restaurant.

You tell the waiter what you want, the waiter takes your request to the kitchen, and then brings the result back to you.

In Moviesss:

1. You search for a movie.
2. Moviesss sends a request to its backend.
3. The backend requests movie information from TMDb.
4. TMDb sends the information back.
5. Moviesss displays the results on your screen.

This means Moviesss does not need to create and maintain its own movie database.

---

## 4. How the Application Works

Moviesss has two main parts:

**Frontend:** This is the part users see and interact with. It includes the movie posters, search bar, buttons, filters and other visual elements.

**Backend:** This is the part that works behind the scenes. It processes requests, communicates with TMDb and sends information back to the frontend.

The backend also protects the TMDb API key. The key is stored on the server rather than being exposed in the webpage's JavaScript.

### Understanding the three servers

The application is deployed using three separate cloud servers.

A server is simply a computer that provides services or information to other computers over a network.

| Server | Hostname | Public IP | Purpose |
|---|---|---|---|
| Web01 | 7262-web-01 | 13.135.203.140 | Runs the first copy of Moviesss. |
| Web02 | 7262-web-02 | 16.60.187.71 | Runs the second copy of Moviesss. |
| Lb01 | 7262-lb-01 | 18.171.137.60 | Distributes incoming requests between the two web servers. |

### Why do we need three servers?

Imagine a shop with two service counters.

If every customer had to use only one counter, that counter could become very busy. Having two counters allows customers to be served by either one.

The same idea applies here:

- Web01 runs one copy of the application.
- Web02 runs another copy of the application.
- Lb01 decides which web server should receive an incoming request.

This helps distribute the workload instead of sending every request to just one server.

### What is a load balancer?

A load balancer distributes incoming network requests across multiple servers.

Moviesss uses **HAProxy** as its load balancer.

It uses a method called round-robin balancing. This means requests are distributed in turn between available servers.

### What is a reverse proxy?

A reverse proxy receives a request and forwards it to another application or server.

Moviesss uses **Nginx** as a reverse proxy on Web01 and Web02.

Nginx receives requests on port 80 and forwards them to the Node.js application running locally on port 3000.

### Application architecture

```text
                 USER / BROWSER
                       |
                       |
                       v
              LOAD BALANCER (Lb01)
                  HAProxy
              18.171.137.60
                       |
                Round Robin
                  /       \
                 /         \
                v           v
             WEB01         WEB02
          13.135.203.140  16.60.187.71
                |           |
              Nginx       Nginx
                |           |
             Node.js     Node.js
            Port 3000   Port 3000
                \           /
                 \         /
                  v       v
                   TMDb API
              Movie information
```

### What happens when someone visits the application?

1. The user opens `http://18.171.137.60` in a browser.
2. HAProxy receives the request.
3. HAProxy selects an available web server.
4. Nginx on that server receives the request.
5. Nginx forwards the request to the Node.js application.
6. The application returns the webpage or requests movie information from TMDb.
7. The result travels back to the user's browser.

---

## 5. Running Moviesss on Your Own Computer

This section explains how someone new to the project can download and run it locally.

### What you need first

Install the following:

- **Git:** Used to download the project.
- **Node.js:** Used to run the backend.
- **npm:** Installed with Node.js; used to install project dependencies.
- **A TMDb API key:** Allows the application to retrieve movie information.
- **A terminal:** Used to enter commands.

You can download Node.js from https://nodejs.org/ and Git from https://git-scm.com/.

You can create a TMDb account and obtain an API key through https://www.themoviedb.org/.

### Step 1: Download the project

Open your terminal.

Run:

```bash
git clone https://github.com/Abigail-Cobbina/Web_Infrastructure_Summative.git
```

This downloads a copy of the project from GitHub onto your computer.

Move into the project folder:

```bash
cd Web_Infrastructure_Summative
```

### Step 2: Install the dependencies

Dependencies are additional software packages that the application needs to work.

Run:

```bash
npm install
```

npm reads `package.json` and downloads the required packages.

### Step 3: Configure your API key

The application needs a TMDb API key to retrieve movie information.

Create your environment file:

```bash
cp .env.example .env
```

The `.env` file stores private configuration information.

Open it using a text editor and replace the example value with your actual API key:

```env
TMDB_API_KEY=your_actual_api_key
PORT=3000
```

Do not include quotation marks around the key unless the value requires them.

**Important:** Never upload your real `.env` file or API key to a public GitHub repository. The `.env` file is excluded using `.gitignore`.

### Step 4: Start the application

Run:

```bash
npm start
```

You should see a message indicating that the application is running on port 3000.

Open your browser and visit:

http://localhost:3000

You should now be able to use Moviesss on your computer.

To stop the application, return to the terminal and press `Ctrl + C`.

---

## 6. Deploying the Application to Cloud Servers

Local development means running an application on your own computer.

Deployment means placing the application on a server so that other people can access it over the internet.

Moviesss was deployed to two Ubuntu cloud servers.

### Software installed on each web server

Both Web01 and Web02 have:

- Ubuntu 20.04.6 LTS
- Node.js 20
- Nginx
- The Moviesss application and its dependencies

The application files are stored in:

```text
/var/www/moviesss
```

### How the application stays running

A Linux service called `moviesss` was created using systemd.

This allows the operating system to manage the Node.js application as a background service.

It can automatically restart the application if it unexpectedly stops.

Useful commands when connected to a web server:

Check the service:

```bash
sudo systemctl status moviesss
```

Restart the service:

```bash
sudo systemctl restart moviesss
```

Start the service:

```bash
sudo systemctl start moviesss
```

Enable it to start automatically when the server boots:

```bash
sudo systemctl enable moviesss
```

### Understanding Nginx

Nginx listens for incoming web requests on port 80.

It then forwards those requests to the Node.js application on port 3000.

The Node.js application listens on:

```text
127.0.0.1:3000
```

The address `127.0.0.1` means localhost, or the same server. This keeps the Node.js application from being directly exposed on its public network interface.

### Understanding HAProxy

HAProxy runs on Lb01.

Its job is to distribute requests between Web01 and Web02.

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

The `check` setting allows HAProxy to monitor whether the backend servers are responding to its health checks.

Useful commands on Lb01:

Check HAProxy status:

```bash
sudo systemctl status haproxy
```

Restart HAProxy:

```bash
sudo systemctl restart haproxy
```

Check the configuration for errors:

```bash
sudo haproxy -c -f /etc/haproxy/haproxy.cfg
```

---

## 7. Testing the Application and Load Balancer

Testing helps confirm that the application works correctly and that the servers are communicating as expected.

### Test 1: Open the live application

Visit:

http://18.171.137.60

The Moviesss homepage should load.

### Test 2: Test the movie API

An API endpoint is a specific address used to request information from an application.

Open:

```text
http://18.171.137.60/api/movies
```

The application should return movie information in JSON format.

JSON is a structured format commonly used to exchange data between applications.

You can also test from a terminal:

```bash
curl -i http://18.171.137.60/api/movies
```

A response containing `HTTP 200` means the request was successful.

### Test 3: Test the health endpoint

Moviesss includes a health endpoint:

```text
http://18.171.137.60/api/health
```

It returns information about the server handling the request.

Example:

```json
{
  "status": "ok",
  "server": "7262-web-01"
}
```

The hostname helps identify which web server handled the request.

### Test 4: Verify load distribution

Run this command in your terminal:

```bash
for i in {1..10}; do
    curl -s http://18.171.137.60/api/health
    echo
done
```

During testing, ten requests produced the following results:

| Server | Requests handled |
|---|---:|
| Web01 | 5 |
| Web02 | 5 |
| Total | 10 |

This demonstrated that HAProxy successfully distributed the ten test requests between the two web servers.

The result is evidence of round-robin load balancing during that test.

### Understanding HTTP response codes

| Response code | Meaning |
|---|---|
| 200 | The request was successful. |
| 400 | The request contained invalid information. |
| 404 | The requested resource could not be found. |
| 500 | The server encountered an internal error. |

---

## 8. Additional Improvements and Bonus Features

In addition to the main application and deployment requirements, three useful improvements were implemented.

### 8.1 API response caching

Caching means temporarily storing information so that it can be reused instead of requesting it again.

For example, if someone requests the movie genre list several times, Moviesss can reuse a recently stored response rather than repeatedly contacting TMDb.

The application uses in-memory caching with:

- A cache lifetime of five minutes.
- A maximum of 500 cache entries.
- Cache-hit and cache-miss logging.

A cache hit means the requested information was already stored and could be reused.

A cache miss means the application needed to retrieve the information again.

This helps reduce unnecessary external API requests and can improve response times.

The cache is stored separately in each Node.js server process. It is not a shared cache between Web01 and Web02.

### 8.2 Input validation

Input validation means checking information supplied to an application before processing it.

For example, a page number should be a valid positive number rather than text or an unreasonable value.

Moviesss validates API request parameters, including:

- Movie page numbers.
- Genre identifiers.
- Movie identifiers.
- Search query length.

Invalid requests receive HTTP 400 responses with an explanatory error message.

Tests confirmed:

| Test | Expected response |
|---|---|
| Valid page and genre | HTTP 200 |
| Invalid page | HTTP 400 |
| Invalid genre | HTTP 400 |
| Invalid movie ID | HTTP 400 |
| Search query longer than 100 characters | HTTP 400 |

This helps prevent malformed requests from being unnecessarily forwarded to TMDb.

### 8.3 Security headers using Helmet

Helmet is a security package for Express applications.

It adds HTTP response headers that help browsers apply additional security protections.

Some of the headers configured in Moviesss include:

| Header | Purpose |
|---|---|
| `X-Content-Type-Options` | Helps prevent incorrect content-type interpretation. |
| `X-Frame-Options` | Helps protect against clickjacking. |
| `Referrer-Policy` | Controls referrer information sent by the browser. |
| `Cross-Origin-Resource-Policy` | Controls how other origins can load resources. |

The headers were tested using:

```bash
curl -I http://localhost:3000
```

The deployed application was also checked through the public load balancer.

Helmet improves browser security, but it does not replace all application security measures. Comprehensive XSS testing and HTTPS configuration remain possible future improvements.

---

## 9. Security and Protection of Sensitive Information

Security is important because the application uses an external API key and is accessible over the internet.

The following precautions were implemented:

- The TMDb API key is stored in a server-side `.env` file.
- The `.env` file is excluded from Git using `.gitignore`.
- The frontend does not directly access the secret API key.
- SSH private keys remain on the administrator's computer.
- The Node.js application listens only on localhost.
- Nginx forwards requests to the backend.
- API parameters are validated before processing.
- Helmet adds security-related HTTP headers.

**Important limitation:** The current public application uses HTTP rather than HTTPS. HTTPS/TLS should be configured when a suitable domain name and certificate are available.

---

## 10. Challenges Encountered and Solutions

### SSH authentication

Initially, connecting to the cloud servers through SSH was difficult because the correct private key was not being supplied.

The existing `school` SSH key was identified and configured using SSH client aliases. This made it easier to connect to each server using commands such as:

```bash
ssh web01
ssh web02
ssh lb01
```

### Node.js environment

The local WSL environment initially used Windows Node.js/npm rather than Linux Node.js.

NVM was installed to provide a working Linux Node.js environment.

### Deploying to multiple servers

The application needed to be installed and configured consistently on two separate web servers.

SSH was used to transfer the application files, install dependencies and restart the application service.

The API key was transferred separately rather than included in the deployment archive.

### Load balancing

A single web server would receive all incoming requests if no load balancer were configured.

HAProxy was installed on a dedicated third server and configured to distribute traffic between Web01 and Web02.

The `/api/health` endpoint helped verify which server processed each request.

### Input validation

During testing, an incorrectly escaped regular expression caused valid numeric inputs to be rejected.

The expression was corrected and tested again. Valid requests returned HTTP 200, while invalid requests returned HTTP 400.

---

## 11. Troubleshooting

Here are some common problems and possible solutions.

| Problem | Possible solution |
|---|---|
| The application does not open locally. | Check that `npm start` is running and that you are visiting `http://localhost:3000`. |
| Movie information does not appear. | Check that your TMDb API key is correct in `.env`. |
| `npm install` fails. | Check your Node.js and npm installations and your internet connection. |
| A server does not respond. | Connect through SSH and check `sudo systemctl status moviesss`. |
| The public application does not load. | Check HAProxy, Nginx, both application services and the AWS security group rules. |
| A request returns HTTP 400. | Check the request parameters for invalid values. |
| The load balancer sends traffic to only one server. | Check HAProxy's backend health checks and the availability of both web servers. |

---

## 12. Future Improvements

Although the application meets its main objectives, it can be extended further.

Possible improvements include:

- Configure HTTPS using TLS certificates.
- Create a CI/CD pipeline using GitHub Actions to automate testing and deployment.
- Add user accounts and authentication.
- Introduce personalised user settings.
- Add advanced movie statistics and data visualisations.
- Improve monitoring and application logging.
- Explore Docker containerisation and Kubernetes orchestration.
- Introduce a shared caching system between the two application servers.

---

## 13. Demonstration Video

**Demo video:** https://youtu.be/GnFMP0cTOxk

The demonstration will show:

1. The Moviesss application running locally.
2. Searching for movies.
3. Filtering and sorting movie results.
4. Viewing movie details and opening a trailer.
5. Saving and removing favourite movies.
6. Opening the deployed application through the public load balancer.
7. Testing the health endpoint to demonstrate traffic distribution between Web01 and Web02.

---

## 14. Project Links and References

**Live application:** http://18.171.137.60

**GitHub repository:** https://github.com/Abigail-Cobbina/Web_Infrastructure_Summative

**External API:** [The Movie Database (TMDb)](https://www.themoviedb.org/)

**TMDb developer documentation:** https://developer.themoviedb.org/

**TMDb attribution guidelines:** https://www.themoviedb.org/about/logos-attribution

**Attribution statement:**

This product uses the TMDb API but is not endorsed or certified by TMDb. Movie data, images and video metadata are provided by The Movie Database.

---

Developed as part of a Software Engineering and DevOps deployment assignment.

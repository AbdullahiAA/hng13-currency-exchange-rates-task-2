# Country Currency & Exchange API

A RESTful API that fetches country data from external APIs, stores it in a MySQL database, and provides CRUD operations with exchange rate information.

## Features

- Fetch country data from REST Countries API
- Get exchange rates from Exchange Rate API
- Calculate estimated GDP based on population and exchange rates
- Store/update country data in MySQL database
- Generate summary images with top countries
- Full CRUD operations on country records
- Filtering and sorting capabilities
- Global refresh timestamp tracking

## API Endpoints

### POST /countries/refresh

Fetch all countries and exchange rates, then cache them in the database.

**Response:**

```json
{
  "message": "Countries refreshed successfully",
  "countries": [...],
  "summary": {
    "last_refreshed_at": "2025-10-22T18:00:00Z",
    "total": 250,
    "created": 200,
    "updated": 50
  }
}
```

### GET /countries

Get all countries from the database with optional filters and sorting.

**Query Parameters:**

- `region` - Filter by region (e.g., `?region=Africa`)
- `currency` - Filter by currency code (e.g., `?currency=NGN`)
- `sort` - Sort by field and direction (e.g., `?sort=gdp_desc`)

**Sort Options:**

- `gdp_desc` / `gdp_asc` - Sort by estimated GDP
- `name_desc` / `name_asc` - Sort by name
- `population_desc` / `population_asc` - Sort by population

**Example Requests:**

```
GET /countries
GET /countries?region=Africa
GET /countries?currency=NGN
GET /countries?sort=gdp_desc
GET /countries?region=Africa&sort=gdp_desc
```

**Response:**

```json
[
  {
    "id": 1,
    "name": "Nigeria",
    "capital": "Abuja",
    "region": "Africa",
    "population": 206139589,
    "currency_code": "NGN",
    "exchange_rate": 1600.23,
    "estimated_gdp": 25767448125.2,
    "flag_url": "https://flagcdn.com/ng.svg",
    "last_refreshed_at": "2025-10-22T18:00:00Z"
  }
]
```

### GET /countries/:name

Get a single country by name (case-insensitive).

**Response:** Country object or 404 if not found

### DELETE /countries/:name

Delete a country record by name (case-insensitive).

**Response:**

```json
{
  "message": "Country deleted successfully",
  "country": {
    "name": "Nigeria"
  }
}
```

### GET /status

Get total number of countries and last refresh timestamp.

**Response:**

```json
{
  "total_countries": 250,
  "last_refreshed_at": "2025-10-22T18:00:00Z"
}
```

### GET /countries/image

Serve the generated summary image containing total countries, top 5 by GDP, and refresh timestamp.

**Response:** PNG image or 404 if not found

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd hng13-currency-exchange-rates-task-2
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create database**

   ```sql
   CREATE DATABASE testdb;
   ```

4. **Configure environment variables**

   ```bash
   cp .env-example .env
   ```

   Edit `.env` with your database credentials:

   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=testdb
   DB_DIALECT=mysql
   PORT=5000
   REST_COUNTRIES_API_URL=https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies
   EXCHANGE_RATE_API_URL=https://open.er-api.com/v6/latest/USD
   EXTERNAL_API_TIMEOUT=10000
   ```

5. **Run the application**

   ```bash
   npm start
   ```

   Or for development with auto-reload:

   ```bash
   npm run dev
   ```

6. **Initialize data**
   ```bash
   curl -X POST http://localhost:5000/countries/refresh
   ```

## Dependencies

- **express** - Web framework
- **sequelize** - ORM for MySQL
- **mysql2** - MySQL driver
- **axios** - HTTP client for external APIs
- **canvas** - Image generation
- **dotenv** - Environment variable management

## Database Schema

### Country Table

- `id` - Primary key (auto-increment)
- `name` - Country name (required)
- `capital` - Capital city (optional)
- `region` - Region (optional)
- `population` - Population count (required)
- `currency_code` - Currency code (required)
- `exchange_rate` - Exchange rate against USD (required)
- `estimated_gdp` - Calculated GDP estimate (required)
- `flag_url` - Flag image URL (optional)
- `last_refreshed_at` - Last refresh timestamp (auto-generated)

### RefreshMetadata Table

- `id` - Primary key
- `last_refreshed_at` - Global refresh timestamp

## Currency Handling

- If a country has multiple currencies, only the first currency code is stored
- If currencies array is empty, the country is stored with `currency_code` and `exchange_rate` set to null, and `estimated_gdp` set to 0
- If currency code is not found in exchange rates API, the country is stored with `exchange_rate` and `estimated_gdp` set to null

## Estimated GDP Calculation

The estimated GDP is calculated using the formula:

```
estimated_gdp = population × random(1000–2000) ÷ exchange_rate
```

The random multiplier is regenerated for each country on every refresh.

## Error Handling

The API returns consistent JSON error responses:

- **404 Not Found**: `{ "error": "Country not found" }`
- **400 Bad Request**: `{ "error": "Validation failed" }`
- **500 Internal Server Error**: `{ "error": "Internal server error" }`
- **503 Service Unavailable**: `{ "error": "External data source unavailable", "details": "..." }`

## Testing

Test the API endpoints using curl or Postman:

```bash
# Get all countries
curl http://localhost:5000/countries

# Get countries filtered by region
curl http://localhost:5000/countries?region=Africa

# Get countries sorted by GDP
curl http://localhost:5000/countries?sort=gdp_desc

# Get a specific country
curl http://localhost:5000/countries/Nigeria

# Get status
curl http://localhost:5000/status

# Refresh data
curl -X POST http://localhost:5000/countries/refresh

# Delete a country
curl -X DELETE http://localhost:5000/countries/Nigeria
```

## Production Deployment

For production deployment on platforms like Railway, Heroku, or AWS:

1. Set up MySQL database
2. Configure environment variables
3. Deploy the application
4. Run `/countries/refresh` to initialize data

## License

ISC

# Set up Database (MariaDB / MySQL)

- Run the script `lib/db/database.sql` in your database. Modify the script if you want to use a different database or other column formats.
- Create a user for the database and grant it the rights to read and write to the database.
- Create an `.env` file in the root directory of the project and add the following variables with the values of the new user:
  - MYSQL_URL
  - MYSQL_USER
  - MYSQL_PASSWORD
- Add the following variable to the `.env` file to set the session secret (can be any string):
  - SESSION_SECRET
    
# Run

```bash
npm install
```

```bash
npm run startLocal
```

# Needed environment variables for specific features

It is recommended to create an `.env` file in the root directory of the project and add the variables there.
Without the quired variables the features will not work.

## OpenAI (highly recommended)

The OpenAI API is used to generate a lot of the bot's responses.

[Get API key](https://platform.openai.com/api-keys)

- OPENAI_API_KEY

Used in the following features:
- Database integration

## Database integration

This feature currently only works with MariaDB/MySQL.

To set up the database integration, **it is recommended to create a second user** for the database with only the rights to read from the database.
Use those credentials with the following variables:

- DB_INTENT_URL
- DB_INTENT_USER
- DB_INTENT_PASSWORD

### Make data accessible
To be able to get data, it is recommended to create views on the `botanika` schema that reference the actual data from other schemas.
You should filter the data in the views to only return the data you want to be accessible to the bot.

## Weather data

[Get API key](https://home.openweathermap.org/api_keys)

- OPENWEATHER_API_KEY

## Spotify

[Get API key](https://developer.spotify.com/dashboard)

- SPOTIFY_CLIENT_ID
- SPOTIFY_CLIENT_SECRET

# Deployment

## Docker compose

- `IMAGE_NAME` = ${GITHUB_USERNAME}_${GITHUB_REPOSITORY_NAME}

```yaml
version: "3"
services:
  api:
    image: ${REGISTRY_URL}/${IMAGE_NAME}:latest
    container_name: BOTANIKA
    restart: always
    environment:
      - MYSQL_USER=${MYSQL_USER}
      - MYSQL_PASSWORD=${MYSQL_PASSWORD}
      - MYSQL_URL=${MYSQL_URL}
      - SESSION_SECRET=${SESSION_SECRET}
      - DEPLOYMENT_URL=${DEPLOYMENT_URL}
      - OPENWEATHER_API_KEY=${OPENWEATHER_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - VOICE_ENABLED=${VOICE_ENABLED}
      - SPOTIFY_CLIENT_ID=${SPOTIFY_CLIENT_ID}
      - SPOTIFY_CLIENT_SECRET=${SPOTIFY_CLIENT_SECRET}
    ports:
      - "6000:3000"
```
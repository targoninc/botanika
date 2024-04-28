# Set up Database (MariaDB / MySQL)

- Run the script [lib/db/database.sql](./lib/db/database.sql) in your database. Modify the script if you want to use a different database or other column formats (e.g. user id as a varchar instead of bigint).
- Create a user for the database and grant it the rights to read and write to the database.
- Create an `.env` file in the root directory of the project and add the following variables with the values of the new user:
  - MYSQL_URL
  - MYSQL_USER
  - MYSQL_PASSWORD
- Add the following variable to the `.env` file to set the session secret (can be any string):
  - SESSION_SECRET

# Needed environment variables for specific features

It is recommended to create an `.env` file in the root directory of the project and add the variables there.
Without the quired variables the features will not work.

# Run

```bash
npm install
```

```bash
npm run startLocal
```

## LLM provider (highly recommended)

An LLM provider is used to generate most responses.

Used in the following features:
- Database integration
- Responding to general questions
- Opening URLs for services
- Creating and working with files

Need to set:
- COMPLETION_PROVIDER= openai | groq | ollama

### OpenAI

[Get API key](https://platform.openai.com/api-keys)

- OPENAI_API_KEY

### Groq

[Get API key](https://console.groq.com/keys)

- GROQ_API_KEY

### Ollama

[Install Ollama on your system](https://github.com/ollama/ollama?tab=readme-ov-file#ollama)

After setting up, botanika will automatically use the Ollama API and download the desired models.

## Voice recognition

### OpenAI

[Get API key](https://platform.openai.com/api-keys)

- OPENAI_API_KEY

### Local (doesn't work)

Used package: [whisper-tnode](https://www.npmjs.com/package/whisper-tnode)

**Please install `make` first!**

#### Known issues

- Doesn't return transcriptions at all

## Database integration

This feature currently only works with MariaDB/MySQL and requires any LLM provider to be set up.

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
      - COMPLETION_PROVIDER=${COMPLETION_PROVIDER}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - GROQ_API_KEY=${GROQ_API_KEY}
      - VOICE_ENABLED=${VOICE_ENABLED}
      - SPOTIFY_CLIENT_ID=${SPOTIFY_CLIENT_ID}
      - SPOTIFY_CLIENT_SECRET=${SPOTIFY_CLIENT_SECRET}
    ports:
      - "3000:3000"
  
  # Add this service if you want to host a MariaDB database with the bot
  db:
    image: mariadb:latest
    container_name: BOTANIKA_DB
    restart: always
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=${MYSQL_DATABASE}
    volumes:
      - ./lib/db/database.sql:/docker-entrypoint-initdb.d/database.sql
```

# Credits

- Logo Font: [Geist by Vercel](https://vercel.com/font)
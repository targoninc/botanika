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

## OpenAI

[Get API key](https://platform.openai.com/api-keys)

- OPENAI_API_KEY

## OpenWeather

[Get API key](https://home.openweathermap.org/api_keys)

- OPENWEATHER_API_KEY

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
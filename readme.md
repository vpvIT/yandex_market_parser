
# Yandex market parser

Telegram bot for track to track the minimum price for a product on Yandex Market.

The bot can also be used to notify you that your store's product is currently not the cheapest.

## Installation

Install dependencies and build the project

```bash
  npm i
  npm run build

```

Also required google chrome
    
## Environment Variables

Rename .env.example and set required variables in .env file.

`BOT_TOKEN` - telegram bot token

Specify one of this variables.

`ALLOWED_USERS` - telegram users ids list, example: 1234, 5678

`GROUP_ID` - telegram group ids

Specify optional variables if necessary.

`PROXY_FILE_NAME` - name of proxies file

`PARSE_LINKS` - parse links from file 1 - yes or 0 - no, default=0

`LINKS_FILE_NAME` - name of links files, required if PARSE_LINKS = 1

`THREADS_COUNT` - amount of threads, required if PARSE_LINKS = 1, default=1

`SHOP_NAMES` - shop names list, required if PARSE_LINKS = 1, example SHOP1, SHOP2, SHOP3

`LINK_CHECK_DELAY` - delay between link checks in seconds, required if PARSE_LINKS = 1

`NOTIFICATION_COLDOWN` - coldown after notification

## Usage

Run the project
```bash
  npm run start

```
## Authors

- [@vpvIT](https://github.com/vpvIT)


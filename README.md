# MySQL to KwilDB data migration tool

A Node.js script to migrate MySQL data to KwilDB.


## Migrate existing MySQL data into KwilDB

Open terminal/command prompt and follow any of the following methods.

Before you continue, ensure that you have [Node.js](https://nodejs.org/download) installed on your system. See [here](https://nodejs.org/download) for more instructions. If you have it installed, you can continue below.


1. Clone project
   > git clone https://github.com/Mohd-Taqiuddin/MYSQL-to-Kwil-migration.git
2. Change working directory
   > cd mysql-kwil-etl
3. Install dependencies
   > npm install
4. Copy private key from KwilDB and paste it in privateKey.json
5. Copy your secret from KwilDb and paste it in lib/migrate.js (line 13) and also in src/lib/migrate.ts (if previous doesn't work)
6. Make it happen :wink:
   > npm run migrate

---

You will be prompted to enter authentication credentials for your MySQL database. Ensure that you have access credentials that have read/write roles enabled, or else you will encounter errors.

---

You should be ready to migrate your data now.

---

### Roadmap

- [x] Retrieve MySQL database models and data
- [x] Generate Kwil schemas in Typescript
- [x] Dump MySQL data to KwilDB
- [x] Support migrations over the network
- [ ] Prevent duplicates in subsequent migrations

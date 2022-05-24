# MySQL to KwilDB data migration tool

A Node.js script to migrate MySQL data to KwilDB.


## Migrate your existing MySQL data into KwilDB

Open terminal/command promt and follow any of below methods.

Before you continue, ensure you have [Node.js](https://nodejs.org/download) installed in your system. See [here](https://nodejs.org/download) for more instructions. If you have it installed, you can continue below.


1. Clone project
   > git clone https://github.com/dannysofftie/mysql-mongo-etl.git
2. Change working directory
   > cd mysql-kwil-etl
3. Install dependencies
   > npm install
4. Make it happen :wink:
   > npm run migrate


---

You will be prompted to enter authentication credentials for your MySQL database. Ensure you have access credentials that have read/write roles enabled, or else you will encounter errors.

---

You should be ready to migrate your data now.

---

### Roadmap

- [x] Retrieve MySQL database models and data
- [x] Generate Kwil schemas in Typescript
- [x] Dump MySQL data to KwilDB
- [x] Support migrations over the network
- [ ] Prevent duplicates in subsequent migrations

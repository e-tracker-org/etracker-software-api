## Server
1. yarn init

2. npx typescript --init

3. yarn add express http-status-codes pino @typegoose/typegoose mongoose express-async-errors zod zod-express-middleware argon2 jsonwebtoken cookie-parser mongoose-slug-generator nanoid busboy cors helmet @mantine/form

4. yarn add typescript ts-node-dev pino-pretty @types/express @types/jsonwebtoken @types/cookie-parser @types/busboy @types/cors -D

 

Nodejs Installed library and other descriptions

pino library: 
    Performance: console.log is synchronous and can cause performance issues if it is called frequently in a high-traffic 
    application. Pino is designed to be a high-performance logging library, and its asynchronous nature makes it more 
    efficient and scalable than console.log. You also don't want to allow messy logs in production but on development

Helmet middleware:
    Helmet is a popular middleware for Node.js web applications that helps protect against common web vulnerabilities by 
    setting HTTP headers appropriately.

Argon2 Library
    Argon2 is a password hashing algorithm that is considered to be one of the most secure options available today. The Argon2 
    algorithm is designed to be resistant to brute-force attacks and side-channel attacks, which makes it an ideal choice for securely storing user passwords.

nodemailer, crypto


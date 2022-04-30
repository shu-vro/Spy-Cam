# SpyCam

This is just an experiment. Just for fun. An express app using peerjs

## Installation

```sh
npm i
npm start
```

## Generating SSL certificate

### Creating key

> ```sh
> openssl genrsa -out key.pem
> ```

### Creating new key

> ```sh
> openssl req -new -key key.pem -out csr.pem
> ```

### Creating certificate

> ```sh
> openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
> ```

### Remove csr.pem

> ```sh
> rm csr.pem
> ```

### Final code:

```sh
openssl genrsa -out key.pem
openssl req -new -key key.pem -out csr.pem
openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
rm csr.pem
```

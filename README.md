# Dark Utilities - Cookies-sniffer

Our Website [https://dark-utilities.pw/](https://dark-utilities.pw/) !

# Features!

  - Simple data saving (JSON)
  - Modulable
  - Securized login system
  - WEB & CLI logs saving
  - Linux and windows usable

# How it work ?
![alt text](https://github.com/inplex-sys/cookies-sniffer/blob/main/img/cookies-sniffer.jpg?raw=true)

### Installation

Install the app on the server
```sh
user@domain:~# git clone https://github.com/inplex-sys/cookies-sniffer.git
user@domain:~# cd ./cookies-sniffer/
user@domain:~# npm install
user@domain:~# node app.js
```

Edit credentials in `config.json`
```json
{
  "credentials":{
    "auth_key":"put-your-password"
  },
  "logs":[]
}
```

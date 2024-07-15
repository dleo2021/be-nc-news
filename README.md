# Northcoders News API

If you are an aspiring back-end developer wanting to practise building your own server, this repository will help you to do just that.  

In order to get started, you will need to clone this repo on your own machine.  
Create your own repository on GitHub, ensuring you run the following commands in order to push your code to your own repository:  
1) git remote set-url origin YOUR_NEW_REPO_URL_HERE  
2) git branch -M main  
3) git push -u origin main  

---

You will then need to create two new .env files in the root directory in order to connect to the two databases locally. One will be called .env.test to connect to your test database. The other will be called .env.development to connect to your development database.  

---

To create the environment variables, use the following two steps:  

1) Inside the .env.test file, use PGDATABASE=database_name_test  
2) Inside the .env.development file, use PGDATABASE=database_name  

--- 

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
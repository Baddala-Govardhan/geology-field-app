
As of now it's just a webpage which's connected to docker and storing data in pouchdb and couchdb 

Steps to run

1. Clone and Install Node Modules
   
    **npm install**

3. Build React App
   
   **npm run build**

5. Run Docker Containers
   Start CouchDB
   
**   docker run -d \
  --name couchdb \
  -e COUCHDB_USER=app \
  -e COUCHDB_PASSWORD=app \
  -p 5984:5984 \
  couchdb**

  Use username and password "app"  and check the default link for couchdb (http://localhost:5984/_utils)


4. Start Frontend (React + Nginx)

   **docker build -t geology-field-app .**
   
   **docker run -d -p 3000:80 geology-field-app**

    frontend app url - http://localhost:3000




Screenshots 

<img width="2940" height="1764" alt="image" src="https://github.com/user-attachments/assets/7d19252b-cb09-41bf-9b4a-3058de5ecb4e" />

<img width="1470" height="882" alt="image" src="https://github.com/user-attachments/assets/10867e05-8193-4976-a855-771a78e160ec" />

<img width="2940" height="1764" alt="image" src="https://github.com/user-attachments/assets/1ac78238-a22c-4e68-9562-ec4bb9f60006" />







   


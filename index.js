
const express = require("express");
const app = express();
const PORT = 3001;

const path = require("path");
const fs = require("fs");
const filePath = path.resolve("./data/data.json")
const cors = require("cors");

let corOptions = {
    origin: "http://localhost:3000",
    optionSuccessStatus: 200
};

app.use(cors(corOptions));
app.use(express.json())
app.use(express.static("public"));
  
const getResources = () => JSON.parse(fs.readFileSync(filePath));

app.get("/", (req, res) => {
    res.send("Hello World")
})

app.get("/api/resources", (req, res) => {
    const resources = getResources()
    res.send(resources)
});

app.get("/api/activeresource", (req, res) => {
    console.log("In Get Active Resource");
    const resources = getResources()
    const activeResource = resources.find(resource=> resource.status === "active")
    console.log("Active Resource:",activeResource);
    res.send(activeResource)
});

app.get("/api/resources/:id", (req, res) => {
    const resources = getResources()
    const resource = resources.find((item)=>{
        if (item.id == req.params.id){
            console.log("Item Id matches Params Id in Get", );
            return item
        }
    })
    res.send(resource)
});

app.patch("/api/resources/:id", (req, res) => {
    console.log("In Patch");
    const resources = getResources();
    const { id } = req.params;
    console.log("ID is:",id);
    const index = resources.findIndex(resource => {
       return resource.id == id
    });
    const activeResource = resources.find(resource => {
        return resource.status === 'active'
    })

    if (resources[index].status === 'complete') {
        return res.status(422).send("This resource was already completed")
    }
    
    resources[index] = req.body;
  
    if (req.body.status === "active"){
        if (activeResource) {
            return res.status(422).send("There is already an active resource!")
        }

        resources[index].status = "active"
        resources[index].activationTime = new Date()
    }
    fs.writeFile(filePath, JSON.stringify(resources, null, 2), (error) => {
      if (error) {
      console.log("File Write Failed");
        return res.status(422).send("Cannot store data in the file!");
      }
      console.log("File Written");
      return res.send("Data has been updated!");
    })
  })

app.post("/api/resources", (req, res) => {
    console.log("In Post /api/resources");
    let resourcejson = fs.readFileSync(filePath,"utf-8");
    let resources = JSON.parse(resourcejson);
    // console.log("Resource JSON:",);
    let body = req.body
    body.createdAt = new Date();
    body.status = "inactive"
    body.id = resources.length+1
    console.log('New Body:',body);
    resources.unshift(body);
    resourcejson = JSON.stringify(resources,null,2);

    fs.writeFileSync(filePath,resourcejson, (err) => {
        if (err) {
            console.log("Error writing file:",err);
            return res.status(422).send("Cannot store data in file!")
        }
        else{
            console.log("Added new Resource - Server");
            return res.status(200).send("Added new resource")
        }
    });
    
});

app.listen(PORT, () => {
    console.log("Server is listening on:","http://localhost"+PORT)
})
const express = require('express');
const app = express();

const PORT = process.env.PORT || 4001;

//Add Middleware for handling morgan logging
const morgan = require('morgan');
app.use(morgan('dev'));

// Add middleware for handling CORS requests from index.html
const cors = require('cors');
app.use(cors());

// Add middware for parsing request bodies here:
const bodyParser = require('body-parser');

// support parsing of application/json type post data
app.use(bodyParser.json());

//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));


const addEnvelopeToDB = (instance) => {
    const maxIdNumber = db.reduce((prev, current) => {
        return (prev.id > current.id) ? prev.id : current.id
    })
    instance.id = maxIdNumber + 1;
    db.push(instance);
}

const updateEnvelope = (instance) => {
    const instanceIndex = db.findIndex((element) => {
        return element.id === instance.id;
    });
    if (instanceIndex > -1) {
        db[instanceIndex] = instance;
        return db[instanceIndex];
    } else {
        return null;
    }
}

const deleteEnvelope = (id) => {
    let index = db.findIndex((element) => {
        return element.id === id;
    });
    if (index !== -1) {
        db.splice(index, 1);
        return true;
    } else {
        return false;
    }
}

const transferEnvelopeFunds = (to, from, amount) => {
    let toIndex = db.findIndex((element) => {
        return element.id === to.id;
    });
    let fromIndex = db.findIndex((element) => {
        return element.id === from.id;
    })
    if (toIndex !== -1 && fromIndex !== -1) {
        db[toIndex].budget += amount;
        db[fromIndex].budget -= amount;
        return true;
    } else {
        return false;
    }
}

const addFunds = (amount) => {
    if (db.length < 1)
        return false;
    let remainingAmount = amount;
    let totalBudget = 0;
    for (let i = 0; i < db.length; i++) {
        totalBudget += db[i].budget;
    }
    for (let i = 0; i < db.length; i++) {
        let fundsToAdd = 0;
        if (i + 1 === db.length) {
            fundsToAdd = remainingAmount;
        } else {
            fundsToAdd = Math.round((db[i].budget / totalBudget) * amount);
        }
        remainingAmount -= fundsToAdd;
        db[i].budget += fundsToAdd;
    }
    return true;
}


let db = [
    {
        id: 0,
        title: "School",
        budget: 220,
        current: 0
    },
    {
        id: 1,
        title: "Groceries",
        budget: 300,
        current: 0
    },
    {
        id: 2,
        title: "Gas",
        budget: 80,
        current: 0
    },
    {
        id: 3,
        title: "Health",
        budget: 500,
        current: 0
    },
    {
        id: 4,
        title: "Clothing",
        budget: 50,
        current: 0
    },
    {
        id: 5,
        title: "Bills",
        budget: 300,
        current: 0
    },
    {
        id: 6,
        title: "Entertainment",
        budget: 60,
        current: 0
    },
    
]

app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.post('/envelopes', (req, res, next) => {
    const createdEnvlope = addEnvelopeToDB(req.body);
    res.status(201).send(createdEnvlope);
});

app.get('/envelopes', (req, res, next) => {
    if (db) {
        res.status(200).send(db);
    } else {
        res.status(404).send();
    }
});

app.param('envelopeId', (req, res, next, id) => {
    const envelope = db.find((x) => {return x.id === Number(id)});
    if (envelope) {
        req.envelope = envelope;
        next();
    } else {
        res.status(404).send();
    }
});

app.get('/envelope/:envelopeId', (req, res, next) => {
    res.status(200).send(req.envelope);
})

app.put('/envelope/:envelopeId', (req, res, next) => {
    const updatedEnvelope = updateEnvelope(req.body);
    if (updatedEnvelope) {
        res.status(201).send(updatedEnvelope);
    } else {
        res.status(404).send();
    }
});

app.delete('/envelope/:envelopeId', (req, res, next) => {
    let deletedEnvelope = deleteEnvelope(req.envelope.id);
    if (deletedEnvelope) {
        res.status(204).send();
    } else {
        res.status(500).send();
    }
})

app.post('/envelope/transfer/:to/:from', (req, res, next) => {
    const toEnvelope = db.find((x) => {return x.id === Number(req.params.to)});
    const fromEnvelope = db.find((x) => {return x.id === Number(req.params.from)});
    const transferAmount = Number(req.headers['transfer']);
    if (toEnvelope && fromEnvelope && transferAmount) {
        let transferedFunds = transferEnvelopeFunds(toEnvelope, fromEnvelope, transferAmount);
        if (transferedFunds) {
            res.status(201).send();
        } else {
            res.status(500).send();
        }
    } else {
        res.status(404).send();
    }
})

app.post('/envelopes/addFunds', (req, res, next) => {
    const fundsToAdd = Number(req.headers['addfunds']);
    console.log(req.headers);
    if (fundsToAdd) { 
        let addedInFunds = addFunds(fundsToAdd);
        if (addedInFunds) {
            res.status(201).send();
        } else {
            res.status(500).send();
        } 
    } else {
        res.status(404).send();
    }
})

app.listen(PORT, () => {
    console.log(`Server is listening to PORT: ${PORT}`);
});

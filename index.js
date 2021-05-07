
require('dotenv').config()

const express = require('express');

const bodyParser = require('body-parser');

const Airtable  = require('airtable-node');

const port = process.env.PORT || 3000;

const app = express();


app.use(express.json())

app.get('/', (req,res) => {

    res.status(200).json({
        check:'OK'
    })

})


app.get('/airtable',async (req,res) => {

    allData = await getAllDataFromAirtable();

    let finalResponse = [];

    var sampleResponseObj = {
        industry:'',
        deal_type:'',
        deal_size:'',
        stage:'',
        eng_date:'',
        retainer:'',
        client_hq:'',
        company_profile:'',
        comission_size:'',
        desc:'',
        tail_period:'',
        exclusive:'',
        loi_signed:'',
        industry_sub:''
    };

  
    
    
    if(allData.records.length > 0) {

        


        for(var i = 0; i < allData.records.length; i++) {

            var currentRecord = allData.records[i];

            // sampleResponseObj.industry = currentRecord.industry;



            finalResponse.push(currentRecord)

        }


    }


    res.json(finalResponse);

    

});



const getAllDataFromAirtable = () => {

    return new Promise((resolve, reject ) => {

        const airtable = new Airtable({apiKey:process.env.AIRTABLE_API})
            .base(process.env.BASE)
            .table(process.env.TABLE);

                airtable.list({
                    maxRecords:500,
                    pageSize:100,
                    view:'Deals: 2nd Task (S)'
                
                }).then((response) => {

                    resolve(response);
                    

                })


    })
    


}



app.listen(port, () => {
    console.log('Process started at port ',port);
})

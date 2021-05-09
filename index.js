
require('dotenv').config()

const express = require('express');

const bodyParser = require('body-parser');

const Airtable  = require('airtable-node');

const jsonQuery = require('json-query');

const port = process.env.PORT || 3000;

const app = express();




app.use(express.json())

app.get('/', (req,res) => {

    res.status(200).json({
        check:'OK'
    })

})


app.post('/airtable',async (req,res) => {


    // var defaultParams = {
    //     sortBy:[{
    //         field:"",
    //         direction:""
    //     }],
    //     filterBy: [
    //         {
    //             attr:'',
    //             rel:'',
    //             value:''
    //         }
    //     ]
    // };

    // var params = {...defaultParams,...req.body};

    var params = {
        filterBy: []
    };

    

   if("deal_name" in  req.body && req.body.deal_name.length > 0) {

        var dealNamesToFilter = req.body.deal_name.split('|');

        for(var i = 0; i < dealNamesToFilter.length; i++ ) {
                        
            params.filterBy.push(
                {
                    attr:'Deal Name',
                    rel:'=',
                    value:dealNamesToFilter[i]
                }
            )
        }

   }



   if("deal_type" in  req.body && req.body.deal_type.length > 0) {

        var dealNamesToFilter = req.body.deal_type.split('|');

        for(var i = 0; i < dealNamesToFilter.length; i++ ) {
                        
            params.filterBy.push(
                {
                    attr:'Deal Type',
                    rel:'=',
                    value:dealNamesToFilter[i]
                }
            )
        }

    }



    if("industry" in  req.body && req.body.industry.length > 0) {

        var dealNamesToFilter = req.body.industry.split('|');

        for(var i = 0; i < dealNamesToFilter.length; i++ ) {
                        
            params.filterBy.push(
                {
                    attr:'Industry',
                    rel:'=',
                    value:dealNamesToFilter[i]
                }
            )
        }

    }


    if("stage" in  req.body && req.body.stage.length > 0) {

        var dealNamesToFilter = req.body.stage.split('|');

        for(var i = 0; i < dealNamesToFilter.length; i++ ) {
                        
            params.filterBy.push(
                {
                    attr:'Stage',
                    rel:'=',
                    value:dealNamesToFilter[i]
                }
            )
        }

    }





    // console.log(params);
    // res.send({check:"OK"});
    // return;

    allData = await getAllDataFromAirtable(params);

    
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

        var avlFilters = ['Deal Name','Deal Type','Industry','Stage'];


        var recordsArray = [];


        for(var i = 0; i < allData.records.length; i++) {

            var currentRecord = allData.records[i].fields;

        

            if(params.filterBy.length > 0 && params.filterBy[0].attr != '') {
 

                recordValid = false;
                params.filterBy.forEach((elem,index) => {
                    recordValid = searchThroughRecord(elem,currentRecord);

                   
                    if(recordValid) {

                        indexToAdd = avlFilters.indexOf(elem.attr);
                        
                        if(indexToAdd > -1) {
                            if(Array.isArray(recordsArray[indexToAdd])) {
                                recordsArray[indexToAdd].push(currentRecord);
                            } else {
                                recordsArray[indexToAdd] = [];
                                recordsArray[indexToAdd].push(currentRecord);
                            }
                        }


                    }
                
                })
              
                

                 
            } else {

                finalResponse.push(currentRecord)

            }
 


        }


    }

    

    res.json(recordsArray);

    

});


const searchThroughRecord = (elem, currentRecord) => {

                    
        isRecordValid = false;

        
        switch(elem.rel) {

            case '=':
             
                if(isNaN(currentRecord[elem.attr])) {

                   if(typeof currentRecord[elem.attr] == 'string') {
                      
                        if(currentRecord[elem.attr].toLowerCase() == elem.value.toLowerCase() ) {
                            
                            isRecordValid = true;

                        }
                   }
                    

                    if(Array.isArray(currentRecord[elem.attr])) {

                        foundval = [];
                        foundval = currentRecord[elem.attr].find((val) => {

                            if(typeof val == 'string') {
                               
                                if(val.toLowerCase().trim() == elem.value.toLowerCase().trim() ) {
                                   
                                    return true;

                                }
                            }  
                        })
                        
                        if(foundval && foundval.length > 0) {
                           
                            isRecordValid = true;
                        }
                    }


                } else {
                    if(parseFloat(currentRecord[elem.attr]) == parseFloat(elem.value) ) {

                        isRecordValid = true;

                    }
                }
               

                break;

            case 'contain':
                
                if(typeof currentRecord[elem.attr] == 'string') {
                    if(currentRecord[elem.attr].toLowerCase().indexOf(elem.value.toLowerCase()) > -1  ) {

                        isRecordValid = true;

                    }
                }
                
                if(Array.isArray(currentRecord[elem.attr])) {
                   
                    findElements = currentRecord[elem.attr].find((val) => {

                        if(typeof val == 'string') {
                            if(val.toLowerCase() == elem.value.toLowerCase()) {
                                return true;
                            }
                        }
                        

                    });

                    if(findElements.length > 0 ) {
                        isRecordValid = true;
                    }

                }
              

                break;

            case '!=':
                if(isNaN(currentRecord[elem.attr])) {
                    
                    if(currentRecord[elem.attr].toLowerCase() != elem.value.toLowerCase() ) {

                        isRecordValid = true;

                    }
                } else {
                    if(parseFloat(currentRecord[elem.attr]) != parseFloat(elem.value) ) {

                        isRecordValid = true;

                    }
                }

                break;

            case '>':
                if(parseFloat(currentRecord[elem.attr]) > parseFloat(elem.value) ) {

                    isRecordValid = true;

                }

                break;

            case '<':
                if(parseFloat(currentRecord[elem.attr]) < parseFloat(elem.value) ) {

                    isRecordValid = true;

                }

                break;


            default:
                // do nothing

                isRecordValid = false;
                break;

        }


     
    if(isRecordValid == true) {

            
        return true;

    } else {
        return false;
    }

   

}



const getAllDataFromAirtable = (params) => {

    // var defaultParams = {
    //     sortBy:[{
    //         field:"",
    //         direction:""
    //     }],
    //     filterBy: [
    //         {
    //             attr:'',
    //             rel:'',
    //             value:''
    //         }
    //     ]
    // };

    params = {
        maxRecords:500,
        pageSize:100,
        view:'Deals: 2nd Task (S)',
        sort:params.sortBy
    };

    // console.log(params);

    // return;

    return new Promise((resolve, reject ) => {

        const airtable = new Airtable({apiKey:process.env.AIRTABLE_API})
            .base(process.env.BASE)
            .table(process.env.TABLE);

                airtable.list({
                   
                
                }).then((response) => {

                    resolve(response);
                    

                })


    })
    


}



app.listen(port, () => {
    console.log('Process started at port ',port);
})

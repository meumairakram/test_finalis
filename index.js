require('dotenv').config()

const express = require('express');

const bodyParser = require('body-parser');

const Airtable  = require('airtable-node');

const port = process.env.PORT || 3000;

const app = express();

var ldlang = require('lodash/lang');


app.use(express.json())

app.get('/', (req,res) => {

    res.status(200).json({
        check:'OK'
    })

})


app.post('/airtable',async (req,res) => {


    var params = {
        filterBy: []
    };

    
    var filterParams = {
        
    };

    console.log('REQUEST CAME IN',req.body);

    if("deal_industry" in req.body && req.body.deal_industry != '' && req.body.deal_stage != 'null') {
            
        filterParams.deal_industry = req.body.deal_industry;
    }


    
    if("deal_stage" in req.body && req.body.deal_stage != '' && req.body.deal_stage != 'null') {
            
        filterParams.deal_stage = req.body.deal_stage;
    }

    if("deal_type" in req.body && req.body.deal_type != '' && req.body.deal_type != 'null') {
            
        filterParams.deal_type = req.body.deal_type;
    }


    if("deal_size_min" in req.body && req.body.deal_size_min != '' && req.body.deal_size_min != 'null') {
            
        filterParams.deal_size_min = req.body.deal_size_min;
    }

    
    
    if("deal_size_max" in req.body && req.body.deal_size_max != '' && req.body.deal_size_max != 'null') {
            
        filterParams.deal_size_max = req.body.deal_size_max;
    }

    

    

    // console.log(params);
    // res.send({check:"OK"});
    // return;

    allData = await getDataFromSource(params);

    

    
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

    var responseData = [];
    var finalData = await getDataFromSource(null);

    if(finalData.length < 1) {
        return responseData;
    }
    
   


    for(var i = 0; i<finalData.length; i++) {

        var currentRecord = finalData[i].fields;

        valueExists = true;

        if("deal_industry" in filterParams) {

            if(valueExists == true) {
                var valueExists = filterFromRecord(currentRecord,'industry',filterParams.deal_industry);
            }
            
        }


        if("deal_stage" in filterParams) {

            if(valueExists == true) {
                var valueExists = filterFromRecord(currentRecord,'stage',filterParams.deal_stage);
            }
            
        }


        if("deal_type" in filterParams) {
            
            if(valueExists == true) {
                var valueExists = filterFromRecord(currentRecord,'type',filterParams.deal_type);
            }

        }


        
        if("deal_size_min" in filterParams) {
            
            if(valueExists == true) {
                var valueExists = filterFromRecord(currentRecord,'deal_size_min',filterParams.deal_size_min);
            }

        }

        if("deal_size_max" in filterParams) {
            
            if(valueExists == true) {
                var valueExists = filterFromRecord(currentRecord,'deal_size_max',filterParams.deal_size_max);
            }

        }


        
        
        if(valueExists) {
            responseData.push(currentRecord);
        }



    }
    
    res.json(responseData);

    

});



const filterFromRecord = (record, type, value) => {

    var shouldReturnTrue = true;

    switch(type) {

        case 'stage': {
            var valueToCompare = record['Stage'];
            var compareWith = value;

            return compareRecordWithValue(valueToCompare, compareWith);

            break;
        }

        case "type": {
            var valueToCompare = record['Deal Type'];
            var compareWith = value;
            return compareRecordWithValue(valueToCompare, compareWith);

            break;
        }

        case 'industry': {
            var valueToCompare = record['Industry'];
            var compareWith = value;

            return  compareRecordWithValue(valueToCompare, compareWith);
            break;
        }


        case "deal_size_min": {

            var valueToCompare = record['Proposed Deal Size'];
            var compareWith = value;
            
            return  compareRecordValueWithOperator(valueToCompare, compareWith, '>');
            break;


        }


        case "deal_size_max": {

            var valueToCompare = record['Proposed Deal Size'];
            var compareWith = value;

            return  compareRecordValueWithOperator(valueToCompare, compareWith, '<');
            break;


        }



        default:
            // do nothing break;
            break;


    }



}


const compareRecordWithValue = (recordValue, resultValue)  => {
    
    if(ldlang.isString(recordValue)) {

        // handle as string
        if(resultValue.toLowerCase().indexOf(recordValue.toLowerCase()) > -1) {
            return true;
        }

    } 

    if(ldlang.isArray(recordValue)) {
        // handle as array with depth 1
        for(var i = 0; i < recordValue.length; i++) {
            

            if(resultValue.toLowerCase().indexOf(recordValue[i].toLowerCase()) > -1) {
                
                return true;
            }
        }
    }

    if(ldlang.isNumber(recordValue) && ldlang.isFinite(recordValue)) {
        // handle as safe number


    }

    return false;


}



const compareRecordValueWithOperator = (recordValue, resultValue, operator  = '=') => {

    console.log('Comparing ',recordValue);
    // if(!ldlang.isNumber(recordValue) || !ldlang.isNumber(resultValue) || !ldlang.isFinite(recordValue) || !ldlang.isFinite(resultValue)) {

    //     return false;
    // }


    refNumber = parseFloat(recordValue);
    compareNumber = parseFloat(resultValue);

    
    if(operator == '>') {
        return (refNumber > compareNumber);
    } 

    if(operator == '<') {
        return (refNumber < compareNumber);
    } 
    

}


/**
 * Set of Compare Functions
 * @param {} sorting 
 * @returns 
 */




const getDataFromSource = (sorting) => {

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
    };

    if(sorting) {
        params.sort = sorting;
    }


    /** Temporarily OFFF */

    return new Promise((resolve, reject ) => {

        const airtable = new Airtable({apiKey:process.env.AIRTABLE_API})
            .base(process.env.BASE)
            .table(process.env.TABLE);

                airtable.list({
                   
                
                }).then((response) => {
                    
                    resolve(response.records);
                    

                })


    });

    

            // return new Promise((res,rej) => {
            //     res(dummyData);
            // })
}



app.listen(port, () => {
    console.log('Process started at port ',port);
})

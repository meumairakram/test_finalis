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

    if("deal_industry" in req.body && req.body.deal_industry != '' && req.body.deal_industry != 'null') {
            
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


    if("deal_retainer" in req.body && req.body.deal_retainer != '' && req.body.deal_retainer != 'null') {
        // should be yes or no
        filterParams.deal_retainer = req.body.deal_retainer;
    }


    
    if("eng_letter_date_min" in req.body && req.body.eng_letter_date_min != '' && req.body.eng_letter_date_min != 'null') {
        // should be yes or no
        filterParams.eng_letter_date_min = req.body.eng_letter_date_min;
    }


      
    if("eng_letter_date_max" in req.body && req.body.eng_letter_date_max != '' && req.body.eng_letter_date_max != 'null') {
        // should be yes or no
        filterParams.eng_letter_date_max = req.body.eng_letter_date_max;
    }





    // sorting params

    var sort_object = {};

    if("sort_by" in req.body && req.body.sort_by != '' && req.body.sort_by != 'null') {
        sort_object.field = req.body.sort_by;        
    }

    if("sort_direction" in req.body && req.body.sort_direction != '' && req.body.sort_direction != 'null') {
        sort_object.direction = req.body.sort_direction;        
    } else {
        sort_object.direction = "asc";
    }


    

    sortingOrder = [];

    if("field" in sort_object) {

        sortingOrder.push(sort_object);

    }

    // params.sort = [{field: "Deal Name",direction:"asc"}];



    

    // console.log(params);
    // res.send({check:"OK"});
    // return;

    
    

    
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
    var finalData = await getDataFromSource(sortingOrder);

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

        // deal_retainer

        if("deal_retainer" in filterParams) {
            
            if(valueExists == true) {
                var valueExists = filterFromRecord(currentRecord,'deal_retainer',filterParams.deal_retainer);
            }

        }

        if("eng_letter_date_min" in filterParams) {

            if(valueExists == true) {
                var valueExists = filterFromRecord(currentRecord,'eng_letter_date_min',filterParams.eng_letter_date_min);

            }
        }

        if("eng_letter_date_max" in filterParams) {

            if(valueExists == true) {
                var valueExists = filterFromRecord(currentRecord,'eng_letter_date_max',filterParams.eng_letter_date_max);

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

        case 'deal_retainer': {
            var valueToCompare = record['Retainer'];
            var compareWith = value;

            return compareRetainerRecord(valueToCompare, compareWith);
            break;

        }


        case "eng_letter_date_min": {
            var valueToFind = new Date(value);
            timeStampToFind = valueToFind.getTime();

            if(record['Engagement Letter Date'] == '') {
                return false;
            }

            var recordDate =  new Date(record['Engagement Letter Date']);

            var timeStampRecord = recordDate.getTime();


            return compareRecordValueWithOperator(timeStampRecord,timeStampToFind,'>');

            break;
        }

        case "eng_letter_date_max": {

            var valueToFind = new Date(value);
            timeStampToFind = valueToFind.getTime();

            if(record['Engagement Letter Date'] == '') {
                return false;
            }

            var recordDate =  new Date(record['Engagement Letter Date']);

            var timeStampRecord = recordDate.getTime();


            return compareRecordValueWithOperator(timeStampRecord,timeStampToFind,'<');

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



// Retainer Switch
const compareRetainerRecord = (recordValue, resultValue)  => {

    if(!ldlang.isArray(recordValue)) {
        return false;
    }


    for(var i = 0; i < recordValue.length; i++) {
        
        if(ldlang.isString(recordValue[i])) {
            var retainerNumber = recordValue[i];
            
            if(retainerNumber.toLowerCase().indexOf('available') > -1 && resultValue == 0) {
                return true;
            }
            
            retainerNumber = retainerNumber.replace('$','');
            
            retainerNumber = retainerNumber.replace(new RegExp(',','g'),'');

            
            retainerNumber = parseFloat(retainerNumber);
           
            if(retainerNumber > 0 && resultValue == 1) {
                return true;
            }

            if(retainerNumber < 1 && resultValue == 0) {
                return true;
            }

        }
        

    }

    return false;

}



const compareRecordValueWithOperator = (recordValue, resultValue, operator  = '=') => {

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

    // params.sort = [{field: "Deal Name",direction:"asc"}];
    if(sorting) {
        params.sort = sorting;
    }

    console.log(params);
    /** Temporarily OFFF */

    return new Promise((resolve, reject ) => {

        const airtable = new Airtable({apiKey:process.env.AIRTABLE_API})
            .base(process.env.BASE)
            .table(process.env.TABLE);

              
                airtable.list(params).then((response) => {
                    
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

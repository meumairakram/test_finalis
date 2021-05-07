// importing stuff
const express = require('express');
const path = require('path');
const router = express.Router();
const AdmZip = require('adm-zip');

// custom vars imports
const s3 = require('../utils/s3-instance');
const userConfigs = require('../utils/config-vars');


const {
    BUCKET_NAME, 
    getObjectsFromS3,
    getFileContents,
    uploadZipToS3 


} = userConfigs;


// just to serve placeholder homepage calls to ensure server is live.
router.get('/',(req,res) => {
  
	return res.json({success:true})

});


/* Responds with the Following error code mapping | Incase of Error

    * Error 1: No Target File Found
    * Error 2: Cant Connect to AWS S3
    * Error 3: Cant Find the Target File
    * Error 4: Failed Creating Zip File Package.

*/    

/*

    * Success Response Sample

    {
        success:true,
        data: {
            filename: "xyz.zip" 
        }

    }

*/


// handle serve zip creation calls
router.post('/createZip', async (req,res) => {

    // create empty Zip File 
    var zipFile = new AdmZip();

    // get tototal number of files in zip at initialization.
    // console.log('Zip Entries:',zipFile.getEntries().length);

    const targetFileName = req.body.fileName ? req.body.fileName.replace('.m3u8','') : null;

    // if no file name is actually sent, respond with success false;
    if(!targetFileName) {
        let response = sendJsonFailed({
            error:'No Target file name specified.',
            error_code:1
        });

        return res.send(response);
    }



    // get all files matching to that name;
    var getAvailableFileNames = await getObjectsFromS3(targetFileName); 


    // returning correct number of files... Checked


    // if no file is found on S3 respond with error.
    if(getAvailableFileNames.length < 1) {
        let response = sendJsonFailed({
            error:'cant find the specified file on S3.',
            error_code:3
        });

        return res.send(response);
    }


    // check if a zip already exists for the searched file.
    var zipExists = null;
    zipExists = getAvailableFileNames.find((elem) => {

        if(path.extname(elem) == '.zip') {
            return 1;
        }

    });

    if(zipExists) {

        let response = sendJsonSuccess({
            filename: zipExists
        });

        return res.send(response);
    }


    // retuning zip file if exists {checked}





    // incase no zip found, execute zip generation code.

    var zipError = [];
    let zipPromise = await getAvailableFileNames.map(getFileContents);

    Promise.all(zipPromise).then(async (values) => {

        // total number of files for which the data stream is recieved by getfileContents method
        // console.log('Total Files Data recieved for: ',values.length)

        try {
            values.forEach((value, index) => {

                try {
                    // console.log('Added: ',value.fileName);   
                    zipFile.addFile(value.fileName,value.data)
                    
                } catch(e) {

                    zipError.push(e);

                }

                

            })

        } catch(e) {

            console.log('Error while making Zip',e);

        }

        var dataStream = zipFile.toBuffer();
        var zipFileName = `${targetFileName}.zip`;
        
        // console.log('Zip Entries Number:', zipFile.getEntries().length);
        
        // Upload Created Zip File to S3
        var uploadZip =  await uploadZipToS3(dataStream,zipFileName)
        zipFile.writeZip('./test.zip');

       


        // respond with success and file name.
        let response = sendJsonSuccess({    
            filename:zipFileName,
        });

        return res.send(response);



    })
    

    .catch(error => {
        console.log('There is an error getting file data: ',error);


        let response = sendJsonFailed({
            error:'Failed Creating Zip File Package.',
            error_code:4
        });
    
        return res.send(response);
    })



    // zipError length == 0 then zip created successfully.

    if(zipError.length > 0) {

        let response = sendJsonFailed({
            error:'Error Creating Zip File',
            error_code:4
        });

        return res.send(response);

    }

   





});


const sendJsonFailed = (data) => {

    return {
        success:false,
        data: {...data}
    }

}


const sendJsonSuccess = (data) => {

    return {
        success:true,
        data: {
            is_done:1,
            in_progress:1,
            ...data
        }
    }
}


module.exports = router;
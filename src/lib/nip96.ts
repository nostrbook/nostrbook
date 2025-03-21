import type {
    FileUploadResponse,
    OptionalFormDataFields,
    
  } from 'nostr-tools/nip96';

import {readServerConfig} from 'nostr-tools/nip96';
import { getToken } from 'nostr-tools/nip98';
  
import {
       getEventHash,
       type Event,
       nip19,
       getPublicKey,
       generateSecretKey,
       nip04
   } from 'nostr-tools';
import  { finalizeEvent } from 'nostr-tools/pure';   


  export async function doUpload(
    file: File,
    serverApiUrl: string,
    nip98AuthorizationHeader: string,
    optionalFormDataFields?: OptionalFormDataFields,
  ): Promise<FileUploadResponse> {
    // Create FormData object
    const formData = new FormData();
  
    // Append the authorization header to HTML Form Data
    formData.append('Authorization', nip98AuthorizationHeader);
  
    // Append optional fields to FormData
    optionalFormDataFields &&
      Object.entries(optionalFormDataFields).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value);
        }
      });
  
    // Append the file to FormData as the last field
    formData.append('file', file);
  
    // Make the POST request to the server
    const response = await fetch(serverApiUrl, {
      method: 'POST',
      headers: {
        Authorization: nip98AuthorizationHeader,
        //'Content-Type': 'multipart/form-data',// <- これを入れると何故か400エラーになる
      },
      body: formData,
    });
  
    if (response.ok === false) {
      // 413 Payload Too Large
      if (response.status === 413) {
        throw new Error('File too large!');
      }
  
      // 400 Bad Request
      if (response.status === 400) {
        throw new Error('Bad request! Some fields are missing or invalid!');
      }
  
      // 403 Forbidden
      if (response.status === 403) {
        throw new Error(
          'Forbidden! Payload tag does not match the requested file!',
        );
      }
  
      // 402 Payment Required
      if (response.status === 402) {
        throw new Error('Payment required!');
      }
  
      // unknown error
      throw new Error('Unknown error in uploading file!');
    }
  
    try {
        const parsedResponse = await response.json();

    //if (!validateFileUploadResponse(parsedResponse)) {
    //	throw new Error('Invalid response from the server!')// <- わりとInvalidになる
    //}

        return parsedResponse;
    } catch (error) {
        throw new Error('Error parsing JSON response!');
    }


   
  }

//upload file
 


export  async function uploadFile  (url:string,file0:File,Keypriv:Uint8Array)  {

    
  const c = await readServerConfig(url);
  const method = 'POST';
  let apiUrl = c.api_url;

  let event = {
          kind: 27235 ,
          content: '',
          created_at:  Math.floor(Date.now() / 1000),
          tags: [
              ['u', apiUrl],
              ['method', method]
          ]
      }

  event = finalizeEvent(event,Keypriv);
  const s = `Nostr ${btoa(JSON.stringify(event))}`;

 
  if (file0 === undefined) {
    return null;
  }
  const option: OptionalFormDataFields = {
    size: String(file0.size),
    content_type: file0.type,
  };

  if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
     
    apiUrl = url + apiUrl;  
  }
  let response  = await doUpload(file0, apiUrl , s, option);

  return response;
};







  
 
  
  
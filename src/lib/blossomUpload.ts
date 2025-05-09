   
import  { finalizeEvent } from 'nostr-tools/pure';   

import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex as bytesToHex2 } from '@noble/hashes/utils';

export const unixNow = () => Math.floor(Date.now() / 1000);
export const newExpirationValue = () => (unixNow() + 60 * 5).toString();


export function readBlobAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (result == undefined || typeof result !== "object") {
        reject();
        return;
      }
      resolve(result);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}


export async function getFileSha256(file) {
  const buffer = file instanceof File ? await file.arrayBuffer() : await readBlobAsArrayBuffer(file);
  let hash;
  if (crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    hash = new Uint8Array(hashBuffer);
  } else {
    hash = sha256.create().update(new Uint8Array(buffer)).digest();
  }
  return bytesToHex2(hash);
}


export async function doUploadBlossom(
    file: File,
    serverApiUrl: string,
    AuthorizationHeader:string,
  ) {
    // Create FormData object
    const formData = new FormData();
  
    const response = await fetch(serverApiUrl + "upload", {
      method: 'PUT',
      headers: {
        Authorization: AuthorizationHeader,
      },
      body: file,
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


        return parsedResponse;
    } catch (error) {
        throw new Error('Error parsing JSON response!');
    }


   
  }

//upload file
 


export  async function uploadFileBlossom  (url:string,file0:File,Keypriv:Uint8Array)  {

    let sha256Hash = await getFileSha256(file0);
    let event = {
      kind: 24242,
      content: "Authorize Upload",
      created_at: unixNow(),
      tags: [
        ["t",  "upload"],
        ["x", sha256Hash],
        ["expiration", newExpirationValue()],
      ],
    };

 
  event = finalizeEvent(event,Keypriv);
  const s = `Nostr ${btoa(JSON.stringify(event))}`;
 
  let response  = await doUploadBlossom(file0, url , s);
  console.log(response)
  return response;
};







  
 
  
  

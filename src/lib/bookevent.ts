import NDK ,{NDKPrivateKeySigner,NDKRelaySet,NDKEvent} from "@nostr-dev-kit/ndk";
import "websocket-polyfill";
import {booktag,chaptertag} from "./config"

 

export async function createbook(relays,content,Keypriv){

    const ndk = new NDK({
        explicitRelayUrls: relays,
        devWriteRelayUrls:relays,
        signer:new NDKPrivateKeySigner(Keypriv)
    });
    let relaySets =  NDKRelaySet.fromRelayUrls(ndk._explicitRelayUrls, ndk);
    await ndk.connect();

    console.log("connect ok,",content)
    const ndkEvent = new NDKEvent(ndk);
    ndkEvent.kind = 30023;
    ndkEvent.content = JSON.stringify(content);
    ndkEvent.tags = [
                ['t',booktag],
                ['title',content['title']],
                ];
    await ndkEvent.sign()        
    let ret = await ndkEvent.publish(relaySets);
    console.log(ret);
    return ret;
}


export async function booklist ( relays,handlerevent ,pubkey){

    const ndk = new NDK({
        explicitRelayUrls: relays,
        devWriteRelayUrls:relays,
         
    });
    let relaySets =  NDKRelaySet.fromRelayUrls(ndk._explicitRelayUrls, ndk);
    await ndk.connect();
    
    let filters    = {kinds:[30023],'#t': [booktag]}
    if (pubkey) {
        filters.authors = [pubkey];
    }

    let sub = ndk.subscribe(filters,{},relaySets,true)

    sub.on("event" ,handlerevent)
}

export async function createchapter(relays,content,title,filename,bookid,Keypriv){
    const ndk = new NDK({
        explicitRelayUrls: relays,
        devWriteRelayUrls:relays,
        signer:new NDKPrivateKeySigner(Keypriv)
    });
    let relaySets =  NDKRelaySet.fromRelayUrls(ndk._explicitRelayUrls, ndk);
    await ndk.connect();

    const ndkEvent = new NDKEvent(ndk);
    ndkEvent.kind = 30023;
    ndkEvent.content = content;
    ndkEvent.tags = [
                ['t',chaptertag],
                ['title',title],
                ['d',filename + "-" + bookid],
                ['e',bookid],
                ];
    await ndkEvent.sign() 
    let response = await ndkEvent.publish(relaySets,2000,0);
    return response;
}


export async function updatechapter(relays,content,title,filename,bookid,Keypriv){
    const ndk = new NDK({
        explicitRelayUrls: relays,
        devWriteRelayUrls:relays,
        signer:new NDKPrivateKeySigner(Keypriv)
    });
    let relaySets =  NDKRelaySet.fromRelayUrls(ndk._explicitRelayUrls, ndk);
    await ndk.connect();

    const ndkEvent = new NDKEvent(ndk);
    ndkEvent.kind = 30023;
    ndkEvent.content = content;
    ndkEvent.tags = [
                ['t',chaptertag],
                ['title',title],
                ['e',bookid],
                ['d',filename + "-" + bookid]
                ];
    await ndkEvent.sign() 
    let response = await ndkEvent.publish(relaySets,2000,0);
    return response;
}



export async function read_book_chapters ( relays,bookid ,pubkey,handlerevent){

    const ndk = new NDK({
        explicitRelayUrls: relays,
        devWriteRelayUrls:relays,
         
    });
    let relaySets =  NDKRelaySet.fromRelayUrls(ndk._explicitRelayUrls, ndk);
    await ndk.connect();
    console.log("connect..")
    let filters    = {kinds:[30023],'#t': [chaptertag], "#e":[bookid]}
    if (pubkey) {
        filters.authors = [pubkey];
    }
    console.log(filters);

    let sub = ndk.subscribe(filters,{},relaySets,true)

    sub.on("event" ,handlerevent)

}


export async function read_chapter ( relays,bookid,chapterid ,pubkey,handlerevent){

    const ndk = new NDK({
        explicitRelayUrls: relays,
        devWriteRelayUrls:relays,
         
    });
    let relaySets =  NDKRelaySet.fromRelayUrls(ndk._explicitRelayUrls, ndk);
    await ndk.connect();
    console.log("connect..")
    let filters    = {kinds:[30023],"#e":[bookid]}
    if (pubkey) {
        filters.authors = [pubkey];
    }
    if (chapterid)
    {
        filters.ids = [chapterid];
    }

    console.log(filters);

    let sub = ndk.subscribe(filters,{},relaySets,true)

    sub.on("event" ,handlerevent)

}

export async function read_chapter_docs ( relays,bookid,filename,handlerevent){

    const ndk = new NDK({
        explicitRelayUrls: relays,
        devWriteRelayUrls:relays,
         
    });
    let relaySets =  NDKRelaySet.fromRelayUrls(ndk._explicitRelayUrls, ndk);
    await ndk.connect();
    console.log("connect..")
    let filters    = {kinds:[30023],"#e":[bookid],"#d":[filename + "-" + bookid ]}
 
    console.log(filters);

    let sub = ndk.subscribe(filters,{},relaySets,true)

    sub.on("event" ,handlerevent)

}

export async function like_chapter(relays,bookid,mdfile,Keypriv){

    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error('timeout'));
        }, 10000); // 10 秒超时
    });
    
    const contentPromise = new Promise<string>((resolve) => {
        read_chapter_docs(relays, bookid, mdfile, (e) => resolve(e));
    });
    
    try {
        const e = await Promise.race([contentPromise, timeoutPromise]);

        const ndk = new NDK({
            explicitRelayUrls: relays,
            devWriteRelayUrls:relays,
            signer:new NDKPrivateKeySigner(Keypriv)
        });
        let relaySets =  NDKRelaySet.fromRelayUrls(ndk._explicitRelayUrls, ndk);
        await ndk.connect();
    
        const ndkEvent = new NDKEvent(ndk);
        ndkEvent.kind = 7;
        ndkEvent.content = "+";
        ndkEvent.tags = [
                    ['e',e.id],
                    ['p',e.pubkey],
                    ];
        await ndkEvent.sign() 
        let response = await ndkEvent.publish(relaySets,2000,0);
        return response;
    } catch (error) {
        return null;
    }
}

export async function comment_chapter(relays,bookid,mdfile,content,Keypriv){

    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error('timeout'));
        }, 10000); // 10 秒超时
    });
    
    const contentPromise = new Promise<string>((resolve) => {
        read_chapter_docs(relays, bookid, mdfile, (e) => resolve(e));
    });
    
    try {
        const e = await Promise.race([contentPromise, timeoutPromise]);

        const ndk = new NDK({
            explicitRelayUrls: relays,
            devWriteRelayUrls:relays,
            signer:new NDKPrivateKeySigner(Keypriv)
        });
        let relaySets =  NDKRelaySet.fromRelayUrls(ndk._explicitRelayUrls, ndk);
        await ndk.connect();
    
        const ndkEvent = new NDKEvent(ndk);
        ndkEvent.kind = 1;
        ndkEvent.content = content;
        ndkEvent.tags = [
                    ['e',e.id],
                    ['p',e.pubkey],
                    ];
        await ndkEvent.sign() 
        let response = await ndkEvent.publish(relaySets,2000,0);
        return response;            
    } catch (error) {
        return null;
    }
}
import NDK ,{NDKPrivateKeySigner,NDKRelaySet,NDKEvent} from "@nostr-dev-kit/ndk";
import "websocket-polyfill";

 

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
                ['t','createbook'],
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
    
    let filters    = {kinds:[30023],'#t': ['createbook']}
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
                ['t','bookchapter'],
                ['title',title],
                ['d',filename],
                ['e',bookid],
                ];
    await ndkEvent.sign() 
    let response = await ndkEvent.publish(relaySets,2000,0);
    return response;
}


export async function updatechapter(relays,content,title,filename,bookid,d,Keypriv){
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
                ['t','bookchapter'],
                ['title',title],
                ['e',bookid],
                ['d',filename]
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
    let filters    = {kinds:[30023],'#t': ['bookchapter'], "#e":[bookid]}
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
    let filters    = {kinds:[30023],"#e":[bookid],"#d":[filename]}
 
    console.log(filters);

    let sub = ndk.subscribe(filters,{},relaySets,true)

    sub.on("event" ,handlerevent)

}
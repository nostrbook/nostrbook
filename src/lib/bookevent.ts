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

    const ndkEvent = new NDKEvent(ndk);
    ndkEvent.kind = 30023;
    ndkEvent.content = JSON.stringify(content);
    ndkEvent.tags = [
                ['t','createbook'],
                ['title',content['title']],
                ];
    //await ndkEvent.sign()
    let ok = await ndkEvent.publish(relaySets,2000,0);

}


export async function booklist ( relays,handlerevent ){

    const ndk = new NDK({
        explicitRelayUrls: relays,
        devWriteRelayUrls:relays,
         
    });
    let relaySets =  NDKRelaySet.fromRelayUrls(ndk._explicitRelayUrls, ndk);
    await ndk.connect();
    let filters    = {kinds:[30023],'#t': ['createbook']}

    let sub = ndk.subscribe(filters,{},relaySets,true)

    sub.on("event" ,handlerevent)
}

export async function createchapter(relays,content,title,bookid,Keypriv){
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
                ];
    
    let ok = await ndkEvent.publish(relaySets,2000,0);
}


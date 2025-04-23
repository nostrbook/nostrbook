import NDK ,{NDKPrivateKeySigner,NDKRelaySet,NDKEvent} from "@nostr-dev-kit/ndk";
import "websocket-polyfill";
import {booktag,chaptertag,blogtag} from "./config"

 
// 公共函数：初始化 NDK 实例
function initNDK(relays, Keypriv) {
    const ndkConfig = {
        explicitRelayUrls: relays,
        devWriteRelayUrls: relays
    };

    if (Keypriv) {
        ndkConfig.signer = new NDKPrivateKeySigner(Keypriv);
    }

    const ndk = new NDK(ndkConfig);
    return ndk;
}

export async function createbook(relays,content,tags,Keypriv){

    const ndk =  initNDK(relays,Keypriv);

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

    if (tags) ndkEvent.tags = tags;        
        
    await ndkEvent.sign()        
    let ret = await ndkEvent.publish(relaySets);
    console.log(ret);
    return ret;
}

export async function getbook(relays,bookid,handlerevent){
    const ndk =  initNDK(relays);

    let relaySets =  NDKRelaySet.fromRelayUrls(ndk._explicitRelayUrls, ndk);
    await ndk.connect();
    let filters    = {kinds:[30023],'ids': [bookid]}

    let sub = ndk.subscribe(filters,{},relaySets,true)

    sub.on("event" ,handlerevent)


    setTimeout(() => {
        // 关闭订阅
        sub.stop();
        console.log('Subscription has been closed.');
    }, 20000); // 20 秒后关闭订阅

}

export async function booklist ( relays,handlerevent ,pubkey){

    const ndk =  initNDK(relays);
    let relaySets =  NDKRelaySet.fromRelayUrls(ndk._explicitRelayUrls, ndk);
    await ndk.connect();
    
    let filters    = {kinds:[30023],'#t': [booktag]}
    if (pubkey) {
        filters.authors = [pubkey];
    }

    let sub = ndk.subscribe(filters,{},relaySets,true)

    sub.on("event" ,handlerevent)


    setTimeout(() => {
        // 关闭订阅
        sub.stop();
        console.log('Subscription has been closed.');
    }, 20000); // 20 秒后关闭订阅
}

export async function createchapter(relays,content,title,filename,bookid,Keypriv){

    const ndk =  initNDK(relays,Keypriv);
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

    const ndk =  initNDK(relays,Keypriv);
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

    const ndk =  initNDK(relays);
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

    setTimeout(() => {
        // 关闭订阅
        sub.stop();
        console.log('Subscription has been closed.');
    }, 10000); // 10 秒后关闭订阅

}


export async function read_chapter ( relays,bookid,chapterid ,pubkey,handlerevent){

    const ndk =  initNDK(relays );

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

    setTimeout(() => {
        // 关闭订阅
        sub.stop();
        console.log('Subscription has been closed.');
    }, 10000); // 10 秒后关闭订阅

}

export async function read_chapter_docs ( relays,bookid,filename,handlerevent){

    const ndk =  initNDK(relays);
    let relaySets =  NDKRelaySet.fromRelayUrls(ndk._explicitRelayUrls, ndk);
    await ndk.connect();
    console.log("connect..")
    let filters    = {kinds:[30023],"#e":[bookid],"#d":[filename + "-" + bookid ]}
 
    console.log(filters);

    let sub = ndk.subscribe(filters,{},relaySets,true)

    sub.on("event" ,handlerevent)

    setTimeout(() => {
        // 关闭订阅
        sub.stop();
        console.log('Subscription has been closed.');
    }, 10000); // 10 秒后关闭订阅
}

export async function like_chapter(relays, bookid, mdfile, isVote,Keypriv) {
    console.log("like_chapter",bookid,mdfile ,isVote); 
    //如果已经点赞就删除点赞
    if (isVote && isVote.id){
         
        const ndk = initNDK(relays, Keypriv);
        const relaySets = NDKRelaySet.fromRelayUrls(ndk._explicitRelayUrls, ndk);
        await ndk.connect();
    
        const ndkEvent = new NDKEvent(ndk);
        ndkEvent.kind = 5;
        ndkEvent.content = "This reaction will be deleted!";
        ndkEvent.tags = [
            ['e', isVote.id],
        ];
       
        await ndkEvent.sign();
       
        ndkEvent.publish(relaySets, 2000, 0);

        return null;
    }

    // 点赞
 
    const ndk = initNDK(relays, Keypriv);
    const relaySets = NDKRelaySet.fromRelayUrls(ndk._explicitRelayUrls, ndk);
    await ndk.connect();

    const ndkEvent = new NDKEvent(ndk);
    ndkEvent.kind = 7;
    ndkEvent.content = "+";
    ndkEvent.tags = [
        ['t', mdfile+'-'+bookid],
 
    ];
   
    await ndkEvent.sign();
   
    ndkEvent.publish(relaySets, 2000, 0);

    return ndkEvent;

}

// 评论章节
export async function comment_chapter(relays, bookid, mdfile, content , Keypriv) {
 
    const ndk = initNDK(relays, Keypriv);
    const relaySets = NDKRelaySet.fromRelayUrls(ndk._explicitRelayUrls, ndk);
    await ndk.connect();

    const ndkEvent = new NDKEvent(ndk);
    ndkEvent.kind = 1;
    ndkEvent.content = content;
    ndkEvent.tags = [
        ['t', mdfile+'-'+bookid],
    ];
    try {
        await ndkEvent.sign();
        const response = await ndkEvent.publish(relaySets, 2000, 0);
        return response;
    } catch (error) {
        return null;
    }
}

// 获取章节评论
export async function get_comments_chapter(relays, bookid, mdfile,   handlerevent) {


    const ndk = initNDK(relays);
    const relaySets = NDKRelaySet.fromRelayUrls(ndk._explicitRelayUrls, ndk);
    await ndk.connect();

    const filters = [
        {
            kinds: [7],
            "#t": [mdfile+'-'+bookid]
        },
        {
            kinds: [1],
            "#q": [mdfile+'-'+bookid]
        },
        {
            kinds: [1],
            "#t": [mdfile+'-'+bookid]
        }
    ];

    const sub  = ndk.subscribe(filters,{},relaySets,true);

    // 处理接收到的事件
    sub.on('event', async (event) => {

        await handlerevent(event);
    });

}


//blog
export async function createblog(relays,content,title,cover,Keypriv){

    const ndk =  initNDK(relays,Keypriv);
    let relaySets =  NDKRelaySet.fromRelayUrls(ndk._explicitRelayUrls, ndk);
    await ndk.connect();

    const ndkEvent = new NDKEvent(ndk);
    ndkEvent.kind = 30023;
    ndkEvent.content = content;
    ndkEvent.tags = [
                ['t',blogtag],
                ['title',title],
                ];
                
    if (cover) {
        ndkEvent.tags.push(['cover',cover]);
    }
                        
    await ndkEvent.sign() 

    let response = await ndkEvent.publish(relaySets,2000,0);
    return response;
}

export async function updateblog(relays,content,title,cover,dtag,Keypriv){

    const ndk =  initNDK(relays,Keypriv);
    let relaySets =  NDKRelaySet.fromRelayUrls(ndk._explicitRelayUrls, ndk);
    await ndk.connect();

    const ndkEvent = new NDKEvent(ndk);
    ndkEvent.kind = 30023;
    ndkEvent.content = content;
    ndkEvent.tags = [
                ['t',blogtag],
                ['title',title],
                ['d',dtag],
                ];
                
    if (cover) {
        ndkEvent.tags.push(['cover',cover]);
    }
                        
    await ndkEvent.sign() 

    let response = await ndkEvent.publish(relaySets,2000,0);
    return response;
}


export async function readblog(relays,blogid,handlerevent ){

    const ndk =  initNDK(relays);
    let relaySets =  NDKRelaySet.fromRelayUrls(ndk._explicitRelayUrls, ndk);
    await ndk.connect();

    let filters    = {kinds:[30023],'#t': [blogtag],ids:[blogid]}
 
    let sub = ndk.subscribe(filters,{},relaySets,true)
                        
    sub.on("event" ,handlerevent)


    setTimeout(() => {
        // 关闭订阅
        sub.stop();
        console.log('Subscription has been closed.');
    }, 20000); // 20 秒后关闭订阅
}

export async function bloglist ( relays,handlerevent,pubkey){

    const ndk =  initNDK(relays);
    let relaySets =  NDKRelaySet.fromRelayUrls(ndk._explicitRelayUrls, ndk);
    await ndk.connect();
    
    let filters    = {kinds:[30023],'#t': [blogtag]}
    if (pubkey) {
        filters.authors = [pubkey];
    }

    let sub = ndk.subscribe(filters,{},relaySets,true)

    sub.on("event" ,handlerevent)


    setTimeout(() => {
        // 关闭订阅
        sub.stop();
        console.log('Subscription has been closed.');
    }, 20000); // 20 秒后关闭订阅
}
import type { Event } from 'nostr-tools';
import { get } from 'svelte/store';
export class WebStorage {
	public constructor(private readonly storage: Storage) {}

	public get(key: string): string | null {
		return this.storage.getItem(`nostrbook:${key}`);
	}

	public set(key: string, value: string): void {
		this.storage.setItem(`nostrbook:${key}`, value);
	}

	public remove(key: string): void {
		this.storage.removeItem(`nostrbook:${key}`);
	}

	public clear(): void {
		this.storage.clear();
	}

	public getReplaceableEvent(kind: number): Event | undefined {
		const json = this.get(`kind:${kind}`);
		if (json === null) {
			return undefined;
		}
		try {
			return JSON.parse(json);
		} catch (error) {
			console.error('[invalid event]', error);
			return undefined;
		}
	}

	public setReplaceableEvent(event: Event): void {
		if (event.pubkey !== get(pubkey)) {
			throw new Error('Logic error');
		}
		const cache = this.getReplaceableEvent(event.kind);
		if (cache === undefined || cache.created_at < event.created_at) {
			this.set(`kind:${event.kind}`, JSON.stringify(event));
			this.setCachedAt();
		}
	}

	public getParameterizedReplaceableEvent(kind: number, identifier: string): Event | undefined {
		const json = this.get(`kind:${kind}:${identifier}`);
		if (json === null) {
			return undefined;
		}
		try {
			return JSON.parse(json);
		} catch (error) {
			console.error('[invalid event]', error);
			return undefined;
		}
	}

	public setParameterizedReplaceableEvent(event: Event): void {
		if (event.pubkey !== get(pubkey)) {
			throw new Error('Logic error');
		}
		const identifier = findIdentifier(event.tags);
		if (identifier === undefined) {
			return;
		}
		const cache = this.getParameterizedReplaceableEvent(event.kind, identifier);
		if (cache === undefined || cache.created_at < event.created_at) {
			this.set(`kind:${event.kind}:${identifier}`, JSON.stringify(event));
			this.setCachedAt();
		}
	}

	public getCachedAt(): number | null {
		const cachedAt = this.get('cached_at');
		return cachedAt === null ? null : Number(cachedAt);
	}

	private setCachedAt() {
		const now = Math.floor(Date.now() / 1000);
		this.set('cached_at', `${now}`);
	}
}


//draft

// 定义一个辅助函数，用于生成 localStorage 的键名
function generateKey(category, draftId) {
    return `draft_${category}_${draftId}`;
}

/**
 * 保存草稿到 localStorage
 * @param {string} category - 草稿的分类，如 'blog', 'chapter' 等
 * @param {string} draftId - 草稿的唯一标识符
 * @param {any} draftData - 草稿的数据
 */
export function saveDraft(category, draftId, draftData) {
    try {
        const key = generateKey(category, draftId);
        const serializedData = JSON.stringify(draftData);
        localStorage.setItem(key, serializedData);
        console.log(`分类 ${category} 下的草稿 ${draftId} 已保存`);
    } catch (error) {
        console.error(`保存分类 ${category} 下的草稿 ${draftId} 时出错:`, error);
    }
}

/**
 * 从 localStorage 获取草稿
 * @param {string} category - 草稿的分类
 * @param {string} draftId - 草稿的唯一标识符
 * @returns {any|null} - 草稿的数据，如果不存在则返回 null
 */
export  function getDraft(category, draftId) {
    try {
        const key = generateKey(category, draftId);
        const serializedData = localStorage.getItem(key);
        if (serializedData) {
            return JSON.parse(serializedData);
        }
        return null;
    } catch (error) {
        console.error(`获取分类 ${category} 下的草稿 ${draftId} 时出错:`, error);
        return null;
    }
}

/**
 * 从 localStorage 删除草稿
 * @param {string} category - 草稿的分类
 * @param {string} draftId - 草稿的唯一标识符
 */
export  function deleteDraft(category, draftId) {
    try {
        const key = generateKey(category, draftId);
        localStorage.removeItem(key);
        console.log(`分类 ${category} 下的草稿 ${draftId} 已删除`);
    } catch (error) {
        console.error(`删除分类 ${category} 下的草稿 ${draftId} 时出错:`, error);
    }
}

/**
 * 获取指定分类下所有草稿的 ID
 * @param {string} category - 草稿的分类
 * @returns {string[]} - 指定分类下所有草稿的 ID 数组
 */
export  function getDraftIdsByCategory(category) {
    const draftIds = [];
    const prefix = `draft_${category}_`;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(prefix)) {
            const draftId = key.replace(prefix, '');
            draftIds.push(draftId);
        }
    }
    return draftIds;
}

/**
 * 获取指定分类下所有草稿的数据
 * @param {string} category - 草稿的分类
 * @returns {Object} - 指定分类下所有草稿的数据对象，键为草稿 ID，值为草稿数据
 */
export function getDraftsByCategory(category) {
    const allDrafts = [];
    const draftIds = getDraftIdsByCategory(category);
    draftIds.forEach((draftId) => {
        const draftData = getDraft(category, draftId);
        if (draftData) {
			draftData['id'] = draftId;
            allDrafts.push(draftData);
        }
    });
    return allDrafts;
}
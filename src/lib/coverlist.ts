import fs from 'fs';
import path from 'path';

// 定义允许的图片扩展名类型
type ImageExtension = '.png' | '.jpg' | '.jpeg' | '.bmp' | '.svg' | '.gif' | '.webp';

// 定义允许的图片扩展名集合
const ALLOWED_EXTENSIONS: Set<ImageExtension> = new Set([
    '.png',
    '.jpg',
    '.jpeg',
    '.bmp',
    '.svg',
    '.gif',
    '.webp'
]);

/**
 * 获取指定目录下的图片文件列表
 * @param directoryPath 要扫描的目录路径
 * @returns 图片文件名数组
 * @throws 当目录不存在或无法读取时抛出错误
 */
export function getimglist(directoryPath: string): string[] {
    // 验证路径是否存在
    if (!fs.existsSync(directoryPath)) {
        throw new Error(`Directory does not exist: ${directoryPath}`);
    }

    // 验证是否是目录
    if (!fs.statSync(directoryPath).isDirectory()) {
        throw new Error(`Path is not a directory: ${directoryPath}`);
    }

    try {
        const files = fs.readdirSync(directoryPath);
        const imglist: string[] = [];

        files.forEach((file) => {
            const ext = path.extname(file).toLowerCase() as ImageExtension;
            if (ALLOWED_EXTENSIONS.has(ext)) {
                imglist.push(file);
            }
        });

        return imglist;
    } catch (error) {
        throw new Error(`Failed to read directory: ${directoryPath}. ${error instanceof Error ? error.message : String(error)}`);
    }
}
 
 
const projectRoot = path.resolve(__dirname, '../../');
const thumbnailDir = path.join(projectRoot, 'static', 'img', 'thumbnail');
try {
    const imageList = getimglist(thumbnailDir);
    console.log(imageList);
} catch (error) {
    console.error(error.message);
}
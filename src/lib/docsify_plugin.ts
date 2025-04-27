export function processMarkdownImages(content) {
    const regex = /!\[(.*?)\]\((.*?)\)(\{.*?\})?/g;
    return content.replace(regex, (match, alt, src, classInfo) => {
        if (classInfo) {
            const classNames = classInfo.match(/\.([a-zA-Z0-9_-]+)/);
            if (classNames) {
                const className = classNames[1];
                return `<img src="${src}" alt="${alt}" class="${className}">`;
            }
        }
        return match;
    });
}

// 定义 Docsify 插件
export const imgClassPlugin = function (hook, vm) {
    hook.mounted(function () {
        // 在文档挂载后，在每次渲染前执行处理逻辑
        hook.beforeEach(function (content) {
            return processMarkdownImages(content);
        });
    });
};

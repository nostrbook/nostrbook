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


// 处理代码复制的函数
export function copyCodeToClipboard(code) {
    const textArea = document.createElement('textarea');
    textArea.value = code;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
}

export function codeCopy(){
    
        const style = document.createElement('style');
        style.textContent = `
            pre[data-lang]::after {
                display: none !important;
                content: none !important;
            }
        `;
        document.head.appendChild(style);
        
        const codeBlocks = document.querySelectorAll('pre code');
        codeBlocks.forEach((codeBlock) => {
            const pre = codeBlock.parentNode;
            
            // Skip if already has a top bar
            if (pre.querySelector('.code-top-bar')) return;

            // 创建顶栏元素
            const topBar = document.createElement('div');
            topBar.classList.add('code-top-bar');
            Object.assign(topBar.style, {
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                height: '36px',
                backgroundColor: '#f5f7fa',
                borderBottom: '1px solid #e1e4e8',
                borderTopLeftRadius: '6px',
                borderTopRightRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 12px',
                boxSizing: 'border-box'
            });

            // 左侧容器用于语言标签
            const leftContainer = document.createElement('div');
            Object.assign(leftContainer.style, {
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            });
            topBar.appendChild(leftContainer);

            // 从 data-lang 属性获取语言类型
            const language = pre.getAttribute('data-lang') || 
                           codeBlock.className.match(/language-(\w+)/)?.[1] || 
                           'code';
            
            // 语言标签
            const languageTag = document.createElement('span');
            languageTag.textContent = language;
            Object.assign(languageTag.style, {
                fontSize: '12px',
                fontWeight: '600',
                color: '#6a737d',
                fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                textTransform: 'capitalize' // 首字母大写
            });
            leftContainer.appendChild(languageTag);

            // 右侧容器用于复制按钮
            const rightContainer = document.createElement('div');
            topBar.appendChild(rightContainer);

            const copyButton = document.createElement('button');
            copyButton.textContent = 'Copy';
            copyButton.classList.add('copy-button');
            copyButton.addEventListener('click', () => {
                const code = codeBlock.textContent;
                copyCodeToClipboard(code);
                copyButton.textContent = 'Copied!';
                setTimeout(() => {
                    copyButton.textContent = 'Copy';
                }, 2000);
            });
            
            // 复制按钮样式
            Object.assign(copyButton.style, {
                border: '1px solid #d1d5da',
                borderRadius: '4px',
                padding: '4px 12px',
                backgroundColor: '#f6f8fa',
                color: '#24292e',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                outline: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
            });

            // 复制图标
            const icon = document.createElement('span');
            icon.textContent = '⎘';
            icon.style.fontSize = '14px';
            copyButton.prepend(icon);

            // 交互效果
            copyButton.addEventListener('mouseenter', () => {
                copyButton.style.backgroundColor = '#f3f4f6';
                copyButton.style.borderColor = '#d1d5da';
            });

            copyButton.addEventListener('mouseleave', () => {
                copyButton.style.backgroundColor = '#f6f8fa';
                copyButton.style.borderColor = '#d1d5da';
            });

            copyButton.addEventListener('mousedown', () => {
                copyButton.style.transform = 'scale(0.98)';
                copyButton.style.backgroundColor = '#e9ecef';
            });

            copyButton.addEventListener('mouseup', () => {
                copyButton.style.transform = 'scale(1)';
                copyButton.style.backgroundColor = '#f3f4f6';
            });

            rightContainer.appendChild(copyButton);
            pre.appendChild(topBar);
            
            // 调整 pre 元素的样式
            Object.assign(pre.style, {
                position: 'relative',
                paddingTop: '36px',
                border: '1px solid #e1e4e8',
                borderRadius: '6px',
                backgroundColor: '#f6f8fa',
                margin: '16px 0'
            });

            // 移除可能由其他插件添加的语言标签
            const existingLangTags = pre.querySelectorAll('[data-lang-rendered]');
            existingLangTags.forEach(tag => tag.remove());
        });
}

// 定义 Docsify 插件
export const codeCopyPlugin = function (hook, vm) {
    hook.doneEach(() => {
        codeCopy();
    });
};

